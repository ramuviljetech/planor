import { getUsersContainer, getBuildingsContainer, getPropertiesContainer, getPricelistContainer } from "../config/database"
import { Client, CreateClientRequest, UserRole, UserStatus, ClientFilters } from "../types"
import { v4 as uuidv4 } from 'uuid'

export interface QueryBuilderResult {
  query: string;
  parameters: any[];
}

export interface MaintenanceCost {
  doors: number;
  floors: number;
  windows: number;
  walls: number;
  roofs: number;
  areas: number;
}

export interface ClientStatistics {
  totalMaintenanceCost: MaintenanceCost;
  // totalMaintenanceCost: number;
}

export interface ProcessedClient {
  id: string;
  clientName: string;
  clientId: string;
  properties: number;
  createdOn: string;
  status: string;
  primaryContactName: string;
  primaryContactEmail: string;
  address: string;
  industryType: string;
  timezone: string;
  updatedAt: string;
  totalMaintenanceCost: MaintenanceCost;
}

/**
 * Builds the main client query with filters
 */
export function buildClientQuery(filters: ClientFilters): QueryBuilderResult {
  let query = 'SELECT * FROM c WHERE c.role = "client"';
  const parameters: any[] = [];
  let paramIdx = 0;

  // Handle general search field that searches across multiple fields
  if (filters.search) {
    paramIdx++;
    query += ` AND (
      CONTAINS(c.clientName, @search${paramIdx}) OR 
      CONTAINS(c.organizationNumber, @search${paramIdx}) OR 
      CONTAINS(c.primaryContactName, @search${paramIdx}) OR 
      CONTAINS(c.primaryContactEmail, @search${paramIdx}) OR 
      CONTAINS(c.address, @search${paramIdx}) OR 
      CONTAINS(c.industryType, @search${paramIdx}) OR 
      CONTAINS(c.status, @search${paramIdx})
    )`;
    parameters.push({ name: `@search${paramIdx}`, value: filters.search });
  }

  // Individual field filters (only apply if general search is not used)
  if (!filters.search) {
    if (filters.clientName) {
      paramIdx++;
      query += ` AND CONTAINS(c.clientName, @clientName${paramIdx})`;
      parameters.push({ name: `@clientName${paramIdx}`, value: filters.clientName });
    }

    if (filters.clientId) {
      paramIdx++;
      query += ` AND c.id = @clientId${paramIdx}`;
      parameters.push({ name: `@clientId${paramIdx}`, value: filters.clientId });
    }

    if (filters.status) {
      paramIdx++;
      query += ` AND c.status = @status${paramIdx}`;
      parameters.push({ name: `@status${paramIdx}`, value: filters.status });
    }
  }

  // Date range filter (works with both general search and individual filters)
  if (filters.createdOn && typeof filters.createdOn === 'object') {
    const { from, to } = filters.createdOn;
  
    if (from) {
      paramIdx++;
      query += ` AND c.createdAt >= @createdFrom${paramIdx}`;
      parameters.push({ name: `@createdFrom${paramIdx}`, value: from });
    }
  
    if (to) {
      paramIdx++;
      query += ` AND c.createdAt <= @createdTo${paramIdx}`;
      parameters.push({ name: `@createdTo${paramIdx}`, value: to });
    }
  }

  // Maintenance cost filter (works with both general search and individual filters)
  if (filters.maintananceCost !== undefined) {
    paramIdx++;
    query += ` AND c.maintananceCost = @maintananceCost${paramIdx}`;
    parameters.push({ name: `@maintananceCost${paramIdx}`, value: filters.maintananceCost });
  }

  return { query, parameters };
}

/**
 * Builds the count query for total filtered clients
 */
