import { Building, CreateBuildingRequest } from '../types'
import { getBuildingsContainer } from '../config/database'

// Find building by ID
export const findBuildingById = async (id: string): Promise<Building | null> => {
  try {
    const buildingsContainer = getBuildingsContainer()
    const { resource: building } = await buildingsContainer.item(id, id).read()
    return building || null
  } catch (error) {
    console.error('Error finding building by ID:', error)
    throw error
  }
}

// Get all buildings
export const getAllBuildings = async (): Promise<Building[]> => {
  try {
    const buildingsContainer = getBuildingsContainer()
    const query = {
      query: 'SELECT * FROM c ORDER BY c.createdAt DESC'
    }

    const { resources: buildings } = await buildingsContainer.items.query(query).fetchAll()
    return buildings
  } catch (error) {
    console.error('Error getting all buildings:', error)
    throw error
  }
}

// Get buildings with pagination (faster response)
export const getBuildingsWithPagination = async (page: number, limit: number): Promise<{
  buildings: Building[];
  total: number;
}> => {
  try {
    const buildingsContainer = getBuildingsContainer()
    
    // Get total count
    const countQuery = {
      query: 'SELECT VALUE COUNT(1) FROM c'
    }
    const { resources: countResult } = await buildingsContainer.items.query(countQuery).fetchAll()
    const total = countResult[0] || 0

    // For Cosmos DB, we need to get all buildings and then paginate in memory
    // since OFFSET/LIMIT might not be supported in all Cosmos DB configurations
    const allBuildingsQuery = {
      query: 'SELECT * FROM c ORDER BY c.createdAt DESC'
    }
    
    const { resources: allBuildings } = await buildingsContainer.items.query(allBuildingsQuery).fetchAll()
    
    // Apply pagination in memory
    const offset = (page - 1) * limit
    const buildings = allBuildings.slice(offset, offset + limit)
    
    // Debug logging
    console.log(`Pagination debug: page=${page}, limit=${limit}, offset=${offset}, total=${total}, allBuildings=${allBuildings.length}, returned=${buildings.length}`)
    
    return { buildings, total }
  } catch (error) {
    console.error('Error getting buildings with pagination:', error)
    throw error
  }
}

// Get buildings by admin ID
export const getBuildingsByAdminId = async (adminId: string): Promise<Building[]> => {
  try {
    const buildingsContainer = getBuildingsContainer()
    const query = {
      query: 'SELECT * FROM c WHERE c.adminId = @adminId ORDER BY c.createdAt DESC',
      parameters: [{ name: '@adminId', value: adminId }]
    }

    const { resources: buildings } = await buildingsContainer.items.query(query).fetchAll()
    return buildings
  } catch (error) {
    console.error('Error getting buildings by admin ID:', error)
    throw error
  }
}

// Get buildings by client ID
export const getBuildingsByClientId = async (clientId: string): Promise<Building[]> => {
  try {
    const buildingsContainer = getBuildingsContainer()
    const query = {
      query: 'SELECT * FROM c WHERE c.clientId = @clientId ORDER BY c.createdAt DESC',
      parameters: [{ name: '@clientId', value: clientId }]
    }

    const { resources: buildings } = await buildingsContainer.items.query(query).fetchAll()
    return buildings
  } catch (error) {
    console.error('Error getting buildings by client ID:', error)
    throw error
  }
}

// Get buildings by property ID
export const getBuildingsByPropertyId = async (propertyId: string): Promise<Building[]> => {
  try {
    const buildingsContainer = getBuildingsContainer()
    const query = {
      query: 'SELECT * FROM c WHERE c.propertyId = @propertyId ORDER BY c.createdAt DESC',
      parameters: [{ name: '@propertyId', value: propertyId }]
    }

    const { resources: buildings } = await buildingsContainer.items.query(query).fetchAll()
    return buildings
  } catch (error) {
    console.error('Error getting buildings by property ID:', error)
    throw error
  }
}

