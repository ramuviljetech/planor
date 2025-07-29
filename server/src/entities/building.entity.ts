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



// Search buildings
export const searchBuildings = async (searchTerm: string): Promise<Building[]> => {
  try {
    const buildingsContainer = getBuildingsContainer()
    const query = {
      query: `
        SELECT * FROM c 
        WHERE CONTAINS(c.name, @searchTerm, true) 
        OR CONTAINS(c.description, @searchTerm, true)
        OR CONTAINS(c.contactPerson, @searchTerm, true)
        ORDER BY c.createdAt DESC
      `,
      parameters: [{ name: '@searchTerm', value: searchTerm }]
    }

    const { resources: buildings } = await buildingsContainer.items.query(query).fetchAll()
    return buildings
  } catch (error) {
    console.error('Error searching buildings:', error)
    throw error
  }
}