export function buildCountQuery(filters: ClientFilters): QueryBuilderResult {
  let countQuery = 'SELECT VALUE COUNT(1) FROM c WHERE c.role = "client"';
  const countParameters: any[] = [];
  let countParamIdx = 0;

  // Handle general search field for count query
  if (filters.search) {
    countParamIdx++;
    countQuery += ` AND (
      CONTAINS(c.clientName, @search${countParamIdx}) OR 
      CONTAINS(c.organizationNumber, @search${countParamIdx}) OR 
      CONTAINS(c.primaryContactName, @search${countParamIdx}) OR 
      CONTAINS(c.primaryContactEmail, @search${countParamIdx}) OR 
      CONTAINS(c.address, @search${countParamIdx}) OR 
      CONTAINS(c.industryType, @search${countParamIdx}) OR 
      CONTAINS(c.status, @search${countParamIdx})
    )`;
    countParameters.push({ name: `@search${countParamIdx}`, value: filters.search });
  }

  // Individual field filters for count query (only apply if general search is not used)
  if (!filters.search) {
    if (filters.clientName) {
      countParamIdx++;
      countQuery += ` AND CONTAINS(c.clientName, @clientName${countParamIdx})`;
      countParameters.push({ name: `@clientName${countParamIdx}`, value: filters.clientName });
    }

    if (filters.clientId) {
      countParamIdx++;
      countQuery += ` AND c.id = @clientId${countParamIdx}`;
      countParameters.push({ name: `@clientId${countParamIdx}`, value: filters.clientId });
    }

    if (filters.status) {
      countParamIdx++;
      countQuery += ` AND c.status = @status${countParamIdx}`;
      countParameters.push({ name: `@status${countParamIdx}`, value: filters.status });
    }
  }

  // Date range filter for count query
  if (filters.createdOn && typeof filters.createdOn === 'object') {
    const { from, to } = filters.createdOn;
  
    if (from) {
      countParamIdx++;
      countQuery += ` AND c.createdAt >= @createdFrom${countParamIdx}`;
      countParameters.push({ name: `@createdFrom${countParamIdx}`, value: from });
    }
  
    if (to) {
      countParamIdx++;
      countQuery += ` AND c.createdAt <= @createdTo${countParamIdx}`;
      countParameters.push({ name: `@createdTo${countParamIdx}`, value: to });
    }
  }

  // Maintenance cost filter for count query
  if (filters.maintananceCost !== undefined) {
    countParamIdx++;
    countQuery += ` AND c.maintananceCost = @maintananceCost${countParamIdx}`;
    countParameters.push({ name: `@maintananceCost${countParamIdx}`, value: filters.maintananceCost });
  }

  return { query: countQuery, parameters: countParameters };
}

/**
 * Adds pagination to a query
 */
export function addPagination(query: string, page: number, limit: number): string {
  const offset = (page - 1) * limit;
  query += ' ORDER BY c.createdAt DESC';
  query += ` OFFSET ${offset} LIMIT ${limit}`;
  return query;
}

/**
 * Gets date range for new clients this month query
 */
export function getNewClientsDateRange(): { start: string; end: string } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();
  return { start, end };
}

/**
 * Calculates maintenance costs for a building object
 */
export function calculateBuildingMaintenanceCost(
  buildingObjects: any,
  priceMap: Map<string, number>
): MaintenanceCost {
  let totalMaintenanceCost: MaintenanceCost = {
    doors: 0,
    floors: 0,
    windows: 0,
    walls: 0,
    roofs: 0,
    areas: 0
  };

  if (!buildingObjects) return totalMaintenanceCost;

  // Iterate through all sections in buildingObjects
  for (const [sectionKey, section] of Object.entries(buildingObjects)) {
    if (Array.isArray(section)) {
      for (const obj of section) {
        // Calculate maintenance costs based on price and count/area
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
            
            switch (type) {
              case 'door':
                totalMaintenanceCost.doors += totalPrice;
                break;
              case 'floor':
                totalMaintenanceCost.floors += totalPrice;
                break;
              case 'window':
                totalMaintenanceCost.windows += totalPrice;
                break;
              case 'wall':
                totalMaintenanceCost.walls += totalPrice;
                break;
              case 'roof':
                totalMaintenanceCost.roofs += totalPrice;
                break;
              case 'area':
                totalMaintenanceCost.areas += totalPrice;
                break;
            }
          }
        }
      }
    }
  }

  return totalMaintenanceCost;
}

/**
 * Calculates comprehensive statistics for processed clients
 */
export function calculateClientStatistics(processedClients: ProcessedClient[]): ClientStatistics {
  // Calculate maintenance cost breakdown
  const maintenanceCostBreakdown = processedClients.reduce((breakdown, client) => {
    const clientCost = client?.totalMaintenanceCost || { doors: 0, floors: 0, windows: 0, walls: 0, roofs: 0, areas: 0 };
    breakdown.doors += clientCost.doors;
    breakdown.floors += clientCost.floors;
    breakdown.windows += clientCost.windows;
    breakdown.walls += clientCost.walls;
    breakdown.roofs += clientCost.roofs;
    breakdown.areas += clientCost.areas;
    return breakdown;
  }, { doors: 0, floors: 0, windows: 0, walls: 0, roofs: 0, areas: 0 });

  return {
    totalMaintenanceCost: maintenanceCostBreakdown, // Maintenance cost breakdown
  };
}

/**
 * Fetches clients with filters and returns comprehensive data
 */
