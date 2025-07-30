import { Property, CreatePropertyRequest } from '../types'
import { getPropertiesContainer } from '../config/database'

// Find property by ID
export const findPropertyById = async (id: string): Promise<Property | null> => {
  try {
    const propertiesContainer = getPropertiesContainer()
    const { resource: property } = await propertiesContainer.item(id, id).read()
    return property || null
  } catch (error) {
    console.error('Error finding property by ID:', error)
    throw error
  }
}

// Find property by property code
export const findPropertyByCode = async (propertyCode: string): Promise<Property | null> => {
  try {
    const propertiesContainer = getPropertiesContainer()
    const query = {
      query: 'SELECT * FROM c WHERE c.propertyCode = @propertyCode',
      parameters: [{ name: '@propertyCode', value: propertyCode }]
    }

    const { resources: properties } = await propertiesContainer.items.query(query).fetchAll()
    return properties.length > 0 ? properties[0] : null
  } catch (error) {
    console.error('Error finding property by code:', error)
    throw error
  }
}

// Find property by code excluding current property (for updates)
export const findPropertyByCodeExcludingId = async (propertyCode: string, excludeId: string): Promise<Property | null> => {
  try {
    const propertiesContainer = getPropertiesContainer()
    const query = {
      query: 'SELECT * FROM c WHERE c.propertyCode = @propertyCode AND c.id != @excludeId',
      parameters: [
        { name: '@propertyCode', value: propertyCode },
        { name: '@excludeId', value: excludeId }
      ]
    }

    const { resources: properties } = await propertiesContainer.items.query(query).fetchAll()
    return properties.length > 0 ? properties[0] : null
  } catch (error) {
    console.error('Error finding property by code excluding ID:', error)
    throw error
  }
}

// Get all properties
export const getAllProperties = async (): Promise<Property[]> => {
  try {
    const propertiesContainer = getPropertiesContainer()
    const query = {
      query: 'SELECT * FROM c ORDER BY c.createdAt DESC'
    }

    const { resources: properties } = await propertiesContainer.items.query(query).fetchAll()
    return properties
  } catch (error) {
    console.error('Error getting all properties:', error)
    throw error
  }
}

// Get properties by admin ID
export const getPropertiesByAdminId = async (adminId: string): Promise<Property[]> => {
  try {
    const propertiesContainer = getPropertiesContainer()
    const query = {
      query: 'SELECT * FROM c WHERE c.adminId = @adminId ORDER BY c.createdAt DESC',
      parameters: [{ name: '@adminId', value: adminId }]
    }

    const { resources: properties } = await propertiesContainer.items.query(query).fetchAll()
    return properties
  } catch (error) {
    console.error('Error getting properties by admin ID:', error)
    throw error
  }
}

// Get properties by client ID
export const getPropertiesByClientId = async (clientId: string): Promise<Property[]> => {
  try {
    const propertiesContainer = getPropertiesContainer()
    const query = {
      query: 'SELECT * FROM c WHERE c.clientId = @clientId ORDER BY c.createdAt DESC',
      parameters: [{ name: '@clientId', value: clientId }]
    }

    const { resources: properties } = await propertiesContainer.items.query(query).fetchAll()
    return properties
  } catch (error) {
    console.error('Error getting properties by client ID:', error)
    throw error
  }
}

// Create new property
export const createProperty = async (propertyData: Property): Promise<Property> => {
  try {
    const propertiesContainer = getPropertiesContainer()
    const { resource: createdProperty } = await propertiesContainer.items.create(propertyData)
    
    if (!createdProperty) {
      throw new Error('Failed to create property')
    }
    
    return createdProperty
  } catch (error) {
    console.error('Error creating property:', error)
    throw error
  }
}

// Update property
export const updateProperty = async (id: string, propertyData: Partial<Property>): Promise<Property> => {
  try {
    const propertiesContainer = getPropertiesContainer()
    const { resource: property } = await propertiesContainer.item(id, id).read()
    if (!property) {
      throw new Error('Property not found')
    }

    const updatedProperty = {
      ...property,
      ...propertyData,
      updatedAt: new Date()
    }

    const { resource: result } = await propertiesContainer.item(id, id).replace(updatedProperty)
    if (!result) {
      throw new Error('Failed to update property')
    }
    return result
  } catch (error) {
    console.error('Error updating property:', error)
    throw error
  }
}

// Delete property
export const deleteProperty = async (id: string): Promise<void> => {
  try {
    const propertiesContainer = getPropertiesContainer()
    await propertiesContainer.item(id, id).delete()
  } catch (error) {
    console.error('Error deleting property:', error)
    throw error
  }
}

