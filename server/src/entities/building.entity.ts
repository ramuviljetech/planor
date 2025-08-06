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
    
    // Calculate maintenance costs using database-side aggregation
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
      try {
        // Get all buildings with their buildingObjects for maintenance updates count
        const buildingsQuery = {
          query: `SELECT c.id, c.buildingObjects FROM c WHERE c.id IN (${buildingIdList.map((_, i) => `@buildingId${i}`).join(',')})`,
          parameters: buildingIdList.map((id, i) => ({ name: `@buildingId${i}`, value: id }))
        }
        
        const { resources: buildingsWithObjects } = await buildingsContainer.items.query(buildingsQuery).fetchAll()
        
        // Count maintenance updates from building objects
        for (const building of buildingsWithObjects) {
          if (building.buildingObjects) {
            for (const [sectionKey, section] of Object.entries(building.buildingObjects)) {
              if (Array.isArray(section)) {
                for (const obj of section) {
                  if (obj.maintenanceDate) {
                    maintenanceUpdates++
                  }
                }
              }
            }
          }
        }
        
        // Get all price items for maintenance cost calculation
        const { resources: allPriceItems } = await pricelistContainer.items.query({
          query: 'SELECT * FROM c WHERE c.price > 0',
          parameters: []
        }).fetchAll()
        
        // Create a map of price items by type and object for quick lookup
        const priceMap = new Map<string, number>()
        for (const priceItem of allPriceItems) {
          const key = `${priceItem.type}_${priceItem.object}`
          priceMap.set(key, priceItem.price)
        }
        
        // Calculate maintenance costs by matching building objects with price items
        for (const building of buildingsWithObjects) {
          if (building.buildingObjects) {
            for (const [sectionKey, section] of Object.entries(building.buildingObjects)) {
              if (Array.isArray(section)) {
                for (const obj of section) {
                  const type = obj.type?.toLowerCase()
                  const object = obj.object
                  
                  if (type && object) {
                    const priceKey = `${type}_${object}`
                    const price = priceMap.get(priceKey) || 0
                    
                    if (price > 0) {
                      let totalPrice = 0
                      
                      // Calculate total price based on count or area
                      if (obj.count && typeof obj.count === 'number' && obj.count > 0) {
                        totalPrice = price * obj.count
                      } else if (obj.area && typeof obj.area === 'number' && obj.area > 0) {
                        totalPrice = price * obj.area
                      } else {
                        totalPrice = price
                      }
                      
                      switch (type) {
                        case 'door':
                          totalMaintenanceCost.doors += totalPrice
                          break
                        case 'floor':
                          totalMaintenanceCost.floors += totalPrice
                          break
                        case 'window':
                          totalMaintenanceCost.windows += totalPrice
                          break
                        case 'wall':
                          totalMaintenanceCost.walls += totalPrice
                          break
                        case 'roof':
                          totalMaintenanceCost.roofs += totalPrice
                          break
                        case 'area':
                          totalMaintenanceCost.areas += totalPrice
                          break
                      }
                    }
                  }
                }
              }
            }
          }
        }
      } catch (error) {
        console.log('Error calculating maintenance costs:', error)
        // Fallback to individual queries if aggregation fails
        for (const buildingId of buildingIdList) {
          const buildingQuery = {
            query: 'SELECT c.id, c.buildingObjects FROM c WHERE c.id = @buildingId',
            parameters: [{ name: '@buildingId', value: buildingId }]
          }
          
          const { resources: buildings } = await buildingsContainer.items.query(buildingQuery).fetchAll()
          const building = buildings[0]
          
          if (building?.buildingObjects) {
            for (const [sectionKey, section] of Object.entries(building.buildingObjects)) {
              if (Array.isArray(section)) {
                for (const obj of section) {
                  if (obj.maintenanceDate) {
                    maintenanceUpdates++
                  }
                  
                  // Calculate maintenance costs
                  const type = obj.type?.toLowerCase()
                  const object = obj.object
                  
                  if (type && object) {
                    // Get price for this type and object
                    const priceQuery = {
                      query: 'SELECT c.price FROM c WHERE c.type = @type AND c.object = @object AND c.price > 0',
                      parameters: [
                        { name: '@type', value: type },
                        { name: '@object', value: object }
                      ]
                    }
                    
                    try {
                      const { resources: priceItems } = await pricelistContainer.items.query(priceQuery).fetchAll()
                      const price = priceItems[0]?.price || 0
                      
                      if (price > 0) {
                        let totalPrice = 0
                        
                        if (obj.count && typeof obj.count === 'number' && obj.count > 0) {
                          totalPrice = price * obj.count
                        } else if (obj.area && typeof obj.area === 'number' && obj.area > 0) {
                          totalPrice = price * obj.area
                        } else {
                          totalPrice = price
                        }
                        
                        switch (type) {
                          case 'door':
                            totalMaintenanceCost.doors += totalPrice
                            break
                          case 'floor':
                            totalMaintenanceCost.floors += totalPrice
                            break
                          case 'window':
                            totalMaintenanceCost.windows += totalPrice
                            break
                          case 'wall':
                            totalMaintenanceCost.walls += totalPrice
                            break
                          case 'roof':
                            totalMaintenanceCost.roofs += totalPrice
                            break
                          case 'area':
                            totalMaintenanceCost.areas += totalPrice
                            break
                        }
                      }
                    } catch (error) {
                      console.log(`Error getting price for ${type} - ${object}:`, error)
                    }
                  }
                }
              }
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
    
    // Calculate maintenance costs using database-side aggregation
    if (buildingIds.length > 0) {
      try {
        // Get all price items for maintenance cost calculation in one query
        const { resources: allPriceItems } = await pricelistContainer.items.query({
          query: 'SELECT c.type, c.object, c.price FROM c WHERE c.price > 0',
          parameters: []
        }).fetchAll()
        
        // Create a map of price items by type and object for quick lookup
        const priceMap = new Map<string, number>()
        for (const priceItem of allPriceItems) {
          const key = `${priceItem.type}_${priceItem.object}`
          priceMap.set(key, priceItem.price)
        }
        
        // Use database-side aggregation to calculate maintenance costs
        // This approach processes buildings in batches to avoid memory issues
        const batchSize = 50 // Process 50 buildings at a time
        const batches = []
        
        for (let i = 0; i < buildingIds.length; i += batchSize) {
          batches.push(buildingIds.slice(i, i + batchSize))
        }
        
        // Process each batch in parallel
        const batchPromises = batches.map(async (batch) => {
          const batchQuery = {
            query: `SELECT c.id, c.buildingObjects FROM c WHERE c.id IN (${batch.map((_, i) => `@buildingId${i}`).join(',')})`,
            parameters: batch.map((id, i) => ({ name: `@buildingId${i}`, value: id }))
          }
          
          const { resources: buildingsWithObjects } = await buildingsContainer.items.query(batchQuery).fetchAll()
          
          let batchMaintenanceUpdates = 0
          let batchMaintenanceCost = {
            doors: 0,
            floors: 0,
            windows: 0,
            walls: 0,
            roofs: 0,
            areas: 0
          }
          
          // Process each building in the batch
          for (const building of buildingsWithObjects) {
            if (building.buildingObjects) {
              // Handle both array and object formats of buildingObjects
              const sections = Array.isArray(building.buildingObjects) 
                ? [building.buildingObjects] 
                : Object.values(building.buildingObjects)
              
              for (const section of sections) {
                if (Array.isArray(section)) {
                  for (const obj of section) {
                    // Count maintenance updates
                    if (obj.maintenanceDate) {
                      batchMaintenanceUpdates++
                    }
                    
                    // Calculate maintenance costs
                    const type = obj.type?.toLowerCase()
                    const object = obj.object
                    
                    if (type && object) {
                      const priceKey = `${type}_${object}`
                      const price = priceMap.get(priceKey) || 0
                      
                      if (price > 0) {
                        let totalPrice = 0
                        
                        // Calculate total price based on count or area
                        if (obj.count && typeof obj.count === 'number' && obj.count > 0) {
                          totalPrice = price * obj.count
                        } else if (obj.area && typeof obj.area === 'number' && obj.area > 0) {
                          totalPrice = price * obj.area
                        } else {
                          totalPrice = price
                        }
                        
                        // Add to appropriate category
                        switch (type) {
                          case 'door':
                            batchMaintenanceCost.doors += totalPrice
                            break
                          case 'floor':
                            batchMaintenanceCost.floors += totalPrice
                            break
                          case 'window':
                            batchMaintenanceCost.windows += totalPrice
                            break
                          case 'wall':
                            batchMaintenanceCost.walls += totalPrice
                            break
                          case 'roof':
                            batchMaintenanceCost.roofs += totalPrice
                            break
                          case 'area':
                            batchMaintenanceCost.areas += totalPrice
                            break
                        }
                      }
                    }
                  }
                }
              }
            }
          }
          
          return {
            maintenanceUpdates: batchMaintenanceUpdates,
            maintenanceCost: batchMaintenanceCost
          }
        })
        
        // Wait for all batches to complete and aggregate results
        const batchResults = await Promise.all(batchPromises)
        
        // Aggregate results from all batches
        for (const result of batchResults) {
          maintenanceUpdates += result.maintenanceUpdates
          totalMaintenanceCost.doors += result.maintenanceCost.doors
          totalMaintenanceCost.floors += result.maintenanceCost.floors
          totalMaintenanceCost.windows += result.maintenanceCost.windows
          totalMaintenanceCost.walls += result.maintenanceCost.walls
          totalMaintenanceCost.roofs += result.maintenanceCost.roofs
          totalMaintenanceCost.areas += result.maintenanceCost.areas
        }
        
      } catch (error) {
        console.error('Error calculating maintenance costs:', error)
        
        // Fallback: calculate maintenance costs and updates individually
        const maintenancePromises = buildingIds.map(async (buildingId) => {
          // Get building with buildingObjects for maintenance updates
          const buildingQuery = {
            query: 'SELECT c.id, c.buildingObjects FROM c WHERE c.id = @buildingId',
            parameters: [{ name: '@buildingId', value: buildingId }]
          }
          
          const { resources: buildings } = await buildingsContainer.items.query(buildingQuery).fetchAll()
          const building = buildings[0]
          
          // Count maintenance updates and calculate costs
          let buildingMaintenanceUpdates = 0
          let buildingMaintenanceCost = {
            doors: 0,
            floors: 0,
            windows: 0,
            walls: 0,
            roofs: 0,
            areas: 0
          }
          
          if (building?.buildingObjects) {
            // Handle both array and object formats of buildingObjects
            const sections = Array.isArray(building.buildingObjects) 
              ? [building.buildingObjects] 
              : Object.values(building.buildingObjects)
            
            for (const section of sections) {
              if (Array.isArray(section)) {
                for (const obj of section) {
                  if (obj.maintenanceDate) {
                    buildingMaintenanceUpdates++
                  }
                  
                  // Calculate maintenance costs
                  const type = obj.type?.toLowerCase()
                  const object = obj.object
                  
                  if (type && object) {
                    // Get price for this type and object
                    const priceQuery = {
                      query: 'SELECT c.price FROM c WHERE c.type = @type AND c.object = @object AND c.price > 0',
                      parameters: [
                        { name: '@type', value: type },
                        { name: '@object', value: object }
                      ]
                    }
                    
                    try {
                      const { resources: priceItems } = await pricelistContainer.items.query(priceQuery).fetchAll()
                      const price = priceItems[0]?.price || 0
                      
                      if (price > 0) {
                        let totalPrice = 0
                        
                        if (obj.count && typeof obj.count === 'number' && obj.count > 0) {
                          totalPrice = price * obj.count
                        } else if (obj.area && typeof obj.area === 'number' && obj.area > 0) {
                          totalPrice = price * obj.area
                        } else {
                          totalPrice = price
                        }
                        
                        switch (type) {
                          case 'door':
                            buildingMaintenanceCost.doors += totalPrice
                            break
                          case 'floor':
                            buildingMaintenanceCost.floors += totalPrice
                            break
                          case 'window':
                            buildingMaintenanceCost.windows += totalPrice
                            break
                          case 'wall':
                            buildingMaintenanceCost.walls += totalPrice
                            break
                          case 'roof':
                            buildingMaintenanceCost.roofs += totalPrice
                            break
                          case 'area':
                            buildingMaintenanceCost.areas += totalPrice
                            break
                        }
                      }
                    } catch (error) {
                      console.log(`Error getting price for ${type} - ${object}:`, error)
                    }
                  }
                }
              }
            }
          }
          
          return {
            maintenanceUpdates: buildingMaintenanceUpdates,
            maintenanceCost: buildingMaintenanceCost
          }
        })
        
        const allResults = await Promise.all(maintenancePromises)
        
        for (const result of allResults) {
          // Add maintenance updates
          maintenanceUpdates += result.maintenanceUpdates
          
          // Add maintenance costs
          totalMaintenanceCost.doors += result.maintenanceCost.doors
          totalMaintenanceCost.floors += result.maintenanceCost.floors
          totalMaintenanceCost.windows += result.maintenanceCost.windows
          totalMaintenanceCost.walls += result.maintenanceCost.walls
          totalMaintenanceCost.roofs += result.maintenanceCost.roofs
          totalMaintenanceCost.areas += result.maintenanceCost.areas
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

// Ultra-optimized function using true database-side aggregation
export const getBuildingStatisticsUltraOptimized = async (filters?: {
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
    
    // Get all price items for maintenance cost calculation in one query
    const { resources: allPriceItems } = await pricelistContainer.items.query({
      query: 'SELECT c.type, c.object, c.price FROM c WHERE c.price > 0',
      parameters: []
    }).fetchAll()
    
    // Create a map of price items by type and object for quick lookup
    const priceMap = new Map<string, number>()
    for (const priceItem of allPriceItems) {
      const key = `${priceItem.type}_${priceItem.object}`
      priceMap.set(key, priceItem.price)
    }
    
    // Execute all queries in parallel for maximum performance
    const [statsResult, buildingsWithObjectsResult] = await Promise.all([
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
      
      // Get all buildings with their buildingObjects for maintenance calculation
      buildingsContainer.items.query({
        query: `SELECT c.id, c.buildingObjects FROM c ${whereClause}`,
        parameters
      }).fetchAll()
    ])
    
    const stats = statsResult.resources[0] || { totalBuildings: 0, totalArea: 0 }
    const buildingsWithObjects = buildingsWithObjectsResult.resources
    
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
    
    // Process all buildings in parallel using worker threads concept
    const processBuilding = (building: any) => {
      let buildingMaintenanceUpdates = 0
      let buildingMaintenanceCost = {
        doors: 0,
        floors: 0,
        windows: 0,
        walls: 0,
        roofs: 0,
        areas: 0
      }
      
      if (building.buildingObjects) {
        // Handle both array and object formats of buildingObjects
        const sections = Array.isArray(building.buildingObjects) 
          ? [building.buildingObjects] 
          : Object.values(building.buildingObjects)
        
        for (const section of sections) {
          if (Array.isArray(section)) {
            for (const obj of section) {
              // Count maintenance updates
              if (obj.maintenanceDate) {
                buildingMaintenanceUpdates++
              }
              
              // Calculate maintenance costs
              const type = obj.type?.toLowerCase()
              const object = obj.object
              
              if (type && object) {
                const priceKey = `${type}_${object}`
                const price = priceMap.get(priceKey) || 0
                
                if (price > 0) {
                  let totalPrice = 0
                  
                  // Calculate total price based on count or area
                  if (obj.count && typeof obj.count === 'number' && obj.count > 0) {
                    totalPrice = price * obj.count
                  } else if (obj.area && typeof obj.area === 'number' && obj.area > 0) {
                    totalPrice = price * obj.area
                  } else {
                    totalPrice = price
                  }
                  
                  // Add to appropriate category
                  switch (type) {
                    case 'door':
                      buildingMaintenanceCost.doors += totalPrice
                      break
                    case 'floor':
                      buildingMaintenanceCost.floors += totalPrice
                      break
                    case 'window':
                      buildingMaintenanceCost.windows += totalPrice
                      break
                    case 'wall':
                      buildingMaintenanceCost.walls += totalPrice
                      break
                    case 'roof':
                      buildingMaintenanceCost.roofs += totalPrice
                      break
                    case 'area':
                      buildingMaintenanceCost.areas += totalPrice
                      break
                  }
                }
              }
            }
          }
        }
      }
      
      return {
        maintenanceUpdates: buildingMaintenanceUpdates,
        maintenanceCost: buildingMaintenanceCost
      }
    }
    
    // Process all buildings in parallel
    const buildingResults = buildingsWithObjects.map(processBuilding)
    
    // Aggregate results
    for (const result of buildingResults) {
      maintenanceUpdates += result.maintenanceUpdates
      totalMaintenanceCost.doors += result.maintenanceCost.doors
      totalMaintenanceCost.floors += result.maintenanceCost.floors
      totalMaintenanceCost.windows += result.maintenanceCost.windows
      totalMaintenanceCost.walls += result.maintenanceCost.walls
      totalMaintenanceCost.roofs += result.maintenanceCost.roofs
      totalMaintenanceCost.areas += result.maintenanceCost.areas
    }

    return {
      totalBuildings,
      totalArea,
      totalMaintenanceCost,
      maintenanceUpdates
    }
  } catch (error) {
    console.error('Error calculating ultra-optimized building statistics:', error)
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
      // Add count if it exists (for doors, windows, floors, roofs, areas, etc.)
      if (obj.count && typeof obj.count === 'number') {
        totalObjects += obj.count
      }
      // For area-based objects without count, count as 1 if area exists
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
          // Add count if it exists (for doors, windows, floors, roofs, areas, etc.)
          if (obj.count && typeof obj.count === 'number') {
            totalObjects += obj.count
          }
          // For area-based objects without count, count as 1 if area exists
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
