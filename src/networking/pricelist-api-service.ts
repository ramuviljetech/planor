import apiClient from "./axios-config";

export const getPriceList = async () => {
  try {
    const response = await apiClient.get("/pricelist");
    return response.data;
  } catch (error) {
    console.error("❌ PriceListApiService: Error getting price list:", error);
    throw error;
  }
};