// Search properties
export const searchProperties = async (searchTerm: string): Promise<Property[]> => {
  try {
    const propertiesContainer = getPropertiesContainer()
    const query = {
      query: `
        SELECT * FROM c 
        WHERE CONTAINS(c.propertyName, @searchTerm, true) 
        OR CONTAINS(c.propertyCode, @searchTerm, true)
        OR CONTAINS(c.address, @searchTerm, true)
        OR CONTAINS(c.city, @searchTerm, true)
        ORDER BY c.createdAt DESC
      `,
      parameters: [{ name: '@searchTerm', value: searchTerm }]
    }

    const { resources: properties } = await propertiesContainer.items.query(query).fetchAll()
    return properties
  } catch (error) {
    console.error('Error searching properties:', error)
    throw error
  }
}

// Get properties with filters
export const getPropertiesWithFilters = async (filters: {
  adminId?: string;
  clientId?: string;
  search?: string;
  propertyType?: string;
  city?: string;
  inactive?: boolean;
}): Promise<Property[]> => {
  try {
    const propertiesContainer = getPropertiesContainer()
    
    let query = 'SELECT * FROM c WHERE 1=1'
    const parameters: any[] = []
    let paramIndex = 0

    if (filters.adminId) {
      paramIndex++
      query += ` AND c.adminId = @adminId${paramIndex}`
      parameters.push({ name: `@adminId${paramIndex}`, value: filters.adminId })
    }

    if (filters.clientId) {
      paramIndex++
      query += ` AND c.clientId = @clientId${paramIndex}`
      parameters.push({ name: `@clientId${paramIndex}`, value: filters.clientId })
    }

    if (filters.propertyType) {
      paramIndex++
      query += ` AND c.propertyType = @propertyType${paramIndex}`
      parameters.push({ name: `@propertyType${paramIndex}`, value: filters.propertyType })
    }

    if (filters.city) {
      paramIndex++
      query += ` AND c.city = @city${paramIndex}`
      parameters.push({ name: `@city${paramIndex}`, value: filters.city })
    }

    if (filters.inactive !== undefined) {
      paramIndex++
      query += ` AND c.inactive = @inactive${paramIndex}`
      parameters.push({ name: `@inactive${paramIndex}`, value: filters.inactive })
    }

    if (filters.search) {
      paramIndex++
      query += ` AND (CONTAINS(c.propertyName, @search${paramIndex}, true) 
                OR CONTAINS(c.propertyCode, @search${paramIndex}, true)
                OR CONTAINS(c.address, @search${paramIndex}, true)
                OR CONTAINS(c.city, @search${paramIndex}, true))`
      parameters.push({ name: `@search${paramIndex}`, value: filters.search })
    }

    query += ' ORDER BY c.createdAt DESC'

    const queryObj = { query, parameters }
    const { resources: properties } = await propertiesContainer.items.query(queryObj).fetchAll()
    return properties
  } catch (error) {
    console.error('Error getting properties with filters:', error)
    throw error
  }
}

// Calculate property statistics
export const calculatePropertyStatistics = async (filters?: {
  adminId?: string;
  clientId?: string;
  search?: string;
  propertyType?: string;
  city?: string;
  inactive?: boolean;
}): Promise<{
  totalProperties: number;
  totalArea: number;
  totalBuildings: number;
  // activeProperties: number;
  // inactiveProperties: number;
  totalMaintenanceCost: number;
  //   propertiesByType: { [key: string]: number };
  //   propertiesByCity: { [key: string]: number };
}> => {
  try {
    // Get properties based on filters
    const properties = filters ? await getPropertiesWithFilters(filters) : await getAllProperties()
    
    // Import building functions
    const { getBuildingsByPropertyId } = await import('./building.entity')
    
    // Calculate statistics
    let totalArea = 0
    let totalBuildings = 0
    // let activeProperties = 0
    // let inactiveProperties = 0
    let totalMaintenanceCost = 0
    const propertiesByType: { [key: string]: number } = {}
    const propertiesByCity: { [key: string]: number } = {}

    // Process each property
    for (const property of properties) {
      // Count by type
      if (!propertiesByType[property.propertyType]) {
        propertiesByType[property.propertyType] = 0
      }
      propertiesByType[property.propertyType]++

      // Count by city
      if (!propertiesByCity[property.city]) {
        propertiesByCity[property.city] = 0
      }
      propertiesByCity[property.city]++

      // Count active/inactive
      // if (property.inactive) {
      //   inactiveProperties++
      // } else {
      //   activeProperties++
      // }

      // Calculate total area from metadata
      if (property.metadata?.grossArea) {
        totalArea += property.metadata.grossArea
      }

      // Count buildings for this property
      try {
        const buildings = await getBuildingsByPropertyId(property.id)
        totalBuildings += buildings.length
      } catch (error) {
        console.error(`Error getting buildings for property ${property.id}:`, error)
        // Continue processing other properties
      }
    }

    return {
      totalProperties: properties.length,
      totalArea,
      totalBuildings,
      // activeProperties,
      // inactiveProperties,
      totalMaintenanceCost
      // propertiesByType,
      // propertiesByCity
    }
  } catch (error) {
    console.error('Error calculating property statistics:', error)
    throw error
  }
} 