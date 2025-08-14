"use client";
import React, { useState, useMemo, useEffect } from "react";
import MaintenanceSection from "@/sections/dashboard-section/maintenance";
import BottomSheet from "@/components/ui/bottom-sheet";
import ClientPropertiesList from "@/sections/clients-section/client-properties-list";
import ClientsList from "@/sections/clients-section/clients-list";
import { useRouter } from "next/navigation";
import AddClientUserModal from "@/components/add-client-user-modal";
import AddPropertyModal from "@/components/add-property-modal";
import { useAuth } from "@/providers";
import FallbackScreen from "@/components/ui/fallback-screen";
import { getMaintenanceSummaryData } from "@/networking/dashboard-api-service";
import {
  getClients,
  getPropertiesByClientId,
} from "@/networking/client-api-service";
import styles from "./styles.module.css";

// Fixed colors for metric cards based on title
const titleColorMap: Record<string, string> = {
  Doors: "var(--lavender-sky)",
  Floors: "var(--aqua-mist)",
  Roof: "var(--pink-blush)",
  Walls: "var(--sunbeam)",
  Windows: "var(--royal-indigo)",
  Area: "var(--neon-mint)",
};

interface MaintenanceSummary {
  doors: number;
  floors: number;
  windows: number;
  walls: number;
  roofs: number;
  areas: number;
}

interface ClientData {
  id: string;
  clientName: string;
  clientId: string;
  properties: number;
  createdOn: string;
  totalMaintenanceCost: Record<string, number>;
  status: string;
}

interface DashboardData {
  maintenanceSummary: MaintenanceSummary | null;
  isLoading: boolean;
  error: string | null;
}

interface ClientsData {
  data: ClientData[];
  statistics: {
    totalClients: number;
    newClientsThisMonth: number;
    totalBuildings: number;
    totalFileUploads: number;
  } | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
  } | null;
  isLoading: boolean;
  error: string | null;
}

