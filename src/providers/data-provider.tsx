"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
} from "react";
import { commonService } from "@/networking/common-service";
import { dashboardApiService } from "@/networking/dashboard-api-service";

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

interface DashboardState {
  maintenanceSummary: MaintenanceCost;
  isLoading: boolean;
  lastFetched: number | null;
}

interface DataProviderContextType {
  clients: ClientsState;
  dashboard: DashboardState;
  fetchClients: (page?: number) => Promise<void>;
  fetchMaintenanceSummaryData: () => Promise<void>;
  forceRefreshDashboardData: () => Promise<void>;
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

  const [dashboard, setDashboard] = useState<DashboardState>({
    maintenanceSummary: {
      doors: 0,
      floors: 0,
      windows: 0,
      walls: 0,
      roofs: 0,
      areas: 0,
    },
    isLoading: false,
    lastFetched: null,
  });

  const fetchClients = useCallback(
    async (page = 1) => {
      // Check if data is already cached and fresh (5 minutes) - only for same page
      const isFresh =
        clients.lastFetched &&
        Date.now() - clients.lastFetched < 5 * 60 * 1000 &&
        clients.pagination.currentPage === page;

      // Only skip if we have data for the exact same page and it's fresh
      if (clients.data.length > 0 && isFresh) {
        console.log("✅ DataProvider: Using cached data for page", page);
        return;
      }
      // Set loading state immediately
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
            currentPage: page,
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
                  currentPage: page,
                  totalPages: 1,
                  itemsPerPage: 10,
                  hasNextPage: false,
                  hasPreviousPage: false,
                },
        }));
      }
    },
    [clients.lastFetched, clients.pagination.currentPage, clients.data.length]
  );

  const fetchMaintenanceSummaryData = useCallback(async () => {
    // Check if dashboard data is already cached and fresh (5 minutes)
    const isFresh =
      dashboard.lastFetched &&
      Date.now() - dashboard.lastFetched < 5 * 60 * 1000;

    // Only skip if we have data and it's fresh
    if (dashboard.maintenanceSummary.doors > 0 && isFresh) {
      console.log(
        "✅ DataProvider: Using cached dashboard data (last fetched:",
        dashboard.lastFetched
          ? new Date(dashboard.lastFetched).toLocaleTimeString()
          : "unknown",
        ")"
      );
      return;
    }
    // Set loading state immediately
    setDashboard((prev) => ({ ...prev, isLoading: true }));

    try {
      const data = await dashboardApiService.getMaintenanceSummaryData();
      setDashboard({
        maintenanceSummary: data.data.totalCosts,
        isLoading: false,
        lastFetched: Date.now(),
      });
    } catch (error) {
      console.error("❌ DataProvider: Error fetching dashboard data:", error);
      setDashboard((prev) => ({
        ...prev,
        isLoading: false,
      }));
    }
  }, [dashboard.lastFetched, dashboard.maintenanceSummary.doors]);

  const forceRefreshDashboardData = useCallback(async () => {
    // Set loading state immediately
    setDashboard((prev) => ({ ...prev, isLoading: true }));

    try {
      const data = await dashboardApiService.getMaintenanceSummaryData();
      setDashboard({
        maintenanceSummary: data.data.totalCosts,
        isLoading: false,
        lastFetched: Date.now(),
      });
    } catch (error) {
      console.error("❌ DataProvider: Error refreshing dashboard data:", error);
      setDashboard((prev) => ({
        ...prev,
        isLoading: false,
      }));
    }
  }, []);

  const updateClientsPagination = useCallback(
    (page: number) => {
      // Prevent multiple calls if already loading
      if (clients.isLoading) {
        console.log("⚠️ DataProvider: Already loading, skipping request");
        return;
      }

      fetchClients(page);
    },
    [fetchClients, clients.isLoading]
  );

  const value: DataProviderContextType = {
    clients,
    dashboard,
    fetchClients,
    fetchMaintenanceSummaryData,
    forceRefreshDashboardData,
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
