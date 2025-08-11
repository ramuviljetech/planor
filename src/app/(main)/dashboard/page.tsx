"use client";
import React, { useState, useMemo, useRef, useEffect } from "react";
import MaintenanceSection from "@/sections/dashboard-section/maintenance";
import MetricCard from "@/components/ui/metric-card";
import { clientsStaticCardTitle, rowsData } from "@/app/constants";
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
import { useDataProvider } from "@/providers/data-provider";
import FallbackScreen from "@/components/ui/fallback-screen";
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

export default function DashboardPage() {
  const { user } = useAuth();
  const {
    clients,
    dashboard,
    fetchClients,
    fetchMaintenanceSummaryData,
    forceRefreshDashboardData,
    updateClientsPagination,
  } = useDataProvider();
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
  const [selectedRowId, setSelectedRowId] = useState<string | number>("");
  const itemsPerPage = 5;
  const router = useRouter();
  const [showClientsFilter, setShowClientsFilter] = useState<boolean>(false);

  // Fetch dashboard data when component mounts (with caching)
  useEffect(() => {
    // Only fetch if we don't have maintenance data yet
    const hasMaintenanceData =
      dashboard.maintenanceSummary &&
      (dashboard.maintenanceSummary.doors > 0 ||
        dashboard.maintenanceSummary.floors > 0 ||
        dashboard.maintenanceSummary.windows > 0 ||
        dashboard.maintenanceSummary.walls > 0 ||
        dashboard.maintenanceSummary.roofs > 0 ||
        dashboard.maintenanceSummary.areas > 0);

    if (!hasMaintenanceData && !dashboard.isLoading) {
      console.log("🔄 Dashboard: Fetching maintenance data (no cached data)");
      fetchMaintenanceSummaryData();
    } else {
      console.log(
        "✅ Dashboard: Using existing maintenance data (doors:",
        dashboard.maintenanceSummary.doors,
        ")"
      );
    }
  }, [
    fetchMaintenanceSummaryData,
    dashboard.maintenanceSummary,
    dashboard.isLoading,
  ]);

  // Fetch clients data when dashboard loads (with caching)
  useEffect(() => {
    // Only fetch if we don't have clients data yet
    if (clients.data.length === 0 && !clients.isLoading) {
      console.log("🔄 Dashboard: Fetching clients data (no cached data)");
      fetchClients(1);
    } else {
      console.log(
        "✅ Dashboard: Using existing clients data (count:",
        clients.data.length,
        ")"
      );
    }
  }, [fetchClients, clients.data.length, clients.isLoading]);

  // Transform API clients data to table format
  const transformedClientsData = useMemo(() => {
    if (!clients.data || clients.data.length === 0) {
      return [];
    }

    return clients.data.map((client) => ({
      id: client.id,
      clientName: client.clientName,
      clientId: client.clientId,
      properties: client.properties,
      createdOn: new Date(client.createdOn).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      maintenanceCost: Object.values(client.totalMaintenanceCost).reduce(
        (sum, cost) => sum + cost,
        0
      ),
      status: client.status === "active" ? "Active" : "Inactive",
    }));
  }, [clients.data]);

  // Transform maintenance summary data to dashboard format
  const dashboardApiData = useMemo(() => {
    if (!dashboard.maintenanceSummary) {
      return {
        metricCards: [],
        contributionData: [],
        totalValue: "0K",
        totalPercentageChange: "0%",
      };
    }

    const totalCosts = dashboard.maintenanceSummary;
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
  }, [dashboard.maintenanceSummary]);

  // Table data and handlers
  const columns: TableColumn[] = [
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
    clients.statistics?.totalClients || transformedClientsData.length;
  const totalPages =
    clients.pagination?.totalPages || Math.ceil(totalItems / itemsPerPage);
  const currentPageFromApi = clients.pagination?.currentPage || 1;

  // Use the data directly from API response since it's already paginated
  const currentRows = transformedClientsData;

  const handleRowClick = (row: TableRow, index: number) => {
    setShowBottomSheet(true);
    setSelectedRowId(row.id);
  };

  const handlePageChange = (page: number) => {
    console.log("🔄 Dashboard: Page change requested to page", page);
    setSelectedRowId("");
    updateClientsPagination(page);
  };

  const handleViewDetails = (rowId: string | number) => {
    router.push("/property-details");
  };

  const handleAddProperty = (rowId: string | number) => {
    console.log("Add Property clicked for row:", rowId);
    setShowAddPropertyModal(true);
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
    // fetchDashboardData();
  };

  // Manual refresh function for dashboard data
  const handleRefreshDashboard = () => {
    console.log("🔄 Dashboard: Manual refresh requested");
    forceRefreshDashboardData();
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
        {clients.isLoading && clients.data.length === 0 ? (
          <div className={styles.dashboard_clients_container}>
            <FallbackScreen
              title="Loading Clients"
              subtitle="Please wait while we fetch your clients data..."
              className={styles.clients_loading_fallback}
            />
          </div>
        ) : (
          <>
            {/* middle container */}
            <div className={styles.dashboard_clients_middle_container}>
              <MetricCard
                title="Total Clients"
                value={clients.statistics?.totalClients || 0}
                className={styles.dashboard_clients_static_card}
                titleStyle={styles.dashboard_clients_static_card_title}
              />
              <MetricCard
                title="New This Month"
                value={clients.statistics?.newClientsThisMonth || 0}
                className={styles.dashboard_clients_static_card}
                titleStyle={styles.dashboard_clients_static_card_title}
              />
              <MetricCard
                title="Total Buildings"
                value={clients.statistics?.totalBuildings || 0}
                className={styles.dashboard_clients_static_card}
                titleStyle={styles.dashboard_clients_static_card_title}
              />
              <MetricCard
                title="File Uploads"
                value={clients.statistics?.totalFileUploads || 0}
                className={styles.dashboard_clients_static_card}
                titleStyle={styles.dashboard_clients_static_card_title}
              />
            </div>
            <div className={styles.table_container_wrapper}>
              {clients.data.length !== 0 ? (
                <CommonTableWithPopover
                  columns={columns}
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
                  disabled={clients.isLoading}
                />
              ) : (
                <div className={styles.no_clients_found_container}>
                  <p className={styles.no_clients_found_text}>
                    No clients found
                  </p>
                </div>
              )}
              {clients.isLoading && clients.data.length > 0 && (
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
          disabled={dashboard.isLoading || clients.isLoading}
        >
          🔄 Refresh Data
        </button>
      </div> */}

      {/* Yearly Maintenance Costs Summary */}
      {dashboard.isLoading ? (
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
        <ClientPropertiesList />
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