// Create new building
export const createBuilding = async (buildingData: Building): Promise<Building> => {
  try {
    const buildingsContainer = getBuildingsContainer()
    const { resource: createdBuilding } = await buildingsContainer.items.create(buildingData)
    
    if (!createdBuilding) {
      throw new Error('Failed to create building')
    }
    
    return createdBuilding
  } catch (error) {
    console.error('Error creating building:', error)
    throw error
  }
}

// Update building
export const updateBuilding = async (id: string, buildingData: Partial<Building>): Promise<Building> => {
  try {
    const buildingsContainer = getBuildingsContainer()
    const { resource: building } = await buildingsContainer.item(id, id).read()
    if (!building) {
      throw new Error('Building not found')
    }

    const updatedBuilding = {
      ...building,
      ...buildingData,
      updatedAt: new Date()
    }

    const { resource: result } = await buildingsContainer.item(id, id).replace(updatedBuilding)
    if (!result) {
      throw new Error('Failed to update building')
    }
    return result
  } catch (error) {
    console.error('Error updating building:', error)
    throw error
  }
}

// Calculate building statistics with optimized database queries
export const calculateBuildingStatistics = async (filters?: {
  propertyId?: string;
  clientId?: string;
  search?: string;
}): Promise<{
  totalBuildings: number;
  totalArea: number;
  totalMaintenanceCost: {
    doors: number;
    floors: number;
    windows: number;
    walls: number;
    roofs: number;
    areas: number;
  };
  maintenanceUpdates: number;
}> => {
  try {
    const buildingsContainer = getBuildingsContainer()
    const { getPricelistContainer } = await import('../config/database')
    const pricelistContainer = getPricelistContainer()
    
    // Build WHERE clause for filters
    let whereClause = ''
    let parameters: any[] = []
    
    if (filters) {
      const conditions: string[] = []
      
      if (filters.propertyId) {
        conditions.push('c.propertyId = @propertyId')
        parameters.push({ name: '@propertyId', value: filters.propertyId })
      }
      
      if (filters.clientId) {
        conditions.push('c.clientId = @clientId')
        parameters.push({ name: '@clientId', value: filters.clientId })
      }
      
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase()
        conditions.push('(CONTAINS(LOWER(c.name), @search) OR CONTAINS(LOWER(c.description), @search) OR CONTAINS(LOWER(c.metadata.buildingType), @search))')
        parameters.push({ name: '@search', value: searchTerm })
      }
      
      if (conditions.length > 0) {
        whereClause = `WHERE ${conditions.join(' AND ')}`
      }
    }
    
    // Get total buildings and area in one optimized query
    const statsQuery = {
      query: `
        SELECT 
          COUNT(1) as totalBuildings,
          SUM(c.metadata.totalArea) as totalArea
        FROM c ${whereClause}
      `,
      parameters
    }
    
    const { resources: statsResult } = await buildingsContainer.items.query(statsQuery).fetchAll()
    const stats = statsResult[0] || { totalBuildings: 0, totalArea: 0 }
    
    const totalBuildings = stats.totalBuildings || 0
    const totalArea = stats.totalArea || 0
    
    // Get building IDs for maintenance cost calculation
    const buildingIdsQuery = {
      query: `SELECT c.id FROM c ${whereClause}`,
      parameters
    }
    
    const { resources: buildingIds } = await buildingsContainer.items.query(buildingIdsQuery).fetchAll()
    const buildingIdList = buildingIds.map(b => b.id)
    
    // Calculate maintenance costs using database aggregation
    let totalMaintenanceCost = {
      doors: 0,
      floors: 0,
      windows: 0,
      walls: 0,
      roofs: 0,
      areas: 0
    }
    let maintenanceUpdates = 0
    
    if (buildingIdList.length > 0) {
      // Use database aggregation for better performance
      const maintenanceQuery = {
        query: `
          SELECT 
            c.type,
            SUM(c.price) as totalPrice,
            COUNT(1) as itemCount
          FROM c 
          WHERE c.buildingId IN (${buildingIdList.map((_, i) => `@buildingId${i}`).join(',')})
          AND c.price > 0
          GROUP BY c.type
        `,
        parameters: buildingIdList.map((id, i) => ({ name: `@buildingId${i}`, value: id }))
      }
      
      try {
        const { resources: maintenanceResults } = await pricelistContainer.items.query(maintenanceQuery).fetchAll()
        
        for (const result of maintenanceResults) {
          const type = result.type?.toLowerCase()
          const price = result.totalPrice || 0
          const count = result.itemCount || 0
          
          maintenanceUpdates += count
          
          switch (type) {
            case 'door':
              totalMaintenanceCost.doors += price
              break
            case 'floor':
              totalMaintenanceCost.floors += price
              break
            case 'window':
              totalMaintenanceCost.windows += price
              break
            case 'wall':
              totalMaintenanceCost.walls += price
              break
            case 'roof':
              totalMaintenanceCost.roofs += price
              break
            case 'area':
              totalMaintenanceCost.areas += price
              break
          }
        }
      } catch (error) {
        console.log('Maintenance calculation fallback - using individual queries')
        // Fallback to individual queries if aggregation fails
        for (const buildingId of buildingIdList) {
          const priceQuery = {
            query: 'SELECT * FROM c WHERE c.buildingId = @buildingId AND c.price > 0',
            parameters: [{ name: '@buildingId', value: buildingId }]
          }
          
          const { resources: priceItems } = await pricelistContainer.items.query(priceQuery).fetchAll()
          
          for (const item of priceItems) {
            const type = item.type?.toLowerCase()
            const price = item.price || 0
            
            maintenanceUpdates++
            
            switch (type) {
              case 'door':
                totalMaintenanceCost.doors += price
                break
              case 'floor':
                totalMaintenanceCost.floors += price
                break
              case 'window':
                totalMaintenanceCost.windows += price
                break
              case 'wall':
                totalMaintenanceCost.walls += price
                break
              case 'roof':
                totalMaintenanceCost.roofs += price
                break
              case 'area':
                totalMaintenanceCost.areas += price
                break
            }
          }
        }
      }
    }

    return {
      totalBuildings,
      totalArea,
      totalMaintenanceCost,
      maintenanceUpdates
    }
  } catch (error) {
    console.error('Error calculating building statistics:', error)
    throw error
  }
}

