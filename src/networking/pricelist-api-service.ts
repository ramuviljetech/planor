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


export const putPriceList = async (priceList: any) => {
  try {
    const response = await apiClient.put("/pricelist", priceList);
    return response.data;
  } catch (error) {
    console.error("❌ PriceListApiService: Error putting price list:", error);
    throw error;
  }
}