export default function DashboardPage() {
  const { user } = useAuth();

  // Local state for dashboard data
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    maintenanceSummary: null,
    isLoading: false,
    error: null,
  });

  // Local state for clients data
  const [clientsData, setClientsData] = useState<ClientsData>({
    data: [],
    statistics: null,
    pagination: null,
    isLoading: false,
    error: null,
  });

  const [selectedFilter, setSelectedFilter] = useState<string>("clients");
  const [
    selectedYearlyMaintenanceSummary,
    setSelectedYearlyMaintenanceSummary,
  ] = useState<string>("thisYear");
  const [showAddClientUserModal, setShowAddClientUserModal] =
    useState<boolean>(false);
  const [showAddPropertyModal, setShowAddPropertyModal] =
    useState<boolean>(false);
  const [showBottomSheet, setShowBottomSheet] = useState<boolean>(false);
  const [clientsSearchValue, setClientsSearchValue] = useState<string>("");
  const [selectedRowId, setSelectedRowId] = useState<string>("");
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const itemsPerPage = 5;
  const router = useRouter();
  const [clientProperties, setClientProperties] = useState<any>([]);
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(false);

  const [propertyPagination, setPropertyPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: itemsPerPage,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  // Fetch maintenance summary data
  const fetchMaintenanceSummaryData = async () => {
    try {
      setDashboardData((prev) => ({ ...prev, isLoading: true, error: null }));
      const response = await getMaintenanceSummaryData();

      if (response.success && response.data) {
        setDashboardData({
          maintenanceSummary: response.data.totalMaintenanceCost,
          isLoading: false,
          error: null,
        });
      } else {
        throw new Error(response.message || "Failed to fetch maintenance data");
      }
    } catch (error) {
      console.error("Error fetching maintenance summary:", error);
      setDashboardData((prev) => ({
        ...prev,
        isLoading: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch maintenance data",
      }));
    }
  };

  // Fetch clients data
  const fetchClientsData = async (page: number = 1) => {
    try {
      setClientsData((prev) => ({ ...prev, isLoading: true, error: null }));
      const response = await getClients(page, itemsPerPage);
      console.log("clients response", response);
      if (response.success && response.data) {
        // Transform the API response to match our expected format
        const transformedClients =
          response.data.clients || response.data.data || [];
        const statistics = response.data.statistics || {
          totalClients: response.data.totalClients || transformedClients.length,
          newClientsThisMonth: response.data.newClientsThisMonth || 0,
          totalBuildings: response.data.totalBuildings || 0,
          totalFileUploads: response.data.totalFileUploads || 0,
        };
        const pagination = response.data.pagination || {
          currentPage: page,
          totalPages: Math.ceil(
            (response.data.totalClients || transformedClients.length) /
              itemsPerPage
          ),
          totalItems: response.data.totalClients || transformedClients.length,
        };

        setClientsData({
          data: transformedClients,
          statistics,
          pagination,
          isLoading: false,
          error: null,
        });
      } else {
        throw new Error(response.message || "Failed to fetch clients data");
      }
    } catch (error) {
      console.error("Error fetching clients:", error);
      setClientsData((prev) => ({
        ...prev,
        isLoading: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch clients data",
      }));
    }
  };

  // Fetch dashboard data when component mounts
  useEffect(() => {
    fetchMaintenanceSummaryData();
  }, []);

  // Fetch clients data when dashboard loads
  useEffect(() => {
    fetchClientsData(1);
  }, []);

  // Transform maintenance summary data to dashboard format
  const dashboardApiData = useMemo(() => {
    if (!dashboardData.maintenanceSummary) {
      return {
        metricCards: [],
        contributionData: [],
        totalValue: "0K",
        totalPercentageChange: "0%",
      };
    }

    const totalCosts = dashboardData.maintenanceSummary;
    const totalValue = Object.values(totalCosts).reduce(
      (sum: number, value: any) => sum + (value || 0),
      0
    );

    // Transform the API data to match our expected format
    const metricCards = [
      {
        title: "Doors",
        value: totalCosts.doors || 0,
        percentageChange: 3.4, // You might want to get this from API
        color: titleColorMap["Doors"] || "var(--lavender-sky)",
        percentage:
          totalValue > 0
            ? Math.round((totalCosts.doors / totalValue) * 100)
            : 0,
      },
      {
        title: "Floors",
        value: totalCosts.floors || 0,
        percentageChange: 11.4,
        color: titleColorMap["Floors"] || "var(--aqua-mist)",
        percentage:
          totalValue > 0
            ? Math.round((totalCosts.floors / totalValue) * 100)
            : 0,
      },
      {
        title: "Roof",
        value: totalCosts.roofs || 0,
        percentageChange: 3.4,
        color: titleColorMap["Roof"] || "var(--pink-blush)",
        percentage:
          totalValue > 0
            ? Math.round((totalCosts.roofs / totalValue) * 100)
            : 0,
      },
      {
        title: "Walls",
        value: totalCosts.walls || 0,
        percentageChange: -1.4,
        color: titleColorMap["Walls"] || "var(--sunbeam)",
        percentage:
          totalValue > 0
            ? Math.round((totalCosts.walls / totalValue) * 100)
            : 0,
      },
      {
        title: "Windows",
        value: totalCosts.windows || 0,
        percentageChange: 7.2,
        color: titleColorMap["Windows"] || "var(--royal-indigo)",
        percentage:
          totalValue > 0
            ? Math.round((totalCosts.windows / totalValue) * 100)
            : 0,
      },
      {
        title: "Area",
        value: totalCosts.areas || 0,
        percentageChange: 4.4,
        color: titleColorMap["Area"] || "var(--neon-mint)",
        percentage:
          totalValue > 0
            ? Math.round((totalCosts.areas / totalValue) * 100)
            : 0,
      },
    ];

    const contributionData = metricCards.map((card) => ({
      title: card.title,
      value: card.value,
      color: card.color,
      percentage: card.percentage,
    }));

    // Format total value similar to MetricCard component
    const formatTotalValue = (val: number) => {
      if (val >= 1000) {
        const kValue = (val / 1000).toFixed(1);
        return kValue.endsWith(".0") ? kValue.slice(0, -2) + "K" : kValue + "K";
      } else {
        return val.toString();
      }
    };

    return {
      metricCards,
      contributionData,
      totalValue: formatTotalValue(totalValue),
      totalPercentageChange: "+3.4%", // You might want to get this from API
    };
  }, [dashboardData.maintenanceSummary]);

  const handleRowClick = async (rowData: any) => {
    console.log("🔄 Row clicked:", rowData);
    console.log("🔄 Setting selectedRowId to:", rowData.id);
    setSelectedRowId(rowData.id);
    setSelectedClientId(rowData.id); // Set selectedClientId

    setShowBottomSheet(true);
    setIsInitialLoading(true);
    // Reset pagination when selecting a new client
    setPropertyPagination({
      currentPage: 1,
      totalPages: 1,
      totalItems: 0,
      itemsPerPage: 10,
      hasNextPage: false,
      hasPreviousPage: false,
    });
    try {
      let response = await getPropertiesByClientId(
        rowData.id.toString(),
        1,
        10
      );
      if (response.success && response.data) {
        console.log("✅ Client properties response:", response.data);
        setClientProperties(response.data);
        // Update pagination from API response
        if (response.data.pagination) {
          console.log("✅ Using API pagination:", response.data.pagination);
          setPropertyPagination(response.data.pagination);
        } else {
          // Fallback pagination if API doesn't provide it
          const totalItems = response.data.properties?.length || 0;
          const totalPages = Math.ceil(totalItems / 10);
          const fallbackPagination = {
            currentPage: 1,
            totalPages: totalPages,
            totalItems: totalItems,
            itemsPerPage: 10,
            hasNextPage: totalPages > 1,
            hasPreviousPage: false,
          };
          console.log("✅ Using fallback pagination:", fallbackPagination);
          setPropertyPagination(fallbackPagination);
        }
      }
    } catch (error) {
      console.error("❌ Error fetching client properties:", error);
    } finally {
      setIsInitialLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    console.log("🔄 Dashboard: Page change requested to page", page);
    setSelectedRowId("");
    fetchClientsData(page);
  };

  const handlePropertyPageChange = async (page: number) => {
    console.log("🔄 Property page change requested to page", page);
    console.log("🔄 selectedClientId:", selectedClientId);

    if (!selectedClientId) {
      console.error("❌ No selectedClientId found, cannot fetch properties");
      return;
    }

    try {
      console.log(
        "🔄 Fetching properties for client:",
        selectedClientId,
        "page:",
        page
      );
      let response = await getPropertiesByClientId(
        selectedClientId.toString(),
        page,
        10
      );
      if (response.success && response.data) {
        console.log("✅ Property page response", response.data);
        setClientProperties(response.data);
        // Update pagination from API response
        if (response.data.pagination) {
          console.log("✅ Using API pagination:", response.data.pagination);
          setPropertyPagination(response.data.pagination);
        } else {
          // Fallback pagination if API doesn't provide it
          const totalItems = response.data.properties?.length || 0;
          const totalPages = Math.ceil(totalItems / 10);
          const fallbackPagination = {
            currentPage: page,
            totalPages: totalPages,
            totalItems: totalItems,
            itemsPerPage: 10,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1,
          };
          console.log("✅ Using fallback pagination:", fallbackPagination);
          setPropertyPagination(fallbackPagination);
        }
      }
    } catch (error) {
      console.error("❌ Error fetching client properties:", error);
    }
  };

  const handleViewClientDetails = (rowData: any) => {
    router.push(`/client-info?id=${rowData.id}`);
  };

  const handleAddProperty = (rowData: any) => {
    setSelectedRowId(rowData.id);
    setTimeout(() => {
      setShowAddPropertyModal(true);
    }, 100);
  };

  const handleAddClient = () => {
    setShowAddClientUserModal(true);
  };

  const handleClientsSearchChange = (value: string) => {
    setClientsSearchValue(value);
  };

  const handleClientsFilterApply = (filters: any) => {
    console.log("Applied filters:", filters);
    // TODO: Implement filter logic
  };

  const handleClientsRetry = () => {
    fetchClientsData(1);
  };

  // Callback for when filters change in the maintenance component
  const handleFiltersChange = (filter: string, year: string) => {
    setSelectedFilter(filter);
    setSelectedYearlyMaintenanceSummary(year);
    // TODO: Trigger API call here to fetch new data based on the selected filters
    // For now, we can refresh the dashboard data when filters change
    // fetchMaintenanceSummaryData();
  };

  return (
    <div className={styles.dashboard_container}>
      {/* <div className={styles.dashboard_header}>
        <p className={styles.dashboard_title}>Hey {user?.name}</p>
        <button
          onClick={handleRefreshDashboard}
          className={styles.refresh_button}
          disabled={dashboardData.isLoading || clientsData.isLoading}
        >
          🔄 Refresh Data
        </button>
      </div> */}

      {/* Yearly Maintenance Costs Summary */}
      {dashboardData.isLoading ? (
        <div className={styles.dashboard_maintenance_loading}>
          <FallbackScreen
            title="Loading Maintenance Data"
            subtitle="Please wait while we fetch your maintenance summary..."
            className={styles.maintenance_loading_fallback}
          />
        </div>
      ) : (
        <MaintenanceSection
          selectedFilter={selectedFilter}
          selectedYearlyMaintenanceSummary={selectedYearlyMaintenanceSummary}
          onFiltersChange={handleFiltersChange}
          metricCards={dashboardApiData.metricCards}
          contributionData={dashboardApiData.contributionData}
          totalValue={dashboardApiData.totalValue}
          totalPercentageChange={dashboardApiData.totalPercentageChange}
        />
      )}

      {/* Use the shared ClientsList component */}
      <ClientsList
        addClient={true}
        onAddClient={handleAddClient}
        clientsData={clientsData}
        onSearchChange={handleClientsSearchChange}
        onFilterApply={handleClientsFilterApply}
        onPageChange={handlePageChange}
        onRowClick={handleRowClick}
        onViewDetails={handleViewClientDetails}
        onAddProperty={handleAddProperty}
        onRetry={handleClientsRetry}
        searchValue={clientsSearchValue}
        currentPage={clientsData.pagination?.currentPage || 1}
        itemsPerPage={itemsPerPage}
      />

      <BottomSheet
        isOpen={showBottomSheet}
        onClose={() => {
          console.log("🔄 Bottom sheet closing, clearing selectedRowId");
          setShowBottomSheet(false);
          setSelectedRowId("");
          setSelectedClientId(""); // Clear selectedClientId when bottom sheet closes
        }}
        title="Brunnfast AB"
        backButton={true}
        onBackButton={() => {
          console.log(
            "🔄 Bottom sheet back button clicked, clearing selectedRowId"
          );
          setShowBottomSheet(false);
          setSelectedRowId("");
          setSelectedClientId(""); // Clear selectedClientId when back button is clicked
        }}
      >
        {isInitialLoading ? (
          <div className={styles.client_properties_loading}>
            <FallbackScreen
              title="Loading Client Properties"
              subtitle="Please wait while we fetch your client properties..."
              className={styles.client_properties_loading_fallback}
            />
          </div>
        ) : (
          <ClientPropertiesList
            propertiesData={clientProperties?.properties || []}
            statistics={clientProperties?.statistics}
            pagination={propertyPagination}
            onPageChange={handlePropertyPageChange}
            currentPage={propertyPagination.currentPage}
          />
        )}
      </BottomSheet>
      <AddClientUserModal
        show={showAddClientUserModal}
        onClose={() => setShowAddClientUserModal(false)}
      />
      <AddPropertyModal
        show={showAddPropertyModal}
        onClose={() => setShowAddPropertyModal(false)}
      />
    </div>
  );
}