export async function getClientsWithFilters(filters: ClientFilters): Promise<{
  clients: ProcessedClient[];
  statistics: {
    totalClients: number;
    newClientsThisMonth: number;
    totalFileUploads: number;
    totalBuildings: number;
    filteredClients: number;
  };
  pagination: {
    currentPage: number;
    totalPages: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}> {
  const usersContainer = getUsersContainer();
  const buildingsContainer = getBuildingsContainer();
  const propertiesContainer = getPropertiesContainer();
  const pricelistContainer = getPricelistContainer();

  // Build queries
  const { query, parameters } = buildClientQuery(filters);
  const { query: countQuery, parameters: countParameters } = buildCountQuery(filters);

  // Pagination parameters
  const page = Number(filters.page) || 1;
  const limit = Number(filters.limit) || 10;
  const paginatedQuery = addPagination(query, page, limit);

  // Get date range for new clients this month
  const { start, end } = getNewClientsDateRange();

  // Run parallel queries
  const [
    clientsResult,
    totalCountResult,
    propertyCountsResult,
    newClientsThisMonthCountResult
  ] = await Promise.all([
    usersContainer.items.query({ query: paginatedQuery, parameters }).fetchAll(),
    usersContainer.items.query({ query: countQuery, parameters: countParameters }).fetchAll(),
    propertiesContainer.items.query({
      query: `
        SELECT c.clientId, COUNT(1) AS propertyCount
        FROM c 
        GROUP BY c.clientId
      `
    }).fetchAll(),
    usersContainer.items.query({
      query: `
        SELECT VALUE COUNT(1)
        FROM c
        WHERE c.role = "client" AND c.createdAt >= @startDate AND c.createdAt <= @endDate
      `,
      parameters: [
        { name: '@startDate', value: start },
        { name: '@endDate', value: end }
      ]
    }).fetchAll()
  ]);

  const clients = clientsResult.resources;
  const totalFilteredClients = totalCountResult.resources[0] ?? 0;
  const propertyCounts = propertyCountsResult.resources;
  const newClientsThisMonthValue = newClientsThisMonthCountResult.resources[0] ?? 0;
  
  // Create property count map
  const propertyCountMap = new Map<string, number>();
  for (const row of propertyCounts) {
    propertyCountMap.set(row.clientId, row.propertyCount);
  }

  // Get maintenance costs for each client
  const clientMaintenanceCosts = new Map<string, MaintenanceCost>();

  // Get all buildings for the filtered clients
  const clientIdsForMaintenance = clients.map(client => client.id);
  
  if (clientIdsForMaintenance.length > 0) {
    const buildingsQuery = `
      SELECT c.clientId, c.id as buildingId
      FROM c
      WHERE c.type = "building" AND ARRAY_CONTAINS(@clientIds, c.clientId)
    `;

    const buildingsResult = await buildingsContainer.items.query({
      query: buildingsQuery,
      parameters: [{ name: '@clientIds', value: clientIdsForMaintenance }]
    }).fetchAll();

    const buildingIds = buildingsResult.resources.map(b => b.buildingId);
    
    if (buildingIds.length > 0) {
      // Get maintenance costs for all buildings using building objects
      const buildingsQuery = `
        SELECT c.clientId, c.id as buildingId, c.buildingObjects
        FROM c
        WHERE c.id IN (${buildingIds.map((_, i) => `@buildingId${i}`).join(',')})
      `;

      const buildingsResult = await buildingsContainer.items.query({
        query: buildingsQuery,
        parameters: buildingIds.map((id, i) => ({ name: `@buildingId${i}`, value: id }))
      }).fetchAll();

      // Get all price items for maintenance cost calculation
      const { resources: allPriceItems } = await pricelistContainer.items.query({
        query: 'SELECT * FROM c WHERE c.price > 0',
        parameters: []
      }).fetchAll();
      
      // Create a map of price items by type and object for quick lookup
      const priceMap = new Map<string, number>();
      for (const priceItem of allPriceItems) {
        const key = `${priceItem.type}_${priceItem.object}`;
        priceMap.set(key, priceItem.price);
      }

      // Group maintenance costs by client
      const clientBuildingMap = new Map<string, string[]>();
      for (const building of buildingsResult.resources) {
        const clientId = building.clientId;
        if (!clientBuildingMap.has(clientId)) {
          clientBuildingMap.set(clientId, []);
        }
        clientBuildingMap.get(clientId)!.push(building.buildingId);
      }

      // Calculate maintenance costs per client from building objects
      for (const [clientId, buildingIds] of clientBuildingMap) {
        let totalMaintenanceCost: MaintenanceCost = {
          doors: 0,
          floors: 0,
          windows: 0,
          walls: 0,
          roofs: 0,
          areas: 0
        };

        // Get buildings for this client
        const clientBuildings = buildingsResult.resources.filter(
          building => building.clientId === clientId
        );

        for (const building of clientBuildings) {
          if (building.buildingObjects) {
            const buildingCost = calculateBuildingMaintenanceCost(building.buildingObjects, priceMap);
            totalMaintenanceCost.doors += buildingCost.doors;
            totalMaintenanceCost.floors += buildingCost.floors;
            totalMaintenanceCost.windows += buildingCost.windows;
            totalMaintenanceCost.walls += buildingCost.walls;
            totalMaintenanceCost.roofs += buildingCost.roofs;
            totalMaintenanceCost.areas += buildingCost.areas;
          }
        }

        clientMaintenanceCosts.set(clientId, totalMaintenanceCost);
      }
    }
  }

  // Filter + transform clients
  const processedClients = clients
    .map(client => {
      const propertiesCount = propertyCountMap.get(client.id) ?? 0;

      if (filters.properties !== undefined && propertiesCount !== filters.properties) {
        return null;
      }

      const totalMaintenanceCost = clientMaintenanceCosts.get(client.id) ?? {
        doors: 0,
        floors: 0,
        windows: 0,
        walls: 0,
        roofs: 0,
        areas: 0
      };

      return {
        id: client.id,
        clientName: client.clientName,
        clientId: client.organizationNumber,
        properties: propertiesCount,
        createdOn: client.createdAt,
        status: client.status,
        primaryContactName: client.primaryContactName,
        primaryContactEmail: client.primaryContactEmail,
        address: client.address,
        industryType: client.industryType,
        timezone: client.timezone,
        updatedAt: client.updatedAt,
        totalMaintenanceCost
      };
    })
    .filter(Boolean) as ProcessedClient[];

  // Calculate statistics based on filtered clients
  const statistics = calculateClientStatistics(processedClients);

  // Get filtered building count (buildings for filtered clients only)
  let filteredBuildingsCountResult: any[] = [0];
  const filteredClientIds = processedClients.map(client => client?.id).filter(Boolean) as string[];

  if (filteredClientIds.length > 0) {
    const buildingsQuery = `
      SELECT VALUE COUNT(1)
      FROM c
      WHERE c.type = "building" AND ARRAY_CONTAINS(@clientIds, c.clientId)
    `;

    const buildingsResult = await buildingsContainer.items.query({
      query: buildingsQuery,
      parameters: [{ name: '@clientIds', value: filteredClientIds }]
    }).fetchAll();

    filteredBuildingsCountResult = buildingsResult.resources;
  }

  const filteredBuildingsValue = filteredBuildingsCountResult[0] ?? 0;

  // Calculate new clients this month
  const filteredNewClientsThisMonth = newClientsThisMonthValue;
 ;

  return {
    clients: processedClients,
    statistics: {
      totalClients: totalFilteredClients,
      newClientsThisMonth: filteredNewClientsThisMonth, // Based on filtered clients
      totalFileUploads: 0, // Placeholder
      totalBuildings: filteredBuildingsValue, // Based on filtered clients
      filteredClients: processedClients.length,
      ...statistics
    },
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(totalFilteredClients / limit),
      itemsPerPage: limit,
      hasNextPage: page * limit < totalFilteredClients,
      hasPreviousPage: page > 1
    }
  };
}

