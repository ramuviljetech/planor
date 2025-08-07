import { PriceList, PriceItem } from '../types'
import { getPricelistContainer } from '../config/database'

// Test function to check database connection and basic query
export const testDatabaseConnection = async (): Promise<any> => {
  try {
    const pricelistContainer = getPricelistContainer()
    console.log('Debug: Testing database connection...')
    
    // Try the simplest possible query
    const simpleQuery = {
      query: 'SELECT * FROM c',
      parameters: []
    }
    
    console.log('Debug: Executing simple test query:', simpleQuery.query)
    
    const { resources } = await pricelistContainer.items.query(simpleQuery).fetchAll()
    console.log('Debug: Test query returned:', resources.length, 'records')
    
    if (resources.length > 0) {
      console.log('Debug: Sample record:', {
        id: resources[0].id,
        type: resources[0].type,
        keys: Object.keys(resources[0])
      })
    }
    
    return {
      success: true,
      recordCount: resources.length,
      sampleRecord: resources.length > 0 ? resources[0] : null
    }
  } catch (error) {
    console.error('Debug: Database connection test failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

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

// Get all pricelists without any filters (for debugging)
export const getAllPricelistsUnfiltered = async (): Promise<PriceItem[]> => {
  try {
    const pricelistContainer = getPricelistContainer()
    
    // Try a simple query first
    const simpleQuery = {
      query: 'SELECT * FROM c',
      parameters: []
    }

    console.log('Debug: Executing simple query:', simpleQuery.query);
    
    const { resources: simpleResults } = await pricelistContainer.items.query(simpleQuery).fetchAll()
    console.log('Debug: Simple query results count:', simpleResults.length);
    
    if (simpleResults.length === 0) {
      console.log('Debug: No results from simple query, trying with ORDER BY...');
      
      const orderByQuery = {
        query: 'SELECT * FROM c ORDER BY c.createdAt DESC',
        parameters: []
      }

      console.log('Debug: Executing ORDER BY query:', orderByQuery.query);
      
      const { resources: pricelists } = await pricelistContainer.items.query(orderByQuery).fetchAll()
      console.log('Debug: Total records in database:', pricelists.length)
      
      if (pricelists.length > 0) {
        console.log('Debug: Sample record structure:', {
          id: pricelists[0].id,
          type: pricelists[0].type,
          hasType: 'type' in pricelists[0],
          keys: Object.keys(pricelists[0])
        })
      }
      
      return pricelists as PriceItem[]
    } else {
      console.log('Debug: Simple query worked, using those results');
      return simpleResults as PriceItem[]
    }
  } catch (error) {
    console.error('Error getting all pricelists unfiltered:', error)
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
export const getPricelistsWithFilters = async (filters?: {
  adminId?: string;
  search?: string;
  isActive?: boolean;
  isGlobal?: boolean;
  page?: number;
  limit?: number;
}): Promise<{ pricelists: PriceItem[]; total: number }> => {
  try {
    const pricelistContainer = getPricelistContainer()
    
    console.log('Debug: Starting getPricelistsWithFilters')
    console.log('Debug: Filters received:', filters)
    
    // Start with a simple query and add conditions only if filters are provided
    let query = 'SELECT * FROM c'
    const parameters: any[] = []
    let paramIndex = 0
    const conditions: string[] = []

    console.log('Debug: Filters applied:', filters)

    // Only add WHERE clause if we have actual filters
    if (filters && Object.keys(filters).length > 0) {
      console.log('Debug: Processing filters...')
      
      // Check if the field exists before adding the filter
      // For now, we'll skip filters that don't exist in the current data structure
      // This is a temporary fix until the data structure is updated
      
      if (filters.adminId) {
        console.log('Debug: Skipping adminId filter - field not available in current data')
        // paramIndex++
        // conditions.push(`c.createdBy = @adminId${paramIndex}`)
        // parameters.push({ name: `@adminId${paramIndex}`, value: filters.adminId })
      }

      if (filters.isActive !== undefined) {
        console.log('Debug: Skipping isActive filter - field not available in current data')
        // paramIndex++
        // conditions.push(`c.isActive = @isActive${paramIndex}`)
        // parameters.push({ name: `@isActive${paramIndex}`, value: filters.isActive })
      }

      if (filters.isGlobal !== undefined) {
        console.log('Debug: Skipping isGlobal filter - field not available in current data')
        // paramIndex++
        // conditions.push(`c.isGlobal = @isGlobal${paramIndex}`)
        // parameters.push({ name: `@isGlobal${paramIndex}`, value: filters.isGlobal })
      }

      if (filters.search) {
        console.log('Debug: Skipping search filter - name field not available in current data')
        // paramIndex++
        // conditions.push(`CONTAINS(c.name, @search${paramIndex}, true)`)
        // parameters.push({ name: `@search${paramIndex}`, value: filters.search })
      }

      if (conditions.length > 0) {
        query += ` WHERE ${conditions.join(' AND ')}`
      }
    } else {
      console.log('Debug: No filters provided, using simple query')
    }

    query += ' ORDER BY c.createdAt DESC'

    console.log('Debug: Final query:', query)
    console.log('Debug: Parameters:', parameters)

    // Get total count first
    const countQuery = query.replace('SELECT *', 'SELECT VALUE COUNT(1)')
    console.log('Debug: Count query:', countQuery)
    
    try {
      const { resources: countResult } = await pricelistContainer.items.query({
        query: countQuery,
        parameters
      }).fetchAll()
      
      const total = countResult[0] || 0
      console.log('Debug: Total count result:', total)
    } catch (countError) {
      console.error('Debug: Error in count query:', countError)
      throw countError
    }

    // Apply pagination if provided
    if (filters?.page && filters?.limit) {
      const offset = (filters.page - 1) * filters.limit
      query += ` OFFSET ${offset} LIMIT ${filters.limit}`
      console.log('Debug: Query with pagination:', query)
    }

    const queryObj = { query, parameters }
    console.log('Debug: Executing main query with:', queryObj)
    
    const { resources: pricelists } = await pricelistContainer.items.query(queryObj).fetchAll()
    
    console.log('Debug: Retrieved pricelists count:', pricelists.length)
    console.log('Debug: First few pricelists:', pricelists.slice(0, 2))
    
    return { pricelists: pricelists as PriceItem[], total: pricelists.length }
  } catch (error) {
    console.error('Error getting pricelists with filters:', error)
    throw error
  }
} 

// Check if database is properly configured
export const checkDatabaseConfiguration = async (): Promise<any> => {
  try {
    console.log('Debug: Checking database configuration...')
    
    // Check if Cosmos DB client is initialized
    const { getPricelistContainer } = await import('../config/database')
    
    try {
      const pricelistContainer = getPricelistContainer()
      console.log('Debug: Pricelist container retrieved successfully')
      
      // Try to get container info
      const containerInfo = await pricelistContainer.read()
      console.log('Debug: Container info:', {
        id: containerInfo.container.id
      })
      
      return {
        success: true,
        containerId: containerInfo.container.id,
        message: 'Database is properly configured'
      }
    } catch (containerError) {
      console.error('Debug: Error accessing container:', containerError)
      return {
        success: false,
        error: containerError instanceof Error ? containerError.message : 'Unknown container error',
        message: 'Failed to access pricelist container'
      }
    }
  } catch (error) {
    console.error('Debug: Database configuration check failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Database configuration check failed'
    }
  }
} 