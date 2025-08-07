import apiClient from "./axios-config";

// Maintenance summary data
interface MaintenanceSummaryResponse {
  success: boolean;
  message: string;
  data: {
    totalCosts: {
      doors: number;
      floors: number;
      windows: number;
      walls: number;
      roofs: number;
      areas: number;
    };
  };
}

class DashboardApiService {
  // Dashboard summary data
  async getMaintenanceSummaryData(): Promise<MaintenanceSummaryResponse> {
    try {
      const response = await apiClient.get("/admin/dashboard");
      return response.data;
    } catch (error) {
      console.error(
        "❌ DashboardApiService: Error fetching maintenance summary data:",
        error
      );
      throw error;
    }
  }
}

// Export a singleton instance
export const dashboardApiService = new DashboardApiService();
