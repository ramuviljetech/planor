import apiClient from "./axios-config";

export class ClientsApiService {
    // Create client
    async createClient(clientData: any): Promise<any> {
      try {
        const response = await apiClient.post("/clients/register", clientData);
        console.log("✅ Client created successfully:", response.data);
        return response.data;
      } catch (error) {
        console.error(
          "❌ ClientsApiService: Error creating client:",
          error 
        );
        throw error;
      }
    }
  }
  
  // Export a singleton instance
  export const clientsApiService = new ClientsApiService();