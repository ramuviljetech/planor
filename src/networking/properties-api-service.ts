// import { Property } from "@/types/property";
import apiClient from "./axios-config";

export const getProperties = async () => {
  try {
    const response = await apiClient.get("/properties");
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

export const addProperty = async (property: any) => {
  try {
    const response = await apiClient.post("/properties", property);
    return response.data;
  } catch (error) {
    console.error(`❌ PropertiesApiService: Error adding property:`, error);
    throw error;
  }
};