// Get buildings with pagination and filters (optimized for speed)
export const getBuildingsWithPaginationAndFilters = async (
  page: number, 
  limit: number, 
  filters?: { propertyId?: string; clientId?: string; search?: string }
): Promise<{
  buildings: Building[];
  total: number;
  totalArea: number;
}> => {
  try {
    const buildingsContainer = getBuildingsContainer()
    
    // Build query based on filters
    let query: any
    let countQuery: any
    let areaQuery: any
    
    // Helper function to build search condition
    const buildSearchCondition = (baseQuery: string, parameters: any[]) => {
      if (filters?.search) {
        const searchTerm = filters.search.toLowerCase()
        const searchCondition = `AND (CONTAINS(LOWER(c.name), @search) OR CONTAINS(LOWER(c.description), @search) OR CONTAINS(LOWER(c.metadata.buildingType), @search))`
        return {
          query: baseQuery.replace('ORDER BY', searchCondition + ' ORDER BY'),
          parameters: [...parameters, { name: '@search', value: searchTerm }]
        }
      }
      return { query: baseQuery, parameters }
    }
    
    if (filters?.propertyId && filters?.clientId) {
      // Both filters applied
      const baseQuery = 'SELECT * FROM c WHERE c.propertyId = @propertyId AND c.clientId = @clientId ORDER BY c.createdAt DESC'
      const baseParameters = [
        { name: '@propertyId', value: filters.propertyId },
        { name: '@clientId', value: filters.clientId }
      ]
      
      const searchResult = buildSearchCondition(baseQuery, baseParameters)
      query = searchResult
      
      // Build count query with search
      const countBaseQuery = 'SELECT VALUE COUNT(1) FROM c WHERE c.propertyId = @propertyId AND c.clientId = @clientId'
      const countSearchResult = buildSearchCondition(countBaseQuery, baseParameters)
      countQuery = countSearchResult
      
      // Build area query with search
      const areaBaseQuery = 'SELECT VALUE SUM(c.metadata.totalArea) FROM c WHERE c.propertyId = @propertyId AND c.clientId = @clientId'
      const areaSearchResult = buildSearchCondition(areaBaseQuery, baseParameters)
      areaQuery = areaSearchResult
      
    } else if (filters?.propertyId) {
      // Only propertyId filter
      const baseQuery = 'SELECT * FROM c WHERE c.propertyId = @propertyId ORDER BY c.createdAt DESC'
      const baseParameters = [{ name: '@propertyId', value: filters.propertyId }]
      
      const searchResult = buildSearchCondition(baseQuery, baseParameters)
      query = searchResult
      
      // Build count query with search
      const countBaseQuery = 'SELECT VALUE COUNT(1) FROM c WHERE c.propertyId = @propertyId'
      const countSearchResult = buildSearchCondition(countBaseQuery, baseParameters)
      countQuery = countSearchResult
      
      // Build area query with search
      const areaBaseQuery = 'SELECT VALUE SUM(c.metadata.totalArea) FROM c WHERE c.propertyId = @propertyId'
      const areaSearchResult = buildSearchCondition(areaBaseQuery, baseParameters)
      areaQuery = areaSearchResult
      
    } else if (filters?.clientId) {
      // Only clientId filter
      const baseQuery = 'SELECT * FROM c WHERE c.clientId = @clientId ORDER BY c.createdAt DESC'
      const baseParameters = [{ name: '@clientId', value: filters.clientId }]
      
      const searchResult = buildSearchCondition(baseQuery, baseParameters)
      query = searchResult
      
      // Build count query with search
      const countBaseQuery = 'SELECT VALUE COUNT(1) FROM c WHERE c.clientId = @clientId'
      const countSearchResult = buildSearchCondition(countBaseQuery, baseParameters)
      countQuery = countSearchResult
      
      // Build area query with search
      const areaBaseQuery = 'SELECT VALUE SUM(c.metadata.totalArea) FROM c WHERE c.clientId = @clientId'
      const areaSearchResult = buildSearchCondition(areaBaseQuery, baseParameters)
      areaQuery = areaSearchResult
      
    } else if (filters?.search) {
      // Only search filter
      const searchTerm = filters.search.toLowerCase()
      const baseQuery = 'SELECT * FROM c WHERE (CONTAINS(LOWER(c.name), @search) OR CONTAINS(LOWER(c.description), @search) OR CONTAINS(LOWER(c.metadata.buildingType), @search)) ORDER BY c.createdAt DESC'
      const baseParameters = [{ name: '@search', value: searchTerm }]
      
      query = { query: baseQuery, parameters: baseParameters }
      countQuery = { 
        query: 'SELECT VALUE COUNT(1) FROM c WHERE (CONTAINS(LOWER(c.name), @search) OR CONTAINS(LOWER(c.description), @search) OR CONTAINS(LOWER(c.metadata.buildingType), @search))',
        parameters: baseParameters
      }
      areaQuery = { 
        query: 'SELECT VALUE SUM(c.metadata.totalArea) FROM c WHERE (CONTAINS(LOWER(c.name), @search) OR CONTAINS(LOWER(c.description), @search) OR CONTAINS(LOWER(c.metadata.buildingType), @search))',
        parameters: baseParameters
      }
    } else {
      // No filters - use existing pagination function
      const result = await getBuildingsWithPagination(page, limit)
      const totalArea = await getTotalAreaByFilters()
      
      return { ...result, totalArea }
    }
    
    // Execute queries in parallel for faster response
    const [countResult, areaResult, allBuildingsResult] = await Promise.all([
      buildingsContainer.items.query(countQuery).fetchAll(),
      buildingsContainer.items.query(areaQuery).fetchAll(),
      buildingsContainer.items.query(query).fetchAll()
    ])
    
    const total = countResult.resources[0] || 0
    const totalArea = areaResult.resources[0] || 0
    const allBuildings = allBuildingsResult.resources
    
    // Apply pagination in memory
    const offset = (page - 1) * limit
    const buildings = allBuildings.slice(offset, offset + limit)
    
    return { buildings, total, totalArea }
  } catch (error) {
    console.error('Error getting buildings with pagination and filters:', error)
    throw error
  }
}

