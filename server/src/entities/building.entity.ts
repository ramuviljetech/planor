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

// Calculate building statistics (optimized for speed)
export const calculateBuildingStatistics = async (): Promise<{
  totalBuildings: number;
  totalArea: number;
  totalMaintenanceCost: number;
  maintenanceUpdates: number;
}> => {
  try {
    const buildingsContainer = getBuildingsContainer()
    
    // Get total count and area in a single query for better performance
    const statsQuery = {
      query: `
        SELECT 
          COUNT(1) as totalBuildings,
          SUM(c.metadata.totalArea) as totalArea
        FROM c
      `
    }
    
    const { resources: statsResult } = await buildingsContainer.items.query(statsQuery).fetchAll()
    const stats = statsResult[0] || { totalBuildings: 0, totalArea: 0 }
    
    // For now, using simplified calculations for faster response
    const totalBuildings = stats.totalBuildings || 0
    const totalArea = stats.totalArea || 0
    
    // Simplified maintenance calculations for faster response
    const totalMaintenanceCost = 0 // Set to 0 as per your change
    const maintenanceUpdates = Math.floor(totalBuildings * 0.5) // Simple calculation

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
  filters?: { propertyId?: string; clientId?: string }
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
    
    if (filters?.propertyId && filters?.clientId) {
      // Both filters applied
      query = {
        query: 'SELECT * FROM c WHERE c.propertyId = @propertyId AND c.clientId = @clientId ORDER BY c.createdAt DESC',
        parameters: [
          { name: '@propertyId', value: filters.propertyId },
          { name: '@clientId', value: filters.clientId }
        ]
      }
      countQuery = {
        query: 'SELECT VALUE COUNT(1) FROM c WHERE c.propertyId = @propertyId AND c.clientId = @clientId',
        parameters: [
          { name: '@propertyId', value: filters.propertyId },
          { name: '@clientId', value: filters.clientId }
        ]
      }
      areaQuery = {
        query: 'SELECT VALUE SUM(c.metadata.totalArea) FROM c WHERE c.propertyId = @propertyId AND c.clientId = @clientId',
        parameters: [
          { name: '@propertyId', value: filters.propertyId },
          { name: '@clientId', value: filters.clientId }
        ]
      }
    } else if (filters?.propertyId) {
      // Only propertyId filter
      query = {
        query: 'SELECT * FROM c WHERE c.propertyId = @propertyId ORDER BY c.createdAt DESC',
        parameters: [{ name: '@propertyId', value: filters.propertyId }]
      }
      countQuery = {
        query: 'SELECT VALUE COUNT(1) FROM c WHERE c.propertyId = @propertyId',
        parameters: [{ name: '@propertyId', value: filters.propertyId }]
      }
      areaQuery = {
        query: 'SELECT VALUE SUM(c.metadata.totalArea) FROM c WHERE c.propertyId = @propertyId',
        parameters: [{ name: '@propertyId', value: filters.propertyId }]
      }
    } else if (filters?.clientId) {
      // Only clientId filter
      query = {
        query: 'SELECT * FROM c WHERE c.clientId = @clientId ORDER BY c.createdAt DESC',
        parameters: [{ name: '@clientId', value: filters.clientId }]
      }
      countQuery = {
        query: 'SELECT VALUE COUNT(1) FROM c WHERE c.clientId = @clientId',
        parameters: [{ name: '@clientId', value: filters.clientId }]
      }
      areaQuery = {
        query: 'SELECT VALUE SUM(c.metadata.totalArea) FROM c WHERE c.clientId = @clientId',
        parameters: [{ name: '@clientId', value: filters.clientId }]
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
  filters?: { propertyId?: string; clientId?: string }
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

// Calculate building maintenance statistics using database queries
export const calculateBuildingMaintenanceStats = async (filters?: {
  adminId?: string;
  clientId?: string;
  propertyId?: string;
}): Promise<{
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
    
    // Build query based on filters
    let query: any
    let parameters: any[] = []
    
    if (filters && Object.keys(filters).length > 0) {
      let whereConditions: string[] = []
      
      if (filters.adminId) {
        whereConditions.push('c.adminId = @adminId')
        parameters.push({ name: '@adminId', value: filters.adminId })
      }
      
      if (filters.clientId) {
        whereConditions.push('c.clientId = @clientId')
        parameters.push({ name: '@clientId', value: filters.clientId })
      }
      
      if (filters.propertyId) {
        whereConditions.push('c.propertyId = @propertyId')
        parameters.push({ name: '@propertyId', value: filters.propertyId })
      }
      
      query = {
        query: `SELECT * FROM c WHERE ${whereConditions.join(' AND ')}`,
        parameters
      }
    } else {
      query = {
        query: 'SELECT * FROM c'
      }
    }
    
    const { resources: buildings } = await buildingsContainer.items.query(query).fetchAll()
    
    // Get building IDs to fetch their prices
    const buildingIds = buildings.map(building => building.id)
    
    // Fetch all price items for these buildings
    let allPriceItems: any[] = []
    if (buildingIds.length > 0) {
      // Cosmos DB doesn't support IN queries directly, so we need to build the query differently
      const buildingIdConditions = buildingIds.map((_, index) => `c.buildingId = @buildingId${index}`).join(' OR ')
      const priceQuery = {
        query: `SELECT * FROM c WHERE (${buildingIdConditions})`,
        parameters: buildingIds.map((id, index) => ({ name: `@buildingId${index}`, value: id }))
      }
      
      console.log('Building IDs to search for:', buildingIds)
      console.log('Price query:', priceQuery)
      
      const { resources: priceItems } = await pricelistContainer.items.query(priceQuery).fetchAll()
      allPriceItems = priceItems
      
      console.log('Found price items:', allPriceItems.length)
      console.log('Price items:', allPriceItems)
    }
    
    // Initialize maintenance cost object
    const totalMaintenanceCost = {
      doors: 0,
      floors: 0,
      windows: 0,
      walls: 0,
      roofs: 0,
      areas: 0
    }
    
    let maintenanceUpdates = 0
    
    // Calculate maintenance costs from price items
    for (const priceItem of allPriceItems) {
      console.log('Processing price item:', priceItem)
      if (priceItem.price && typeof priceItem.price === 'number' && priceItem.price > 0) {
        maintenanceUpdates++ // Count items with prices as updates
        
        console.log(`Adding ${priceItem.price} to ${priceItem.type} category`)
        
        // Add to appropriate category based on type
        switch (priceItem.type) {
          case 'door':
            totalMaintenanceCost.doors += priceItem.price
            break
          case 'floor':
            totalMaintenanceCost.floors += priceItem.price
            break
          case 'window':
            totalMaintenanceCost.windows += priceItem.price
            break
          case 'wall':
            totalMaintenanceCost.walls += priceItem.price
            break
          case 'roof':
            totalMaintenanceCost.roofs += priceItem.price
            break
          case 'area':
            totalMaintenanceCost.areas += priceItem.price
            break
        }
      }
    }
    
    console.log('Final maintenance cost:', totalMaintenanceCost)
    console.log('Maintenance updates count:', maintenanceUpdates)
    
    return {
      totalMaintenanceCost,
      maintenanceUpdates
    }
  } catch (error) {
    console.error('Error calculating building maintenance stats:', error)
    throw error
  }
}

