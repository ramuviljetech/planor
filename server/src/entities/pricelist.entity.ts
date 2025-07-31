import { PriceList, PriceItem } from '../types'
import { getPricelistContainer } from '../config/database'

// Find pricelist by ID
export const findPricelistById = async (id: string): Promise<PriceList | null> => {
  try {
    const pricelistContainer = getPricelistContainer()
    const { resource: pricelist } = await pricelistContainer.item(id, id).read()
    return pricelist || null
  } catch (error) {
    console.error('Error finding pricelist by ID:', error)
    throw error
  }
}

// Get all pricelists
export const getAllPricelists = async (): Promise<PriceList[]> => {
  try {
    const pricelistContainer = getPricelistContainer()
    const query = {
      query: 'SELECT * FROM c ORDER BY c.createdAt DESC'
    }

    const { resources: pricelists } = await pricelistContainer.items.query(query).fetchAll()
    return pricelists
  } catch (error) {
    console.error('Error getting all pricelists:', error)
    throw error
  }
}

// Get pricelists by admin ID
export const getPricelistsByAdminId = async (adminId: string): Promise<PriceList[]> => {
  try {
    const pricelistContainer = getPricelistContainer()
    const query = {
      query: 'SELECT * FROM c WHERE c.createdBy = @adminId ORDER BY c.createdAt DESC',
      parameters: [{ name: '@adminId', value: adminId }]
    }

    const { resources: pricelists } = await pricelistContainer.items.query(query).fetchAll()
    return pricelists
  } catch (error) {
    console.error('Error getting pricelists by admin ID:', error)
    throw error
  }
}

// Get active pricelists
export const getActivePricelists = async (): Promise<PriceList[]> => {
  try {
    const pricelistContainer = getPricelistContainer()
    const query = {
      query: 'SELECT * FROM c WHERE c.isActive = true ORDER BY c.createdAt DESC'
    }

    const { resources: pricelists } = await pricelistContainer.items.query(query).fetchAll()
    return pricelists
  } catch (error) {
    console.error('Error getting active pricelists:', error)
    throw error
  }
}

// Create new pricelist
export const createPricelist = async (pricelistData: PriceList): Promise<PriceList> => {
  try {
    const pricelistContainer = getPricelistContainer()
    const { resource: createdPricelist } = await pricelistContainer.items.create(pricelistData)
    
    if (!createdPricelist) {
      throw new Error('Failed to create pricelist')
    }
    
    return createdPricelist
  } catch (error) {
    console.error('Error creating pricelist:', error)
    throw error
  }
}

// Create new price item (individual document)
export const createPriceItem = async (priceItemData: PriceItem): Promise<PriceItem> => {
  try {
    const pricelistContainer = getPricelistContainer()
    const { resource: createdPriceItem } = await pricelistContainer.items.create(priceItemData)

    if (!createdPriceItem) {
      throw new Error('Failed to create price item')
    }

    return createdPriceItem
  } catch (error) {
    console.error('Error creating price item:', error)
    throw error
  }
}

// Check if a price item with the same type and object already exists
export const checkExistingPriceItem = async (buildingId: string, type: string, object: string): Promise<PriceItem | null> => {
  try {
    const pricelistContainer = getPricelistContainer()
    
    // Query for existing record with same buildingId, type, and object
    const query = {
      query: "SELECT * FROM c WHERE c.buildingId = @buildingId AND c.type = @type AND c.object = @object",
      parameters: [
        { name: "@buildingId", value: buildingId },
        { name: "@type", value: type },
        { name: "@object", value: object }
      ]
    }
    
    const { resources } = await pricelistContainer.items.query(query).fetchAll()
    
    // Return the first matching record if found, otherwise null
    return resources.length > 0 ? resources[0] : null
  } catch (error) {
    console.error('Error checking existing price item:', error)
    return null
  }
}

// Update pricelist
export const updatePricelist = async (id: string, pricelistData: Partial<PriceList>): Promise<PriceList> => {
  try {
    const pricelistContainer = getPricelistContainer()
    const { resource: pricelist } = await pricelistContainer.item(id, id).read()
    if (!pricelist) {
      throw new Error('Pricelist not found')
    }

    const updatedPricelist = {
      ...pricelist,
      ...pricelistData,
      updatedAt: new Date().toISOString()
    }

    const { resource: result } = await pricelistContainer.item(id, id).replace(updatedPricelist)
    if (!result) {
      throw new Error('Failed to update pricelist')
    }
    return result
  } catch (error) {
    console.error('Error updating pricelist:', error)
    throw error
  }
}

// Delete pricelist
export const deletePricelist = async (id: string): Promise<void> => {
  try {
    const pricelistContainer = getPricelistContainer()
    await pricelistContainer.item(id, id).delete()
  } catch (error) {
    console.error('Error deleting pricelist:', error)
    throw error
  }
}

// Search pricelists
export const searchPricelists = async (searchTerm: string): Promise<PriceList[]> => {
  try {
    const pricelistContainer = getPricelistContainer()
    const query = {
      query: `
        SELECT * FROM c 
        WHERE CONTAINS(c.name, @searchTerm, true) 
        ORDER BY c.createdAt DESC
      `,
      parameters: [{ name: '@searchTerm', value: searchTerm }]
    }

    const { resources: pricelists } = await pricelistContainer.items.query(query).fetchAll()
    return pricelists
  } catch (error) {
    console.error('Error searching pricelists:', error)
    throw error
  }
}

// Get pricelists with filters
export const getPricelistsWithFilters = async (): Promise<PriceList[]> => {
  try {
    const pricelistContainer = getPricelistContainer()
    
    // let query = 'SELECT * FROM c WHERE 1=1'
    // const parameters: any[] = []
    // let paramIndex = 0

    // if (filters.adminId) {
    //   paramIndex++
    //   query += ` AND c.createdBy = @adminId${paramIndex}`
    //   parameters.push({ name: `@adminId${paramIndex}`, value: filters.adminId })
    // }

    // if (filters.isActive !== undefined) {
    //   paramIndex++
    //   query += ` AND c.isActive = @isActive${paramIndex}`
    //   parameters.push({ name: `@isActive${paramIndex}`, value: filters.isActive })
    // }

    // if (filters.isGlobal !== undefined) {
    //   paramIndex++
    //   query += ` AND c.isGlobal = @isGlobal${paramIndex}`
    //   parameters.push({ name: `@isGlobal${paramIndex}`, value: filters.isGlobal })
    // }

    // if (filters.search) {
    //   paramIndex++
    //   query += ` AND CONTAINS(c.name, @search${paramIndex}, true)`
    //   parameters.push({ name: `@search${paramIndex}`, value: filters.search })
    // }

    // query += ' ORDER BY c.createdAt DESC'

    const queryObj = { query: 'SELECT * FROM c ORDER BY c.createdAt DESC', parameters: [] }
    const { resources: pricelists } = await pricelistContainer.items.query(queryObj).fetchAll()
    return pricelists
  } catch (error) {
    console.error('Error getting pricelists with filters:', error)
    throw error
  }
} 