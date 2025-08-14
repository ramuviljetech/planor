"use client";
import React, { useState, useMemo, useRef, useEffect } from "react";
import MaintenanceSection from "@/sections/dashboard-section/maintenance";
import MetricCard from "@/components/ui/metric-card";
import {
  clientsStaticCardTitle,
  rowsData,
  mockPropertiesData,
  mockPropertiesPagination,
} from "@/app/constants";
import BottomSheet from "@/components/ui/bottom-sheet";
import ClientPropertiesList from "@/sections/clients-section/client-properties-list";
import SectionHeader from "@/components/ui/section-header";
import PopOver from "@/components/ui/popover";
import TableFilter from "@/components/ui/table-filter";
import Image from "next/image";
import { filterIcon } from "@/resources/images";
import CommonTableWithPopover, {
  PopoverAction,
} from "@/components/ui/common-table-with-popover";
import { TableColumn, TableRow } from "@/components/ui/common-table";
import { useRouter } from "next/navigation";
import AddClientUserModal from "@/components/add-client-user-modal";
import AddPropertyModal from "@/components/add-property-modal";
import Modal from "@/components/ui/modal";
import ClientsFilter from "@/sections/clients-section/clients-filter";
import { useAuth } from "@/providers";
import FallbackScreen from "@/components/ui/fallback-screen";
import { getMaintenanceSummaryData } from "@/networking/dashboard-api-service";
import {
  getClients,
  getPropertiesByClientId,
} from "@/networking/client-api-service";
import styles from "./styles.module.css";
import { getPropertyDetailsById } from "@/networking/properties-api-service";

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
  const itemsPerPage = 5;
  const router = useRouter();
  const [showClientsFilter, setShowClientsFilter] = useState<boolean>(false);
  const [clientProperties, setClientProperties] = useState<any>([]);
  const [loderForClientProperties, setLoderForClientProperties] =
    useState<boolean>(false);
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

  // Transform API clients data to table format
  const transformedClientsData = useMemo(() => {
    if (!clientsData.data || clientsData.data.length === 0) {
      return [];
    }

    return clientsData.data.map((client) => ({
      id: client.id,
      clientName: client.clientName,
      clientId: client.clientId,
      properties: client.properties,
      createdOn: new Date(client.createdOn).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      maintenanceCost: Object.values(client.totalMaintenanceCost || {}).reduce(
        (sum, cost) => sum + cost,
        0
      ),
      status: client.status === "active" ? "Active" : "Inactive",
    }));
  }, [clientsData.data]);

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

  // Table data and handlers
  const ClientsTableColumns: TableColumn[] = [
    {
      key: "clientName",
      title: "Client Name",
      width: "calc(100% / 5)",
    },
    {
      key: "clientId",
      title: "Client ID",
      width: "calc(100% / 6)",
    },
    {
      key: "properties",
      title: "Properties",
      width: "calc(100% / 7)",
    },
    {
      key: "createdOn",
      title: "Created On",
      width: "calc(100% / 6)",
    },
    {
      key: "maintenanceCost",
      title: "Maintenance Cost",
      width: "calc(100% / 7)",
    },
    {
      key: "status",
      title: "Status",
      width: "calc(100% / 7)",
      render: (value: any, row: any, index: number) => (
        <div
          className={`${styles.statusBadge} ${
            value === "Active" ? styles.statusActive : styles.statusInactive
          }`}
        >
          {value}
        </div>
      ),
    },
  ];

  const totalItems =
    clientsData.statistics?.totalClients || transformedClientsData.length;
  const totalPages =
    clientsData.pagination?.totalPages || Math.ceil(totalItems / itemsPerPage);
  const currentPageFromApi = clientsData.pagination?.currentPage || 1;

  // Use the data directly from API response since it's already paginated
  const currentRows = transformedClientsData;

  const ClientStatistics = [
    {
      title: "Total Clients",
      value: clientsData.statistics?.totalClients || 0,
    },
    {
      title: "New This Month",
      value: clientsData.statistics?.newClientsThisMonth || 0,
    },
    {
      title: "Total Buildings",
      value: clientsData.statistics?.totalBuildings || 0,
    },
    {
      title: "File Uploads",
      value: clientsData.statistics?.totalFileUploads || 0,
    },
  ];

  const handleRowClick = async (row: TableRow, index: number) => {
    setShowBottomSheet(true);
    setLoderForClientProperties(true);
    try {
      let response = await getPropertiesByClientId(row.id.toString());
      if (response.success && response.data) {
        console.log("response", response.data);
        setClientProperties(response.data);
      }
    } catch (error) {
      console.error("Error fetching client properties:", error);
    } finally {
      setLoderForClientProperties(false);
    }
  };

  const handlePageChange = (page: number) => {
    console.log("🔄 Dashboard: Page change requested to page", page);
    setSelectedRowId("");
    fetchClientsData(page);
  };

  const handleViewDetails = (rowData: any) => {
    router.push(`/property-details?id=${rowData.id}`);
  };

  const handleAddProperty = (rowData: any) => {
    setSelectedRowId(rowData.id);
    setTimeout(() => {
      setShowAddPropertyModal(true);
    }, 100);
  };

  // Define actions for the popover
  const actions: PopoverAction[] = [
    {
      label: "View Properties",
      onClick: handleViewDetails,
    },
    {
      label: "Add Property",
      onClick: handleAddProperty,
    },
  ];

  // Callback for when filters change in the maintenance component
  const handleFiltersChange = (filter: string, year: string) => {
    setSelectedFilter(filter);
    setSelectedYearlyMaintenanceSummary(year);
    // TODO: Trigger API call here to fetch new data based on the selected filters
    // For now, we can refresh the dashboard data when filters change
    // fetchMaintenanceSummaryData();
  };

  const renderClients = () => {
    // Show loader while fetching data

    return (
      <div className={styles.dashboard_clients_container}>
        {/* top container */}
        <SectionHeader
          title="Clients"
          searchValue={clientsSearchValue}
          onSearchChange={setClientsSearchValue}
          searchPlaceholder="Search properties..."
          actionButtonTitle="Add Client"
          onActionButtonClick={() => {
            setShowAddClientUserModal(true);
          }}
          filterComponent={
            <div
              className={styles.dashboard_clients_filter_icon}
              // ref={clientsFilterRef}
              onClick={() => setShowClientsFilter(true)}
            >
              <Image src={filterIcon} alt="filter" width={24} height={24} />
            </div>
          }
          searchBarStyle={styles.dashboard_clients_search_bar}
          actionButtonStyle={styles.dashboard_clients_add_client_button}
        />
        {clientsData.isLoading && clientsData.data.length === 0 ? (
          <div className={styles.dashboard_clients_container}>
            <FallbackScreen
              title="Loading Clients"
              subtitle="Please wait while we fetch your clients data..."
              className={styles.clients_loading_fallback}
            />
          </div>
        ) : (
          <>
            <div className={styles.dashboard_clients_middle_container}>
              {ClientStatistics.map((statistic, index) => (
                <MetricCard
                  key={index}
                  title={statistic.title}
                  value={statistic.value}
                  className={styles.dashboard_clients_static_card}
                  titleStyle={styles.dashboard_clients_static_card_title}
                />
              ))}
            </div>
            <div className={styles.table_container_wrapper}>
              {clientsData.data.length !== 0 ? (
                <CommonTableWithPopover
                  columns={ClientsTableColumns}
                  rows={currentRows}
                  onRowClick={handleRowClick}
                  selectedRowId={selectedRowId}
                  pagination={{
                    currentPage: currentPageFromApi,
                    totalPages,
                    totalItems,
                    itemsPerPage,
                    onPageChange: handlePageChange,
                    showItemCount: true,
                  }}
                  actions={actions}
                  actionIconClassName={styles.actionIcon}
                  popoverMenuClassName={styles.action_popoverMenu}
                  popoverMenuItemClassName={styles.action_popoverMenuItem}
                  disabled={clientsData.isLoading}
                />
              ) : (
                <div className={styles.no_clients_found_container}>
                  <p className={styles.no_clients_found_text}>
                    No clients found
                  </p>
                </div>
              )}
              {clientsData.isLoading && clientsData.data.length > 0 && (
                <div className={styles.pagination_loading_overlay}>
                  <div className={styles.pagination_loading_spinner}>
                    <div className={styles.spinner}></div>
                    <span>Loading...</span>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    );
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
      {renderClients()}
      <BottomSheet
        isOpen={showBottomSheet}
        onClose={() => {
          setShowBottomSheet(false);
          setSelectedRowId("");
        }}
        title="Brunnfast AB"
        backButton={true}
        onBackButton={() => {
          setShowBottomSheet(false);
          setSelectedRowId("");
        }}
      >
        {loderForClientProperties && (
          <div className={styles.client_properties_loading}>
            <FallbackScreen
              title="Loading Client Properties"
              subtitle="Please wait while we fetch your client properties..."
              className={styles.client_properties_loading_fallback}
            />
          </div>
        )}
        <ClientPropertiesList
          propertiesData={clientProperties?.properties || []}
          statistics={clientProperties?.statistics}
          pagination={
            clientProperties?.pagination || {
              currentPage: 1,
              totalPages: 1,
              totalItems: 0,
              itemsPerPage: 10,
            }
          }
        />
      </BottomSheet>
      <AddClientUserModal
        show={showAddClientUserModal}
        onClose={() => setShowAddClientUserModal(false)}
      />
      <AddPropertyModal
        show={showAddPropertyModal}
        onClose={() => setShowAddPropertyModal(false)}
      />
      <Modal
        show={showClientsFilter}
        onClose={() => setShowClientsFilter(false)}
        closeOnOutSideClick={true}
        container_style={styles.clients_filter_modal_container_style}
        overlay_style={styles.clients_filter_modal_overlay_style}
      >
        <ClientsFilter
          onClose={() => setShowClientsFilter(false)}
          onApplyFilters={(data: any) => {
            console.log("data", data);
          }}
        />
      </Modal>
    </div>
  );
}
