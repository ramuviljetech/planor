"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
} from "react";
import { commonService } from "@/networking/common-service";

interface MaintenanceCost {
  doors: number;
  floors: number;
  windows: number;
  walls: number;
  roofs: number;
  areas: number;
}

interface Client {
  id: string;
  clientName: string;
  clientId: string;
  properties: number;
  createdOn: string;
  status: string;
  primaryContactName: string;
  primaryContactEmail: string;
  address: string;
  industryType: string;
  timezone: string;
  updatedAt: string;
  totalMaintenanceCost: MaintenanceCost;
}

interface Statistics {
  totalClients: number;
  newClientsThisMonth: number;
  totalFileUploads: number;
  totalBuildings: number;
  filteredClients: number;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface ClientsState {
  data: Client[];
  statistics: Statistics;
  pagination: Pagination;
  isLoading: boolean;
  lastFetched: number | null;
}

interface DataProviderContextType {
  clients: ClientsState;
  fetchClients: (page?: number) => Promise<void>;
  updateClientsPagination: (page: number) => void;
}

const DataProviderContext = createContext<DataProviderContextType | undefined>(
  undefined
);

interface DataProviderProps {
  children: ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const [clients, setClients] = useState<ClientsState>({
    data: [],
    statistics: {
      totalClients: 0,
      newClientsThisMonth: 0,
      totalFileUploads: 0,
      totalBuildings: 0,
      filteredClients: 0,
    },
    pagination: {
      currentPage: 1,
      totalPages: 1,
      itemsPerPage: 10,
      hasNextPage: false,
      hasPreviousPage: false,
    },
    isLoading: false,
    lastFetched: null,
  });

  const fetchClients = useCallback(async (page = 1) => {
    // Check if data is already cached and fresh (5 minutes) - only for same page
    const isFresh =
      clients.lastFetched &&
      Date.now() - clients.lastFetched < 5 * 60 * 1000 &&
      clients.pagination.currentPage === page;

    if (clients.data.length > 0 && isFresh) {
      return;
    }
    // Only set loading if not already loading
    setClients((prev) => ({ ...prev, isLoading: true }));

    try {
      // Use common service for API call
      const response = await commonService.getClients(page, 5);
      setClients({
        data: response.clients || [],
        statistics: response.statistics || {
          totalClients: 0,
          newClientsThisMonth: 0,
          totalFileUploads: 0,
          totalBuildings: 0,
          filteredClients: 0,
        },
        pagination: response.pagination || {
          currentPage: 1,
          totalPages: 1,
          itemsPerPage: 10,
          hasNextPage: false,
          hasPreviousPage: false,
        },
        isLoading: false,
        lastFetched: Date.now(),
      });
    } catch (error) {
      setClients((prev) => ({
        ...prev,
        isLoading: false,
        // Keep the previous data if there's an error during pagination
        data: prev.data.length > 0 ? prev.data : [],
        pagination:
          prev.data.length > 0
            ? prev.pagination
            : {
                currentPage: 1,
                totalPages: 1,
                itemsPerPage: 10,
                hasNextPage: false,
                hasPreviousPage: false,
              },
      }));
    }
  }, []);

  const updateClientsPagination = useCallback(
    (page: number) => {
      // Prevent multiple calls if already loading or same page
      if (clients.isLoading || clients.pagination.currentPage === page) {
        return;
      }

      // Set loading state immediately
      setClients((prev) => ({
        ...prev,
        isLoading: true,
        pagination: { ...prev.pagination, currentPage: page },
      }));
      // Fetch new page data
      fetchClients(page);
    },
    [fetchClients, clients.isLoading, clients.pagination.currentPage]
  );

  const value: DataProviderContextType = {
    clients,
    fetchClients,
    updateClientsPagination,
  };

  return (
    <DataProviderContext.Provider value={value}>
      {children}
    </DataProviderContext.Provider>
  );
};

export const useDataProvider = () => {
  const context = useContext(DataProviderContext);
  if (context === undefined) {
    throw new Error("useDataProvider must be used within a DataProvider");
  }
  return context;
};