// Get total area based on filters
export const getTotalAreaByFilters = async (
  filters?: { propertyId?: string; clientId?: string; search?: string }
): Promise<number> => {
  try {
    const buildingsContainer = getBuildingsContainer()

    // Dynamically build WHERE clause and parameters
    const conditions: string[] = []
    const parameters: { name: string; value: string }[] = []

    if (filters?.propertyId) {
      conditions.push('c.propertyId = @propertyId')
      parameters.push({ name: '@propertyId', value: filters.propertyId })
    }

    if (filters?.clientId) {
      conditions.push('c.clientId = @clientId')
      parameters.push({ name: '@clientId', value: filters.clientId })
    }

    if (filters?.search) {
      const searchTerm = filters.search.toLowerCase()
      conditions.push('(CONTAINS(LOWER(c.name), @search) OR CONTAINS(LOWER(c.description), @search) OR CONTAINS(LOWER(c.metadata.buildingType), @search))')
      parameters.push({ name: '@search', value: searchTerm })
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''
    const query = `SELECT VALUE SUM(c.metadata.totalArea) FROM c ${whereClause}`

    const { resources } = await buildingsContainer.items.query({
      query,
      parameters
    }).fetchAll()

    return resources[0] || 0
  } catch (error) {
    console.error('Error getting total area by filters:', error)
    throw error
  }
}

// Optimized function to get building statistics with database-level aggregations
export const getBuildingStatisticsOptimized = async (filters?: {
  propertyId?: string;
  clientId?: string;
  search?: string;
}): Promise<{
  totalBuildings: number;
  totalArea: number;
  totalMaintenanceCost: {
    doors: number;
    floors: number;
    windows: number;
    walls: number;
    roofs: number;
    areas: number;
  };
  maintenanceUpdates: number;
}> => {
  try {
    const buildingsContainer = getBuildingsContainer()
    const { getPricelistContainer } = await import('../config/database')
    const pricelistContainer = getPricelistContainer()
    
    // Build WHERE clause for filters
    let whereClause = ''
    let parameters: any[] = []
    
    if (filters) {
      const conditions: string[] = []
      
      if (filters.propertyId) {
        conditions.push('c.propertyId = @propertyId')
        parameters.push({ name: '@propertyId', value: filters.propertyId })
      }
      
      if (filters.clientId) {
        conditions.push('c.clientId = @clientId')
        parameters.push({ name: '@clientId', value: filters.clientId })
      }
      
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase()
        conditions.push('(CONTAINS(LOWER(c.name), @search) OR CONTAINS(LOWER(c.description), @search) OR CONTAINS(LOWER(c.metadata.buildingType), @search))')
        parameters.push({ name: '@search', value: searchTerm })
      }
      
      if (conditions.length > 0) {
        whereClause = `WHERE ${conditions.join(' AND ')}`
      }
    }
    
    // Execute all queries in parallel for maximum performance
    const [statsResult, buildingIdsResult] = await Promise.all([
      // Get total buildings and area
      buildingsContainer.items.query({
        query: `
          SELECT 
            COUNT(1) as totalBuildings,
            SUM(c.metadata.totalArea) as totalArea
          FROM c ${whereClause}
        `,
        parameters
      }).fetchAll(),
      
      // Get building IDs for maintenance calculation
      buildingsContainer.items.query({
        query: `SELECT c.id FROM c ${whereClause}`,
        parameters
      }).fetchAll()
    ])
    
    const stats = statsResult.resources[0] || { totalBuildings: 0, totalArea: 0 }
    const buildingIds = buildingIdsResult.resources.map(b => b.id)
    
    const totalBuildings = stats.totalBuildings || 0
    const totalArea = stats.totalArea || 0
    
    // Initialize maintenance cost object
    let totalMaintenanceCost = {
      doors: 0,
      floors: 0,
      windows: 0,
      walls: 0,
      roofs: 0,
      areas: 0
    }
    let maintenanceUpdates = 0
    
    // Calculate maintenance costs using optimized database queries
    if (buildingIds.length > 0) {
      try {
        // Use database aggregation for maximum performance
        const maintenanceQuery = {
          query: `
            SELECT 
              c.type,
              SUM(c.price) as totalPrice,
              COUNT(1) as itemCount
            FROM c 
            WHERE c.buildingId IN (${buildingIds.map((_, i) => `@buildingId${i}`).join(',')})
            AND c.price > 0
            GROUP BY c.type
          `,
          parameters: buildingIds.map((id, i) => ({ name: `@buildingId${i}`, value: id }))
        }
        
        const { resources: maintenanceResults } = await pricelistContainer.items.query(maintenanceQuery).fetchAll()
        
        for (const result of maintenanceResults) {
          const type = result.type?.toLowerCase()
          const price = result.totalPrice || 0
          const count = result.itemCount || 0
          
          maintenanceUpdates += count
          
          switch (type) {
            case 'door':
              totalMaintenanceCost.doors += price
              break
            case 'floor':
              totalMaintenanceCost.floors += price
              break
            case 'window':
              totalMaintenanceCost.windows += price
              break
            case 'wall':
              totalMaintenanceCost.walls += price
              break
            case 'roof':
              totalMaintenanceCost.roofs += price
              break
            case 'area':
              totalMaintenanceCost.areas += price
              break
          }
        }
      } catch (error) {
        console.log('Using fallback maintenance calculation')
        // Fallback: calculate maintenance costs individually
        const maintenancePromises = buildingIds.map(async (buildingId) => {
          const priceQuery = {
            query: 'SELECT * FROM c WHERE c.buildingId = @buildingId AND c.price > 0',
            parameters: [{ name: '@buildingId', value: buildingId }]
          }
          
          const { resources: priceItems } = await pricelistContainer.items.query(priceQuery).fetchAll()
          return priceItems
        })
        
        const allPriceItems = await Promise.all(maintenancePromises)
        const flatPriceItems = allPriceItems.flat()
        
        for (const item of flatPriceItems) {
          const type = item.type?.toLowerCase()
          const price = item.price || 0
          
          maintenanceUpdates++
          
          switch (type) {
            case 'door':
              totalMaintenanceCost.doors += price
              break
            case 'floor':
              totalMaintenanceCost.floors += price
              break
            case 'window':
              totalMaintenanceCost.windows += price
              break
            case 'wall':
              totalMaintenanceCost.walls += price
              break
            case 'roof':
              totalMaintenanceCost.roofs += price
              break
            case 'area':
              totalMaintenanceCost.areas += price
              break
          }
        }
      }
    }

    return {
      totalBuildings,
      totalArea,
      totalMaintenanceCost,
      maintenanceUpdates
    }
  } catch (error) {
    console.error('Error calculating optimized building statistics:', error)
    throw error
  }
}


