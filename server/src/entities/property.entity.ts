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