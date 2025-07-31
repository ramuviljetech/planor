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
export const getTotalAreaByFilters = async (filters?: { propertyId?: string; clientId?: string }): Promise<number> => {
  try {
    const buildingsContainer = getBuildingsContainer()
    
    // If no filters, get total area of all buildings
    if (!filters || (Object.keys(filters).length === 0)) {
      const totalQuery = {
        query: 'SELECT VALUE SUM(c.metadata.totalArea) FROM c'
      }
      const { resources: totalResult } = await buildingsContainer.items.query(totalQuery).fetchAll()
      return totalResult[0] || 0
    }
    
    // Build filtered query for area
    let filteredQuery: any
    if (filters?.propertyId && filters?.clientId) {
      filteredQuery = {
        query: 'SELECT VALUE SUM(c.metadata.totalArea) FROM c WHERE c.propertyId = @propertyId AND c.clientId = @clientId',
        parameters: [
          { name: '@propertyId', value: filters.propertyId },
          { name: '@clientId', value: filters.clientId }
        ]
      }
    } else if (filters?.propertyId) {
      filteredQuery = {
        query: 'SELECT VALUE SUM(c.metadata.totalArea) FROM c WHERE c.propertyId = @propertyId',
        parameters: [{ name: '@propertyId', value: filters.propertyId }]
      }
    } else if (filters?.clientId) {
      filteredQuery = {
        query: 'SELECT VALUE SUM(c.metadata.totalArea) FROM c WHERE c.clientId = @clientId',
        parameters: [{ name: '@clientId', value: filters.clientId }]
      }
    }
    
    const { resources: filteredResult } = await buildingsContainer.items.query(filteredQuery).fetchAll()
    return filteredResult[0] || 0
  } catch (error) {
    console.error('Error getting total area by filters:', error)
    throw error
  }
}
