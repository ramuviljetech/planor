import apiClient from "./axios-config";

export class ClientsApiService {
  // Create client
  async createClient(clientData: any): Promise<any> {
    try {
      const response = await apiClient.post("/clients/register", clientData);
      console.log("✅ Client created successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ ClientsApiService: Error creating client:", error);
      throw error;
    }
  }
}

// Export a singleton instance
export const clientsApiService = new ClientsApiService();

// Client info
export class ClientInfoApiService {
  // Get client info
  async getClientInfo(id: string): Promise<any> {
    try {
      const response = await apiClient.get(`/users/profile/${id}`);
      console.log("Client info:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ ClientInfoApiService: Error getting client info:", error);
      throw error;
    }
  }
}

// Export a singleton instance
export const clientInfoApiService = new ClientInfoApiService();

//user-details
export class UserDetailsApiService {
  // Get user details
  async getUserDetails(id: string): Promise<any> {
    try {
      const response = await apiClient.get(`/users/get-users/${id}`);
      console.log("User details:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ UserDetailsApiService: Error getting user details:", error);
      throw error;  
    }
  }
}

// Export a singleton instance
export const userDetailsApiService = new UserDetailsApiService();


//  properties

export class PropertiesApiService {
  // Get properties
  async getProperties(id: string): Promise<any> {

    try {
      const response = await apiClient.get(`/properties?clientId=${id}`);
      console.log("Properties:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ PropertiesApiService: Error getting properties:", error); 
      throw error;
    }
  }
}

// Export a singleton instance
export const propertiesApiService = new PropertiesApiService();

//maintance-plan api service
export class MaintancePlanApiService {
  // Get maintance plan
  async getMaintancePlan(id: string): Promise<any> {
    try {
      const response = await apiClient.get(`/buildings/update-maintenance`);
      console.log("Maintance plan:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ MaintancePlanApiService: Error getting maintance plan:", error);  
      throw error;
    }
  }
}

// Export a singleton instance
export const maintancePlanApiService = new MaintancePlanApiService();

