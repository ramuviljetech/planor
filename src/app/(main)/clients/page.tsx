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
import { useDataProvider } from "@/providers/data-provider";
import FallbackScreen from "@/components/ui/fallback-screen";

const Clients: React.FC = () => {
  const { clients, fetchClients, updateClientsPagination } = useDataProvider();
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
  const [hasError, setHasError] = useState<boolean>(false);

  useEffect(() => {
    // Fetch data if not already loaded
    if (clients.data.length === 0 && !clients.isLoading) {
      setHasError(false);
      fetchClients(1).catch(() => {
        setHasError(true);
      });
    } else {
      console.log("✅ Clients Page: Using cached clients data from dashboard");
    }
  }, []);

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

  const handleRetry = () => {
    setHasError(false);
    fetchClients(1).catch(() => {
      setHasError(true);
    });
  };

  const totalItems =
    clients.statistics?.totalClients || transformedClientsData.length;
  const totalPages =
    clients.pagination?.totalPages || Math.ceil(totalItems / itemsPerPage);
  const currentPageFromApi = clients.pagination?.currentPage || currentPage;

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
    updateClientsPagination(page);
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
            {clients.isLoading && clients.data.length === 0
              ? "..."
              : clients.statistics?.totalClients || 0}
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
    if (hasError && clients.data.length === 0) {
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

        {clients.isLoading && clients.data.length === 0 ? (
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
                  clients.isLoading && clients.data.length === 0
                    ? 0
                    : clients.statistics?.totalClients || 0
                }
                className={styles.dashboard_clients_static_card}
                titleStyle={styles.dashboard_clients_static_card_title}
              />
              <MetricCard
                title="New This Month"
                value={
                  clients.isLoading && clients.data.length === 0
                    ? 0
                    : clients.statistics?.newClientsThisMonth || 0
                }
                className={styles.dashboard_clients_static_card}
                titleStyle={styles.dashboard_clients_static_card_title}
              />
              <MetricCard
                title="Total Buildings"
                value={
                  clients.isLoading && clients.data.length === 0
                    ? 0
                    : clients.statistics?.totalBuildings || 0
                }
                className={styles.dashboard_clients_static_card}
                titleStyle={styles.dashboard_clients_static_card_title}
              />
              <MetricCard
                title="File Uploads"
                value={
                  clients.isLoading && clients.data.length === 0
                    ? 0
                    : clients.statistics?.totalFileUploads || 0
                }
                className={styles.dashboard_clients_static_card}
                titleStyle={styles.dashboard_clients_static_card_title}
              />
            </div>
            <div className={styles.table_container_wrapper}>
              {clients.data.length !== 0 ? (
                <CommonTableWithPopover
                  key={`clients-table-${currentPageFromApi}-${clients.data.length}`}
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