export const findClientByEmail = async (email: string): Promise<Client | null> => {
    try {
      const usersContainer = getUsersContainer()
      const query = {
        query: 'SELECT * FROM c WHERE c.primaryContactEmail = @email AND c.role = "client"',
        parameters: [{ name: '@email', value: email }]
      }
  
      const { resources: clients } = await usersContainer.items.query(query).fetchAll()
      return clients.length > 0 ? clients[0] : null
    } catch (error) {
      console.error('Error finding client by email:', error)
      throw error
    }
  }


  // Create new client
export const createClient = async (clientData: CreateClientRequest, adminId: string): Promise<Client> => {
    try {
      const usersContainer = getUsersContainer()
      const newClient: CreateClientRequest = {
        id: uuidv4(), // Using organization number as ID
        role: UserRole.CLIENT,
        clientName: clientData.clientName,
        primaryContactName: clientData.primaryContactName,
        primaryContactEmail: clientData.primaryContactEmail,
        primaryContactPhoneNumber: clientData.primaryContactPhoneNumber,
        address: clientData.address,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        organizationNumber: clientData.organizationNumber,
        industryType: clientData.industryType,
        timezone: clientData.timezone,
        primaryContactRole: clientData.primaryContactRole,
        status: UserStatus.ACTIVE,
        lastLoginAt: new Date().toISOString()
      } as CreateClientRequest
  
      // Attach adminId as a separate property after type assertion
      const clientToCreate = { ...newClient, adminId }
  
      const { resource: createdClient } = await usersContainer.items.create(clientToCreate)
      if (!createdClient) {
        throw new Error('Failed to create client')
      }
      // Patch missing properties to satisfy Client type
      return {
        ...createdClient,
        name: createdClient.clientName,
        contactPerson: createdClient.primaryContactName,
        email: createdClient.primaryContactEmail,
        phone: createdClient.primaryContactPhoneNumber,
        isActive: false, // Default to false or set as needed
      } as Client
    } catch (error) {
      console.error('Error creating client:', error)
      throw error
    }
  } 


  