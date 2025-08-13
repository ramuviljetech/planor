"use client";
import React, { useState, useRef, useEffect, useMemo } from "react";
import Button from "@/components/ui/button";
import ClientDetails from "@/sections/clients-section/client-properties-list";
import SectionHeader from "@/components/ui/section-header";
import { filterIcon } from "@/resources/images";
import Image from "next/image";
import MetricCard from "@/components/ui/metric-card";
import CommonTableWithPopover, {
  PopoverAction,
} from "@/components/ui/common-table-with-popover";
import { clientsStaticCardTitle, rowsData } from "@/app/constants";
import { useRouter } from "next/navigation";
import AddClientUserModal from "@/components/add-client-user-modal";
import styles from "./styles.module.css";
import AddPropertyModal from "@/components/add-property-modal";
import FallbackScreen from "@/components/ui/fallback-screen";
import { getClients } from "@/networking/client-api-service";

// Client data interface matching the API response
interface ClientData {
  id: string;
  clientName: string;
  clientId: string;
  properties: number;
  createdOn: string;
  totalMaintenanceCost: Record<string, number>;
  status: string;
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

const Clients: React.FC = () => {
  // Local state for clients data
  const [clientsData, setClientsData] = useState<ClientsData>({
    data: [],
    statistics: null,
    pagination: null,
    isLoading: false,
    error: null,
  });

  const [clientsSearchValue, setClientsSearchValue] = useState<string>("");
  const [showClientsFilter, setShowClientsFilter] = useState<boolean>(false);
  const [selectedRowId, setSelectedRowId] = useState<string | number>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(5);
  const clientsFilterRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [showAddClientUserModal, setShowAddClientUserModal] =
    useState<boolean>(false);
  const [showAddPropertyModal, setShowAddPropertyModal] =
    useState<boolean>(false);

  // Fetch clients data
  const fetchClientsData = async (page: number = 1) => {
    try {
      setClientsData((prev) => ({ ...prev, isLoading: true, error: null }));
      const response = await getClients(page, itemsPerPage);

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

  useEffect(() => {
    // Fetch data when component mounts
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

  const handleRetry = () => {
    fetchClientsData(1);
  };

  const totalItems =
    clientsData.statistics?.totalClients || transformedClientsData.length;
  const totalPages =
    clientsData.pagination?.totalPages || Math.ceil(totalItems / itemsPerPage);
  const currentPageFromApi = clientsData.pagination?.currentPage || currentPage;

  // Use the data directly from API response since it's already paginated
  const currentRows = transformedClientsData;

  // Table data and handlers
  const columns = [
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
      width: "calc(100% / 7)",
    },
    {
      key: "maintenanceCost",
      title: "Maintenance Cost",
      width: "calc(100% / 7)",
    },
    {
      key: "status",
      title: "Status",
      width: "calc(100% / 8)",
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

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    console.log("📄 Clients Page: Changing to page:", page);
    fetchClientsData(page);
  };

  const handleViewDetails = (rowData: any) => {
    router.push(`/client-info?id=${encodeURIComponent(rowData?.id)}`);
  };

  const handleAddProperty = (rowId: string | number) => {
    console.log("Add Property clicked for row:", rowId);
    setShowAddPropertyModal(true);
  };

  // Define actions for the popover
  const actions: PopoverAction[] = [
    {
      label: "View Details",
      onClick: handleViewDetails,
    },
    {
      label: "Add Property",
      onClick: handleAddProperty,
    },
  ];

  const renderHeaderSection = () => {
    return (
      <div className={styles.clients_header_section}>
        <div className={styles.clients_header_section_title_container}>
          <p className={styles.clients_count}>
            {clientsData.isLoading && clientsData.data.length === 0
              ? "..."
              : clientsData.statistics?.totalClients || 0}
          </p>
          <p className={styles.clients_header_section_title}>Clients</p>
        </div>
        <Button
          title="New Clients"
          variant="primary"
          size="sm"
          onClick={() => setShowAddClientUserModal(true)}
        />
      </div>
    );
  };

  const renderClients = () => {
    // Show error state
    if (clientsData.error && clientsData.data.length === 0) {
      return (
        <div className={styles.clients_details_container}>
          <FallbackScreen
            title="Failed to Load Clients"
            subtitle="There was an error loading your clients data. Please try refreshing the page."
            className={styles.clients_loading_fallback}
          />
          <div className={styles.retry_button_container}>
            <Button
              title="Retry"
              variant="primary"
              size="sm"
              onClick={handleRetry}
            />
          </div>
        </div>
      );
    }

    return (
      <div className={styles.clients_details_container}>
        {/* top container */}
        <SectionHeader
          title="Clients"
          searchValue={clientsSearchValue}
          onSearchChange={setClientsSearchValue}
          searchPlaceholder="Search properties..."
          filterComponent={
            <div
              ref={clientsFilterRef}
              onClick={() => setShowClientsFilter(true)}
            >
              <Image src={filterIcon} alt="filter" width={24} height={24} />
            </div>
          }
          searchBarStyle={styles.dashboard_clients_search_bar}
          actionButtonStyle={styles.dashboard_clients_add_client_button}
        />

        {clientsData.isLoading && clientsData.data.length === 0 ? (
          <div className={styles.clients_details_container}>
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
                value={
                  clientsData.isLoading && clientsData.data.length === 0
                    ? 0
                    : clientsData.statistics?.totalClients || 0
                }
                className={styles.dashboard_clients_static_card}
                titleStyle={styles.dashboard_clients_static_card_title}
              />
              <MetricCard
                title="New This Month"
                value={
                  clientsData.isLoading && clientsData.data.length === 0
                    ? 0
                    : clientsData.statistics?.newClientsThisMonth || 0
                }
                className={styles.dashboard_clients_static_card}
                titleStyle={styles.dashboard_clients_static_card_title}
              />
              <MetricCard
                title="Total Buildings"
                value={
                  clientsData.isLoading && clientsData.data.length === 0
                    ? 0
                    : clientsData.statistics?.totalBuildings || 0
                }
                className={styles.dashboard_clients_static_card}
                titleStyle={styles.dashboard_clients_static_card_title}
              />
              <MetricCard
                title="File Uploads"
                value={
                  clientsData.isLoading && clientsData.data.length === 0
                    ? 0
                    : clientsData.statistics?.totalFileUploads || 0
                }
                className={styles.dashboard_clients_static_card}
                titleStyle={styles.dashboard_clients_static_card_title}
              />
            </div>
            <div className={styles.table_container_wrapper}>
              {clientsData.data.length !== 0 ? (
                <CommonTableWithPopover
                  key={`clients-table-${currentPageFromApi}-${clientsData.data.length}`}
                  columns={columns}
                  rows={currentRows}
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
    <div className={styles.clients_container}>
      {renderHeaderSection()}
      {renderClients()}
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
};

export default Clients;
