import apiClient from "./axios-config";
import { tokenManager } from "../utils/token-manager";

export class ApiService {
  // Generic GET request
  static async get<T>(url: string, config?: any): Promise<T> {
    try {
      const response = await apiClient.get(url, config);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Request failed");
    }
  }

  // Generic POST request
  static async post<T>(url: string, data?: any, config?: any): Promise<T> {
    try {
      const response = await apiClient.post(url, data, config);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Request failed");
    }
  }

  // Generic PUT request
  static async put<T>(url: string, data?: any, config?: any): Promise<T> {
    try {
      const response = await apiClient.put(url, data, config);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Request failed");
    }
  }

  // Generic PATCH request
  static async patch<T>(url: string, data?: any, config?: any): Promise<T> {
    try {
      const response = await apiClient.patch(url, data, config);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Request failed");
    }
  }

  // Generic DELETE request
  static async delete<T>(url: string, config?: any): Promise<T> {
    try {
      const response = await apiClient.delete(url, config);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Request failed");
    }
  }

  // Upload file
  static async uploadFile<T>(
    url: string,
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<T> {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await apiClient.post(url, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress(progress);
          }
        },
      });

      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "File upload failed");
    }
  }

  // Download file
  static async downloadFile(url: string, filename?: string): Promise<void> {
    try {
      const response = await apiClient.get(url, {
        responseType: "blob",
      });

      const blob = new Blob([response.data]);
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = filename || "download";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "File download failed");
    }
  }

  // Check if user is authenticated
  static isAuthenticated(): boolean {
    return tokenManager.isTokenValid();
  }

  // Get auth header
  static getAuthHeader(): string | null {
    return tokenManager.getAuthHeader();
  }
}

export default ApiService;
