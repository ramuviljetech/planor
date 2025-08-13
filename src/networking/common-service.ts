import { apiClient } from "./axios-config";
import {
  Property,
  PropertiesStatistics,
  PropertiesPagination,
} from "@/types/property";

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

interface PropertiesApiResponse {
  success: boolean;
  message: string;
  data: {
    properties: Property[];
    count: number;
    statistics: PropertiesStatistics;
    pagination: PropertiesPagination;
  };
}

class CommonService {
  // Clients API

  async getProperties(): Promise<PropertiesApiResponse> {
    try {
      const response = await apiClient.get("/properties");
      return response.data;
    } catch (error) {
      console.error(`❌ CommonService: Error fetching properties:`, error);
      throw error;
    }
  }

  // Add more API methods here as needed
  // async getProperties(page: number = 1, limit: number = 10) { ... }
  // async getBuildings(page: number = 1, limit: number = 10) { ... }
}

// Export a singleton instance
export const commonService = new CommonService();
