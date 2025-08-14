"use client";
import React, { useState, useRef } from "react";
import SectionHeader from "@/components/ui/section-header";
import { filterIcon } from "@/resources/images";
import Image from "next/image";
import MetricCard from "@/components/ui/metric-card";
import CommonTableWithPopover, {
  PopoverAction,
} from "@/components/ui/common-table-with-popover";
import FallbackScreen from "@/components/ui/fallback-screen";
import Button from "@/components/ui/button";
import ClientsFilter from "../clients-filter";
import styles from "./styles.module.css";

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

interface ClientsListProps {
  clientsData: ClientsData;
  onSearchChange: (value: string) => void;
  onFilterApply: (filters: any) => void;
  onPageChange: (page: number) => void;
  onRowClick: (rowData: any) => void;
  onViewDetails: (rowData: any) => void;
  onAddProperty: (rowId: string | number) => void;
  onRetry: () => void;
  searchValue: string;
  currentPage: number;
  itemsPerPage: number;
}

const ClientsList: React.FC<ClientsListProps> = ({
  clientsData,
  onSearchChange,
  onFilterApply,
  onPageChange,
  onRowClick,
  onViewDetails,
  onAddProperty,
  onRetry,
  searchValue,
  currentPage,
  itemsPerPage,
}) => {
  const [showClientsFilter, setShowClientsFilter] = useState<boolean>(false);
  const [selectedRowId, setSelectedRowId] = useState<string | number>("");
  const clientsFilterRef = useRef<HTMLDivElement>(null);

  // Transform API clients data to table format
  const transformedClientsData = React.useMemo(() => {
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
    onPageChange(page);
  };

  // Define actions for the popover
  const actions: PopoverAction[] = [
    {
      label: "View Details",
      onClick: onViewDetails,
    },
    {
      label: "Add Property",
      onClick: onAddProperty,
    },
  ];

  const staticCardData = [
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
              onClick={onRetry}
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
          searchValue={searchValue}
          onSearchChange={onSearchChange}
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
              {staticCardData.map((card) => (
                <MetricCard
                  title={card.title}
                  value={card.value}
                  className={styles.dashboard_clients_static_card}
                  titleStyle={styles.dashboard_clients_static_card_title}
                />
              ))}
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
                  onRowClick={onRowClick}
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
    <>
      {renderClients()}
      {showClientsFilter && (
        <ClientsFilter
          onClose={() => setShowClientsFilter(false)}
          onApplyFilters={onFilterApply}
        />
      )}
    </>
  );
};

export default ClientsList;
