import { Property, CreatePropertyRequest, PropertyWithBuildingCount } from '../types'
import { getPropertiesContainer } from '../config/database'

// Find property by ID
export const findPropertyById = async (id: string): Promise<Property | null> => {
  try {
    const propertiesContainer = getPropertiesContainer()
    const { resource: property } = await propertiesContainer.item(id, id).read()
    return property || null
  } catch (error) {
    // console.error('Error finding property by ID:', error)
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
    // console.error('Error finding property by code:', error)
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
    // console.error('Error finding property by code excluding ID:', error)
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
    // console.error('Error getting all properties:', error)
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
    // console.error('Error getting properties by admin ID:', error)
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
    // console.error('Error getting properties by client ID:', error)
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
    // console.error('Error creating property:', error)
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
    // console.error('Error updating property:', error)
    throw error
  }
}

// Delete property
export const deleteProperty = async (id: string): Promise<void> => {
  try {
    const propertiesContainer = getPropertiesContainer()
    await propertiesContainer.item(id, id).delete()
  } catch (error) {
    // console.error('Error deleting property:', error)
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
    // console.error('Error searching properties:', error)
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
    // console.error('Error getting properties with filters:', error)
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
  totalMaintenanceCost: {
    doors: number;
    floors: number;
    windows: number;
    walls: number;
    roofs: number;
    areas: number;
  };
  // maintenanceUpdates: number;
}> => {
  try {
    // Get properties based on filters
    const properties = filters ? await getPropertiesWithFilters(filters) : await getAllProperties()
    
    // Import building functions
    const { getBuildingsByPropertyId } = await import('./building.entity')
    const { getPricelistContainer } = await import('../config/database')
    const pricelistContainer = getPricelistContainer()
    
    // Calculate statistics only for filtered properties
    let totalArea = 0
    let totalBuildings = 0
    let totalMaintenanceCost = {
      doors: 0,
      floors: 0,
      windows: 0,
      walls: 0,
      roofs: 0,
      areas: 0
    }
    let maintenanceUpdates = 0

    // Get all building IDs for efficient price querying
    const allBuildingIds: string[] = []
    
    // Process each filtered property
    for (const property of properties) {
      // Calculate total area from metadata
      if (property.metadata?.grossArea) {
        totalArea += property.metadata.grossArea
      }

      // Count buildings for this property and collect building IDs
      try {
        const buildings = await getBuildingsByPropertyId(property.id)
        totalBuildings += buildings.length
        buildings.forEach(building => allBuildingIds.push(building.id))
      } catch (error) {
        console.error(`Error getting buildings for property ${property.id}:`, error)
        // Continue processing other properties
      }
    }

    // Fetch all price items for all buildings in one query (optimized)
    if (allBuildingIds.length > 0) {
      try {
        // Get all buildings with their buildingObjects to calculate maintenance costs
        const { getBuildingsContainer } = await import('../config/database')
        const buildingsContainer = getBuildingsContainer()
        
        const buildingsQuery = {
          query: `SELECT c.id, c.buildingObjects FROM c WHERE c.id IN (${allBuildingIds.map((_, i) => `@buildingId${i}`).join(',')})`,
          parameters: allBuildingIds.map((id, i) => ({ name: `@buildingId${i}`, value: id }))
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
        console.error('Error calculating maintenance costs from building objects:', error)
      }
    }

    return {
      totalProperties: properties.length,
      totalArea,
      totalBuildings,
      totalMaintenanceCost,
      // maintenanceUpdates
    }
  } catch (error) {
    // console.error('Error calculating property statistics:', error)
    throw error
  }
} 


// Helper function to efficiently add building counts to properties
export const addBuildingCountsToProperties = async (properties: Property[]): Promise<PropertyWithBuildingCount[]> => {
  try {
    if (properties.length === 0) {
      return properties.map(property => ({ ...property, numOfBuildings: 0 }));
    }

    // Get all property IDs
    const propertyIds = properties.map(property => property.id);
    
    // Import building functions
    const { getBuildingsContainer } = await import('../config/database');
    const buildingsContainer = getBuildingsContainer();

    // Create a map to store building counts for each property
    const buildingCountsMap = new Map<string, number>();
    
    // Initialize all properties with 0 building count
    propertyIds.forEach(id => buildingCountsMap.set(id, 0));

    try {
      // For Cosmos DB, we'll use a more reliable approach by querying all buildings
      // and filtering in memory since IN queries can be problematic
      const allBuildingsQuery = {
        query: 'SELECT c.propertyId FROM c'
      };

      const { resources: buildings } = await buildingsContainer.items.query(allBuildingsQuery).fetchAll();
      
      // Count buildings for each property using a more efficient approach
      const propertyIdSet = new Set(propertyIds);
      buildings.forEach(building => {
        const propertyId = building.propertyId;
        if (propertyIdSet.has(propertyId)) {
          buildingCountsMap.set(propertyId, buildingCountsMap.get(propertyId)! + 1);
        }
      });
    } catch (error) {
      // console.error('Error counting buildings efficiently:', error);
      // Fallback: count buildings individually for each property
      const { getBuildingsByPropertyId } = await import('../entities/building.entity');
      
      // Use Promise.all for parallel execution to improve performance
      const buildingCountPromises = properties.map(async (property) => {
        try {
          const buildings = await getBuildingsByPropertyId(property.id);
          return { propertyId: property.id, count: buildings.length };
        } catch (buildingError) {
          // console.error(`Error counting buildings for property ${property.id}:`, buildingError);
          return { propertyId: property.id, count: 0 };
        }
      });
      
      const buildingCounts = await Promise.all(buildingCountPromises);
      buildingCounts.forEach(({ propertyId, count }) => {
        buildingCountsMap.set(propertyId, count);
      });
    }

    // Add building counts to properties
    return properties.map(property => ({
      ...property,
      numOfBuildings: buildingCountsMap.get(property.id) || 0
    }));
  } catch (error) {
    //      console.error('Error adding building counts to properties:', error);
    // Return properties with 0 building count as fallback
    return properties.map(property => ({ ...property, numOfBuildings: 0 }));
  }
};

// Get properties with filters, pagination, and statistics (optimized)
export const getPropertiesWithFiltersAndStats = async (filters: any, page: number = 1, limit: number = 10) => {
  try {
    const { getPropertiesContainer, getBuildingsContainer, getPricelistContainer } = await import('../config/database');
    const propertiesContainer = getPropertiesContainer();
    const buildingsContainer = getBuildingsContainer();
    const pricelistContainer = getPricelistContainer();

    // Pagination values
    const currentPage = Math.max(1, page);
    const itemsPerPage = Math.max(1, Math.min(100, limit));
    const offset = (currentPage - 1) * itemsPerPage;

    // Build the base WHERE clause for properties
    let whereClause = 'WHERE 1=1';
    const parameters: any[] = [];
    let paramIndex = 0;

    if (filters.adminId) {
      paramIndex++;
      whereClause += ` AND c.adminId = @adminId${paramIndex}`;
      parameters.push({ name: `@adminId${paramIndex}`, value: filters.adminId });
    }

    if (filters.clientId) {
      paramIndex++;
      whereClause += ` AND c.clientId = @clientId${paramIndex}`;
      parameters.push({ name: `@clientId${paramIndex}`, value: filters.clientId });
    }

    if (filters.search) {
      paramIndex++;
      whereClause += ` AND (CONTAINS(c.propertyName, @search${paramIndex}, true) 
                    OR CONTAINS(c.propertyCode, @search${paramIndex}, true)
                    OR CONTAINS(c.address, @search${paramIndex}, true)
                    OR CONTAINS(c.city, @search${paramIndex}, true))`;
      parameters.push({ name: `@search${paramIndex}`, value: filters.search });
    }

    // Execute all queries in parallel for maximum performance
    const [
      propertiesResult,
      totalCountResult,
      totalAreaResult,
      inactiveCountResult,
      allBuildingsResult,
      priceItemsResult
    ] = await Promise.all([
      // Get paginated properties with all needed fields
      propertiesContainer.items.query({
        query: `
          SELECT 
            c.id, c.propertyName, c.propertyCode, c.address, c.city, c.state, c.zipCode,
            c.propertyType, c.metadata.grossArea, c.adminId, c.clientId, c.inactive, c.createdAt, c.updatedAt
          FROM c 
          ${whereClause}
          ORDER BY c.createdAt DESC
          OFFSET @offset LIMIT @limit
        `,
        parameters: [...parameters, { name: '@offset', value: offset }, { name: '@limit', value: itemsPerPage }]
      }).fetchAll(),

      // Get total count - simple COUNT query
      propertiesContainer.items.query({
        query: `SELECT VALUE COUNT(1) FROM c ${whereClause}`,
        parameters: parameters
      }).fetchAll(),

      // Get total area - simple SUM query
      propertiesContainer.items.query({
        query: `SELECT VALUE SUM(c.metadata.grossArea) FROM c ${whereClause}`,
        parameters: parameters
      }).fetchAll(),

      // Get inactive count - simple COUNT with additional filter
      propertiesContainer.items.query({
        query: `SELECT VALUE COUNT(1) FROM c ${whereClause} AND c.inactive = true`,
        parameters: parameters
      }).fetchAll(),

      // Get all buildings (we'll filter in memory based on property filters)
      buildingsContainer.items.query({
        query: `
          SELECT 
            c.id,
            c.propertyId,
            c.buildingObjects
          FROM c 
          WHERE c.type = 'building'
        `,
        parameters: []
      }).fetchAll(),

      // Get all price items for maintenance cost calculation
      pricelistContainer.items.query({
        query: `
          SELECT 
            c.type,
            c.object,
            c.price
          FROM c 
          WHERE c.price > 0
        `,
        parameters: []
      }).fetchAll()
    ]);

    // Process results
    const properties = propertiesResult.resources || [];
    
    // Extract statistics from simple query results
    const totalProperties = totalCountResult.resources[0] || 0;
    const totalArea = totalAreaResult.resources[0] || 0;
    const inactiveProperties = inactiveCountResult.resources[0] || 0;

    // Get all property IDs that match the filters for building filtering
    const filteredPropertyIds = new Set<string>();
    if (totalProperties > 0) {
      // Get all property IDs that match the filters (without pagination)
      const allFilteredPropertiesResult = await propertiesContainer.items.query({
        query: `SELECT c.id FROM c ${whereClause}`,
        parameters: parameters
      }).fetchAll();
      
      allFilteredPropertiesResult.resources.forEach((property: any) => {
        filteredPropertyIds.add(property.id);
      });
    }

    // Filter buildings to only include those belonging to filtered properties
    const filteredBuildings = allBuildingsResult.resources.filter((building: any) => 
      filteredPropertyIds.has(building.propertyId)
    );

    // Create building counts map for efficient lookup
    const buildingCountsMap = new Map<string, number>();
    filteredBuildings.forEach((building: any) => {
      const propertyId = building.propertyId;
      buildingCountsMap.set(propertyId, (buildingCountsMap.get(propertyId) || 0) + 1);
    });

    // Add building counts to properties efficiently
    const propertiesWithBuildingCounts = properties.map(property => ({
      ...property,
      numOfBuildings: buildingCountsMap.get(property.id) || 0
    }));

    // Calculate total buildings from filtered buildings
    const totalBuildings = filteredBuildings.length;

    // Process maintenance costs from building objects and price items (filtered by property filters)
    const maintenanceCostsMap = new Map<string, number>();
    
    if (priceItemsResult.resources && priceItemsResult.resources.length > 0 && filteredBuildings.length > 0) {
      
      // Create a map of price items by type and object for quick lookup
      const priceMap = new Map<string, number>();
      priceItemsResult.resources.forEach((item: any) => {
        if (item.type && item.object && item.price) {
          const key = `${item.type}_${item.object}`;
          priceMap.set(key, item.price);
        }
      });

      // Calculate maintenance costs by processing building objects (only for filtered properties)
      filteredBuildings.forEach((building: any) => {
        if (building.buildingObjects) {
          for (const [sectionKey, section] of Object.entries(building.buildingObjects)) {
            if (Array.isArray(section)) {
              section.forEach((obj: any) => {
                const type = obj.type?.toLowerCase();
                const object = obj.object;
                
                if (type && object) {
                  const priceKey = `${type}_${object}`;
                  const price = priceMap.get(priceKey) || 0;
                  
                  if (price > 0) {
                    let totalPrice = 0;
                    
                    // Calculate total price based on count or area
                    if (obj.count && typeof obj.count === 'number' && obj.count > 0) {
                      totalPrice = price * obj.count;
                    } else if (obj.area && typeof obj.area === 'number' && obj.area > 0) {
                      totalPrice = price * obj.area;
                    } else {
                      totalPrice = price;
                    }
                    
                    // Add to the appropriate maintenance cost category
                    switch (type) {
                      case 'door':
                        maintenanceCostsMap.set('doors', (maintenanceCostsMap.get('doors') || 0) + totalPrice);
                        break;
                      case 'floor':
                        maintenanceCostsMap.set('floors', (maintenanceCostsMap.get('floors') || 0) + totalPrice);
                        break;
                      case 'window':
                        maintenanceCostsMap.set('windows', (maintenanceCostsMap.get('windows') || 0) + totalPrice);
                        break;
                      case 'wall':
                        maintenanceCostsMap.set('walls', (maintenanceCostsMap.get('walls') || 0) + totalPrice);
                        break;
                      case 'roof':
                        maintenanceCostsMap.set('roofs', (maintenanceCostsMap.get('roofs') || 0) + totalPrice);
                        break;
                      case 'area':
                        maintenanceCostsMap.set('areas', (maintenanceCostsMap.get('areas') || 0) + totalPrice);
                        break;
                    }
                  }
                }
              });
            }
          }
        }
      });
    }

    // Calculate total pages
    const totalPages = Math.ceil(totalProperties / itemsPerPage);

    return {
      properties: propertiesWithBuildingCounts,
      count: totalProperties,
      statistics: {
        totalProperties,
        totalArea,
        inactiveProperties,
        totalBuildings,
        totalMaintenanceCost: {
          doors: maintenanceCostsMap.get('doors') || 0,
          floors: maintenanceCostsMap.get('floors') || 0,
          windows: maintenanceCostsMap.get('windows') || 0,
          walls: maintenanceCostsMap.get('walls') || 0,
          roofs: maintenanceCostsMap.get('roofs') || 0,
          areas: maintenanceCostsMap.get('areas') || 0
        }
      },
      pagination: {
        currentPage,
        itemsPerPage,
        totalItems: totalProperties,
        totalPages,
        hasNextPage: currentPage < totalPages,
        hasPreviousPage: currentPage > 1
      }
    };
  } catch (error) {
    // console.error('Error in getPropertiesWithFiltersAndStats:', error);
    throw error;
  }
};


// export const getEmptyPropertiesResponse = async (filters: any = {}, page: number = 1, limit: number = 10) => {
//   try {
//     const { getPropertiesContainer, getBuildingsContainer, getPricelistContainer } = await import('../config/database');
//     const propertiesContainer = getPropertiesContainer();
//     const buildingsContainer = getBuildingsContainer();
//     const pricelistContainer = getPricelistContainer();

//     const currentPage = Math.max(1, page);
//     const itemsPerPage = Math.max(1, Math.min(100, limit));

//     // Build the base WHERE clause for properties (same as main function)
//     let whereClause = 'WHERE 1=1';
//     const parameters: any[] = [];
//     let paramIndex = 0;

//     if (filters.adminId) {
//       paramIndex++;
//       whereClause += ` AND c.adminId = @adminId${paramIndex}`;
//       parameters.push({ name: `@adminId${paramIndex}`, value: filters.adminId });
//     }

//     if (filters.clientId) {
//       paramIndex++;
//       whereClause += ` AND c.clientId = @clientId${paramIndex}`;
//       parameters.push({ name: `@clientId${paramIndex}`, value: filters.clientId });
//     }

//     if (filters.search) {
//       paramIndex++;
//       whereClause += ` AND (CONTAINS(c.propertyName, @search${paramIndex}, true) 
//                     OR CONTAINS(c.propertyCode, @search${paramIndex}, true)
//                     OR CONTAINS(c.address, @search${paramIndex}, true)
//                     OR CONTAINS(c.city, @search${paramIndex}, true))`;
//       parameters.push({ name: `@search${paramIndex}`, value: filters.search });
//     }

//     // Get all buildings and filter in memory based on property filters
//     const [allBuildingsResult, priceItemsResult] = await Promise.all([
//       buildingsContainer.items.query({
//         query: `
//           SELECT 
//             c.id,
//             c.propertyId,
//             c.buildingObjects
//           FROM c 
//           WHERE c.type = 'building'
//         `,
//         parameters: []
//       }).fetchAll(),

//       pricelistContainer.items.query({
//         query: `
//           SELECT 
//             c.type,
//             c.object,
//             c.price
//           FROM c 
//           WHERE c.price > 0
//         `,
//         parameters: []
//       }).fetchAll()
//     ]);

//     // Get all property IDs that match the filters for building filtering
//     const filteredPropertyIds = new Set<string>();
//     const allFilteredPropertiesResult = await propertiesContainer.items.query({
//       query: `SELECT c.id FROM c ${whereClause}`,
//       parameters: parameters
//     }).fetchAll();
    
//     allFilteredPropertiesResult.resources.forEach((property: any) => {
//       filteredPropertyIds.add(property.id);
//     });

//     // Filter buildings to only include those belonging to filtered properties
//     const filteredBuildings = allBuildingsResult.resources.filter((building: any) => 
//       filteredPropertyIds.has(building.propertyId)
//     );

//     // Process maintenance costs even for empty results (filtered by property filters)
//     const maintenanceCostsMap = new Map<string, number>();
    
//     if (priceItemsResult.resources && priceItemsResult.resources.length > 0 && filteredBuildings.length > 0) {
      
//       // Create a map of price items by type and object for quick lookup
//       const priceMap = new Map<string, number>();
//       priceItemsResult.resources.forEach((item: any) => {
//         if (item.type && item.object && item.price) {
//           const key = `${item.type}_${item.object}`;
//           priceMap.set(key, item.price);
//         }
//       });
      
//       // Calculate maintenance costs by processing building objects (only for filtered properties)
//       filteredBuildings.forEach((building: any) => {
//         if (building.buildingObjects) {
//           for (const [sectionKey, section] of Object.entries(building.buildingObjects)) {
//             if (Array.isArray(section)) {
//               section.forEach((obj: any) => {
//                 const type = obj.type?.toLowerCase();
//                 const object = obj.object;
                
//                 if (type && object) {
//                   const priceKey = `${type}_${object}`;
//                   const price = priceMap.get(priceKey) || 0;
                  
//                   if (price > 0) {
//                     let totalPrice = 0;
                    
//                     // Calculate total price based on count or area
//                     if (obj.count && typeof obj.count === 'number' && obj.count > 0) {
//                       totalPrice = price * obj.count;
//                     } else if (obj.area && typeof obj.area === 'number' && obj.area > 0) {
//                       totalPrice = price * obj.area;
//                     } else {
//                       totalPrice = price;
//                     }
                    
//                     // Add to the appropriate maintenance cost category
//                     switch (type) {
//                       case 'door':
//                         maintenanceCostsMap.set('doors', (maintenanceCostsMap.get('doors') || 0) + totalPrice);
//                         break;
//                       case 'floor':
//                         maintenanceCostsMap.set('floors', (maintenanceCostsMap.get('floors') || 0) + totalPrice);
//                         break;
//                       case 'window':
//                         maintenanceCostsMap.set('windows', (maintenanceCostsMap.get('windows') || 0) + totalPrice);
//                         break;
//                       case 'wall':
//                         maintenanceCostsMap.set('walls', (maintenanceCostsMap.get('walls') || 0) + totalPrice);
//                         break;
//                       case 'roof':
//                         maintenanceCostsMap.set('roofs', (maintenanceCostsMap.get('roofs') || 0) + totalPrice);
//                         break;
//                       case 'area':
//                         maintenanceCostsMap.set('areas', (maintenanceCostsMap.get('areas') || 0) + totalPrice);
//                         break;
//                     }
//                   }
//                 }
//               });
//             }
//           }
//         }
//       });
//     }

//     // Calculate total buildings from filtered buildings
//     const totalBuildings = filteredBuildings.length;

//     return {
//       properties: [],
//       count: 0,
//       statistics: {
//         totalProperties: 0,
//         totalArea: 0,
//         inactiveProperties: 0,
//         totalBuildings,
//         totalMaintenanceCost: {
//           doors: maintenanceCostsMap.get('doors') || 0,
//           floors: maintenanceCostsMap.get('floors') || 0,
//           windows: maintenanceCostsMap.get('windows') || 0,
//           walls: maintenanceCostsMap.get('walls') || 0,
//           roofs: maintenanceCostsMap.get('roofs') || 0,
//           areas: maintenanceCostsMap.get('areas') || 0
//         }
//       },
//       pagination: {
//         currentPage,
//         itemsPerPage,
//         totalItems: 0,
//         totalPages: 0,
//         hasNextPage: false,
//         hasPreviousPage: false
//       }
//     };
//   } catch (error) {
//     console.error('Error in getEmptyPropertiesResponse:', error);
//     throw error;
//   }
// };

// Get filtered statistics only (without pagination)
// export const getFilteredStatistics = async (filters: any = {}) => {
//   try {
//     const { getPropertiesContainer, getBuildingsContainer, getPricelistContainer } = await import('../config/database');
//     const propertiesContainer = getPropertiesContainer();
//     const buildingsContainer = getBuildingsContainer();
//     const pricelistContainer = getPricelistContainer();

//     // Build the base WHERE clause for properties
//     let whereClause = 'WHERE 1=1';
//     const parameters: any[] = [];
//     let paramIndex = 0;

//     if (filters.adminId) {
//       paramIndex++;
//       whereClause += ` AND c.adminId = @adminId${paramIndex}`;
//       parameters.push({ name: `@adminId${paramIndex}`, value: filters.adminId });
//     }

//     if (filters.clientId) {
//       paramIndex++;
//       whereClause += ` AND c.clientId = @clientId${paramIndex}`;
//       parameters.push({ name: `@clientId${paramIndex}`, value: filters.clientId });
//     }

//     if (filters.search) {
//       paramIndex++;
//       whereClause += ` AND (CONTAINS(c.propertyName, @search${paramIndex}, true) 
//                     OR CONTAINS(c.propertyCode, @search${paramIndex}, true)
//                     OR CONTAINS(c.address, @search${paramIndex}, true)
//                     OR CONTAINS(c.city, @search${paramIndex}, true))`;
//       parameters.push({ name: `@search${paramIndex}`, value: filters.search });
//     }

//     // Execute statistics queries in parallel
//     const [
//       totalCountResult,
//       totalAreaResult,
//       inactiveCountResult,
//       allBuildingsResult,
//       priceItemsResult
//     ] = await Promise.all([
//       // Get total count
//       propertiesContainer.items.query({
//         query: `SELECT VALUE COUNT(1) FROM c ${whereClause}`,
//         parameters: parameters
//       }).fetchAll(),

//       // Get total area
//       propertiesContainer.items.query({
//         query: `SELECT VALUE SUM(c.totalArea) FROM c ${whereClause}`,
//         parameters: parameters
//       }).fetchAll(),

//       // Get inactive count
//       propertiesContainer.items.query({
//         query: `SELECT VALUE COUNT(1) FROM c ${whereClause} AND c.inactive = true`,
//         parameters: parameters
//       }).fetchAll(),

//       // Get all buildings (we'll filter in memory based on property filters)
//       buildingsContainer.items.query({
//         query: `
//           SELECT 
//             c.id,
//             c.propertyId,
//             c.buildingObjects
//           FROM c 
//           WHERE c.type = 'building'
//         `,
//         parameters: []
//       }).fetchAll(),

//       // Get all price items for maintenance cost calculation
//       pricelistContainer.items.query({
//         query: `
//           SELECT 
//             c.type,
//             c.object,
//             c.price
//           FROM c 
//           WHERE c.price > 0
//         `,
//         parameters: []
//       }).fetchAll()
//     ]);

//     // Extract statistics from query results
//     const totalProperties = totalCountResult.resources[0] || 0;
//     const totalArea = totalAreaResult.resources[0] || 0;
//     const inactiveProperties = inactiveCountResult.resources[0] || 0;

//     // Get all property IDs that match the filters for building filtering
//     const filteredPropertyIds = new Set<string>();
//     if (totalProperties > 0) {
//       const allFilteredPropertiesResult = await propertiesContainer.items.query({
//         query: `SELECT c.id FROM c ${whereClause}`,
//         parameters: parameters
//       }).fetchAll();
      
//       allFilteredPropertiesResult.resources.forEach((property: any) => {
//         filteredPropertyIds.add(property.id);
//       });
//     }

//     // Filter buildings to only include those belonging to filtered properties
//     const filteredBuildings = allBuildingsResult.resources.filter((building: any) => 
//       filteredPropertyIds.has(building.propertyId)
//     );

//     // Calculate total buildings from filtered buildings
//     const totalBuildings = filteredBuildings.length;

//     // Process maintenance costs from building objects and price items (filtered by property filters)
//     const maintenanceCostsMap = new Map<string, number>();
    
//     if (priceItemsResult.resources && priceItemsResult.resources.length > 0 && filteredBuildings.length > 0) {
      
//       // Create a map of price items by type and object for quick lookup
//       const priceMap = new Map<string, number>();
//       priceItemsResult.resources.forEach((item: any) => {
//         if (item.type && item.object && item.price) {
//           const key = `${item.type}_${item.object}`;
//           priceMap.set(key, item.price);
//         }
//       });

//       // Calculate maintenance costs by processing building objects (only for filtered properties)
//       filteredBuildings.forEach((building: any) => {
//         if (building.buildingObjects) {
//           for (const [sectionKey, section] of Object.entries(building.buildingObjects)) {
//             if (Array.isArray(section)) {
//               section.forEach((obj: any) => {
//                 const type = obj.type?.toLowerCase();
//                 const object = obj.object;
                
//                 if (type && object) {
//                   const priceKey = `${type}_${object}`;
//                   const price = priceMap.get(priceKey) || 0;
                  
//                   if (price > 0) {
//                     let totalPrice = 0;
                    
//                     // Calculate total price based on count or area
//                     if (obj.count && typeof obj.count === 'number' && obj.count > 0) {
//                       totalPrice = price * obj.count;
//                     } else if (obj.area && typeof obj.area === 'number' && obj.area > 0) {
//                       totalPrice = price * obj.area;
//                     } else {
//                       totalPrice = price;
//                     }
                    
//                     // Add to the appropriate maintenance cost category
//                     switch (type) {
//                       case 'door':
//                         maintenanceCostsMap.set('doors', (maintenanceCostsMap.get('doors') || 0) + totalPrice);
//                         break;
//                       case 'floor':
//                         maintenanceCostsMap.set('floors', (maintenanceCostsMap.get('floors') || 0) + totalPrice);
//                         break;
//                       case 'window':
//                         maintenanceCostsMap.set('windows', (maintenanceCostsMap.get('windows') || 0) + totalPrice);
//                         break;
//                       case 'wall':
//                         maintenanceCostsMap.set('walls', (maintenanceCostsMap.get('walls') || 0) + totalPrice);
//                         break;
//                       case 'roof':
//                         maintenanceCostsMap.set('roofs', (maintenanceCostsMap.get('roofs') || 0) + totalPrice);
//                         break;
//                       case 'area':
//                         maintenanceCostsMap.set('areas', (maintenanceCostsMap.get('areas') || 0) + totalPrice);
//                         break;
//                     }
//                   }
//                 }
//               });
//             }
//           }
//         }
//       });
//     }

//     return {
//       totalProperties,
//       totalArea,
//       inactiveProperties,
//       totalBuildings,
//       totalMaintenanceCost: {
//         doors: maintenanceCostsMap.get('doors') || 0,
//         floors: maintenanceCostsMap.get('floors') || 0,
//         windows: maintenanceCostsMap.get('windows') || 0,
//         walls: maintenanceCostsMap.get('walls') || 0,
//         roofs: maintenanceCostsMap.get('roofs') || 0,
//         areas: maintenanceCostsMap.get('areas') || 0
//       }
//     };
//   } catch (error) {
//     console.error('Error in getFilteredStatistics:', error);
//     throw error;
//   }
// };