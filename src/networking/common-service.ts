import apiClient from "./axios-config";

interface MaintenanceCost {
  doors: number;
  floors: number;
  windows: number;
  walls: number;
  roofs: number;
  areas: number;
}

interface Client {
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

interface Statistics {
  totalClients: number;
  newClientsThisMonth: number;
  totalFileUploads: number;
  totalBuildings: number;
  filteredClients: number;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface ClientsApiResponse {
  clients: Client[];
  statistics: Statistics;
  pagination: Pagination;
}

class CommonService {
  // Clients API
  async getClients(
    page: number = 1,
    limit: number = 10
  ): Promise<ClientsApiResponse> {
    try {
      const response = await apiClient.post(`/clients`, {
        page,
        limit,
      });
      return response.data.data;
    } catch (error) {
      console.error(`❌ CommonService: Error fetching clients:`, error);
      throw error;
    }
  }

  // Add more API methods here as needed
  // async getProperties(page: number = 1, limit: number = 10) { ... }
  // async getBuildings(page: number = 1, limit: number = 10) { ... }
}

// Export a singleton instance
export const commonService = new CommonService();
