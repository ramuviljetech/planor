"use client";
import React, { useState, useMemo, useRef } from "react";
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

export default function DashboardPage() {
  const { user } = useAuth();
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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const router = useRouter();
  const [showClientsFilter, setShowClientsFilter] = useState<boolean>(false);

  // TODO: Replace this with actual API call data
  // This will be fetched from the database based on selectedFilter and selectedYearlyMaintenanceSummary
  const mockApiData = useMemo(() => {
    // Simulate different data based on filter selection
    const baseCards = [
      {
        title: "Doors",
        value:
          selectedFilter === "clients"
            ? 900
            : selectedFilter === "properties"
            ? 750
            : 600,
        percentageChange: 3.4,
      },
      {
        title: "Floors",
        value:
          selectedFilter === "clients"
            ? 680
            : selectedFilter === "properties"
            ? 550
            : 480,
        percentageChange: 11.4,
      },
      {
        title: "Roof",
        value:
          selectedFilter === "clients"
            ? 680
            : selectedFilter === "properties"
            ? 620
            : 520,
        percentageChange: 3.4,
      },
      {
        title: "Walls",
        value:
          selectedFilter === "clients"
            ? 500
            : selectedFilter === "properties"
            ? 420
            : 380,
        percentageChange: -1.4,
      },
      {
        title: "Windows",
        value:
          selectedFilter === "clients"
            ? 300
            : selectedFilter === "properties"
            ? 280
            : 250,
        percentageChange: 7.2,
      },
      {
        title: "Area",
        value:
          selectedFilter === "clients"
            ? 1280
            : selectedFilter === "properties"
            ? 1100
            : 980,
        percentageChange: 4.4,
      },
    ];

    // Calculate total value
    const totalValue = baseCards.reduce((sum, card) => sum + card.value, 0);

    const metricCards = baseCards.map((card) => ({
      ...card,
      color: titleColorMap[card.title] || "var(--lavender-sky)", // fallback color
      percentage: Math.round((card.value / totalValue) * 100),
    }));

    const contributionData = metricCards.map((card) => ({
      title: card.title,
      value: card.value,
      color: card.color,
      percentage: card.percentage,
    }));

    return {
      metricCards,
      contributionData,
      totalValue: `${(totalValue / 1000).toFixed(1)}K`,
      totalPercentageChange: "+3.4%",
    };
  }, [selectedFilter, selectedYearlyMaintenanceSummary]);

  // Table data and handlers
  const columns: TableColumn[] = [
    {
      key: "clientName",
      title: "Client Name",
      width: "calc(100% / 7)",
    },
    {
      key: "clientId",
      title: "Client ID",
      width: "calc(100% / 7)",
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

  const totalItems = rowsData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Get current page data
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRows = rowsData.slice(startIndex, endIndex);

  const handleRowClick = (row: TableRow, index: number) => {
    setShowBottomSheet(true);
    setSelectedRowId(row.id);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setSelectedRowId("");
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
    // fetchMaintenanceData(filter, year);
  };

  const renderClients = () => {
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
              // ref={clientsFilterRef}
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
          {clientsStaticCardTitle.map((card, index) => (
            <MetricCard
              key={index}
              title={card.title}
              value={card.value}
              className={styles.dashboard_clients_static_card}
              titleStyle={styles.dashboard_clients_static_card_title}
            />
          ))}
        </div>
        <CommonTableWithPopover
          columns={columns}
          rows={currentRows}
          onRowClick={handleRowClick}
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
    <div className={styles.dashboard_container}>
      <p className={styles.dashboard_title}>Hey {user?.name || "John Doe"}</p>
      {/* Yearly Maintenance Costs Summary */}
      <MaintenanceSection
        selectedFilter={selectedFilter}
        selectedYearlyMaintenanceSummary={selectedYearlyMaintenanceSummary}
        onFiltersChange={handleFiltersChange}
        metricCards={mockApiData.metricCards}
        contributionData={mockApiData.contributionData}
        totalValue={mockApiData.totalValue}
        totalPercentageChange={mockApiData.totalPercentageChange}
      />
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
