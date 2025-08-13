import apiClient from "./axios-config";

// Maintenance summary data
interface MaintenanceSummaryResponse {
  success: boolean;
  message: string;
  data: {
    totalMaintenanceCost: {
      doors: number;
      floors: number;
      windows: number;
      walls: number;
      roofs: number;
      areas: number;
    };
  };
}

export const getMaintenanceSummaryData = async () => {
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
};
