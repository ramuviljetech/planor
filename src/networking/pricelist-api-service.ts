import apiClient from "./axios-config";


export class PriceListApiService {
  async getPriceList(): Promise<any> {
    try {
      const response = await apiClient.get("/pricelist");
      return response.data;
    } catch (error) {
      console.error("❌ PriceListApiService: Error getting price list:", error);
      throw error;
    }
  }
}

export const pricelistApiService = new PriceListApiService();