// Helper function to calculate total objects used from building objects
export const calculateTotalObjectsUsed = (buildingObjects: any): number => {
  if (!buildingObjects) return 0
  
  let totalObjects = 0
  
  // If buildingObjects is an array
  if (Array.isArray(buildingObjects)) {
    for (const obj of buildingObjects) {
      // Add count if it exists (for doors, windows, etc.)
      if (obj.count && typeof obj.count === 'number') {
        totalObjects += obj.count
      }
      // For area-based objects, count as 1 if area exists
      else if (obj.area && typeof obj.area === 'number') {
        totalObjects += 1
      }
      // If neither count nor area, count as 1
      else {
        totalObjects += 1
      }
    }
  }
  // If buildingObjects is an object with sections
  else if (typeof buildingObjects === 'object') {
    for (const section of Object.values(buildingObjects)) {
      if (Array.isArray(section)) {
        for (const obj of section) {
          // Add count if it exists (for doors, windows, etc.)
          if (obj.count && typeof obj.count === 'number') {
            totalObjects += obj.count
          }
          // For area-based objects, count as 1 if area exists
          else if (obj.area && typeof obj.area === 'number') {
            totalObjects += 1
          }
          // If neither count nor area, count as 1
          else {
            totalObjects += 1
          }
        }
      }
    }
  }
  
  return totalObjects
}
