import { ClientDataTypes } from "@/types/client";
import apiClient from "./axios-config";

export const getClients = async (page: number = 1, limit: number = 10) => {
  try {
    const response = await apiClient.post(`/clients`, {
      page,
      limit,
    });
    return response.data;
  } catch (error) {
    console.error(`❌ ClientApiService: Error fetching clients:`, error);
    throw error;
  }
};

export const createClient = async (clientData: any) => {
  try {
    const response = await apiClient.post("/clients/register", clientData);
    console.log("✅ Client created successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ ClientApiService: Error creating client:", error);
    throw error;
  }
};

// Client info
export const getClientInfo = async (id: string) => {
  try {
    const response = await apiClient.get(`/users/profile/${id}`);
    console.log("Client info:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ ClientApiService: Error getting client info:", error);
    throw error;
  }
};

//user-details
export const getUserDetails = async (id: string) => {
  try {
    const response = await apiClient.get(`/users/get-users/${id}`);
    console.log("User details:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ ClientApiService: Error getting user details:", error);
    throw error;
  }
};

//  properties

export const getPropertiesByClientId = async (id: string) => {
  try {
    const response = await apiClient.get(`/properties?clientId=${id}`);
    console.log("Properties:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ ClientApiService: Error getting properties:", error);
    throw error;
  }
};

//maintance-plan api service
export const getMaintancePlan = async (id: string) => {
  try {
    const response = await apiClient.get(`/buildings/update-maintenance`);
    console.log("Maintance plan:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ ClientApiService: Error getting maintance plan:", error);
    throw error;
  }
};
