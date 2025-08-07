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

const Clients: React.FC = () => {
  const { clients, updateClientsPagination } = useDataProvider();
  const [clientsSearchValue, setClientsSearchValue] = useState<string>("");
  const [showClientsFilter, setShowClientsFilter] = useState<boolean>(false);
  const [selectedRowId, setSelectedRowId] = useState<string | number>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const clientsFilterRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [showAddClientUserModal, setShowAddClientUserModal] =
    useState<boolean>(false);
  const [showAddPropertyModal, setShowAddPropertyModal] =
    useState<boolean>(false);

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
      createdOn: new Date(client.createdOn).toLocaleDateString("en-US", {
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

  useEffect(() => {
    console.log("👥 Clients Page: Component mounted");
    console.log("📊 Clients Page: Current clients state:", clients);

    // No need to fetch data here - it's already loaded from dashboard
    console.log("✅ Clients Page: Using cached clients data from dashboard");
  }, []);

  useEffect(() => {
    console.log("📊 Clients Page: Clients state updated:", clients);
  }, [clients]);

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

  const totalItems =
    clients.statistics?.totalClients || transformedClientsData.length;
  const totalPages =
    clients.pagination?.totalPages || Math.ceil(totalItems / itemsPerPage);
  const currentPageFromApi = clients.pagination?.currentPage || currentPage;

  // Get current page data
  const startIndex = (currentPageFromApi - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRows = transformedClientsData.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    console.log("📄 Clients Page: Changing to page:", page);
    updateClientsPagination(page);
    // TODO: Fetch new page data from API
    // fetchClients(page);
  };

  const handleViewDetails = (rowId: string | number) => {
    console.log("View Details clicked for row:", rowId);
    router.push("/client-info");
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
            {clients.statistics?.totalClients || 0}
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
        <CommonTableWithPopover
          columns={columns}
          rows={currentRows}
          selectedRowId={selectedRowId}
          pagination={{
            currentPage,
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
        />
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
