import apiClient from "./axios-config";

export const getProperties = async (page: number = 1, limit: number = 5) => {
  try {
    const response = await apiClient.get(
      `/properties?page=${page}&limit=${limit}`
    );
    return response.data;
  } catch (error) {
    console.error(`❌ PropertiesApiService: Error fetching properties:`, error);
    throw error;
  }
};

export const getPropertyDetailsById = async (id: string) => {
  try {
    const response = await apiClient.get(`/properties/${id}`);
    return response.data;
  } catch (error) {
    console.error(`❌ PropertiesApiService: Error fetching properties:`, error);
    throw error;
  }
};

export const getBuildingsByPropertyId = async (id: string) => {
  try {
    const response = await apiClient.get(`/buildings?propertyId=${id}`);
    return response.data;
  } catch (error) {
    console.error(`❌ PropertiesApiService: Error fetching buildings:`, error);
    throw error;
  }
};

export const getAllBuildings = async () => {
  try {
    const response = await apiClient.get("/buildings");
    return response.data;
  } catch (error) {
    console.error(`❌ PropertiesApiService: Error fetching buildings:`, error);
    throw error;
  }
};
