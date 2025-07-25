"use client";
import React, { useState, useMemo, useRef } from "react";
import styles from "./styles.module.css";
import MaintenanceSection from "@/sections/dashboard-section/maintenance";
import MetricCard from "@/components/ui/metric-card";
import { clientsStaticCardTitle } from "@/app/constants";
import BottomSheet from "@/components/ui/bottom-sheet";
import ClientDetails from "@/sections/dashboard-section/clients-section/client-details";
import SectionHeader from "@/components/ui/section-header";
import PopOver from "@/components/ui/popover";
import TableFilter from "@/components/ui/table-filter";
import Image from "next/image";
import { filterIcon, rightArrowPinkIcon } from "@/resources/images";
import CommonTable, {
  TableColumn,
  TableRow,
} from "@/components/ui/common-table";

// Fixed colors for metric cards based on title
const titleColorMap: Record<string, string> = {
  Doors: "var(--lavender-sky)",
  Floors: "var(--aqua-mist)",
  Roof: "var(--pink-blush)",
  Walls: "var(--sunbeam)",
  Windows: "var(--royal-indigo)",
  Area: "var(--neon-mint)",
};

const tableOptions = [
  "Client Name",
  "Client Id",
  "Properties",
  "Created On",
  "Maintenance Cost",
  "Status",
];

export default function DashboardPage() {
  const [selectedFilter, setSelectedFilter] = useState<string>("clients");
  const [
    selectedYearlyMaintenanceSummary,
    setSelectedYearlyMaintenanceSummary,
  ] = useState<string>("thisYear");

  const [selectedClientsFilters, setSelectedClientsFilters] =
    useState<string>("Active");
  const [showBottomSheet, setShowBottomSheet] = useState<boolean>(false);
  const [clientsSearchValue, setClientsSearchValue] = useState<string>("");
  const [showClientsFilter, setShowClientsFilter] = useState<boolean>(false);
  const clientsFilterRef = useRef<HTMLDivElement>(null);
  const [selectedRowId, setSelectedRowId] = useState<string | number>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [popoverState, setPopoverState] = useState<{
    show: boolean;
    rowId: string | number | null;
  }>({ show: false, rowId: null });
  const actionIconRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const itemsPerPage = 5;

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
      width: 200,
    },
    {
      key: "clientId",
      title: "Client ID",
      width: 120,
    },
    {
      key: "properties",
      title: "Properties",
      width: 100,
    },
    {
      key: "createdOn",
      title: "Created On",
      width: 150,
    },
    {
      key: "maintenanceCost",
      title: "Maintenance Cost",
      width: 150,
    },
    {
      key: "status",
      title: "Status",
      width: 120,
      render: (value, row, index) => (
        <div
          className={`${styles.statusBadge} ${
            value === "Active" ? styles.statusActive : styles.statusInactive
          }`}
        >
          {value}
        </div>
      ),
    },
    {
      key: "actions",
      title: "",
      width: 60,
      render: (value, row, index) => (
        <div
          className={styles.actionIcon}
          ref={(el) => {
            actionIconRefs.current[row.id] = el;
          }}
          onClick={(e) => {
            e.stopPropagation();
            setPopoverState({ show: true, rowId: row.id });
          }}
        >
          <Image
            src={rightArrowPinkIcon}
            alt="menu-dot"
            width={16}
            height={16}
          />
        </div>
      ),
    },
  ];

  const rowsData = [
    {
      id: 1,
      clientName: "Brunnfast AB",
      clientId: "945422",
      properties: 12,
      createdOn: "12 Jun, 2025",
      maintenanceCost: 23450,
      status: "Active",
    },
    {
      id: 2,
      clientName: "Brunnfast AB",
      clientId: "945422",
      properties: 12,
      createdOn: "12 Jun, 2025",
      maintenanceCost: 23450,
      status: "Inactive",
    },
    {
      id: 3,
      clientName: "Brunnfast AB",
      clientId: "945422",
      properties: 12,
      createdOn: "12 Jun, 2025",
      maintenanceCost: 23450,
      status: "Inactive",
    },
    {
      id: 4,
      clientName: "Brunnfast AB",
      clientId: "945422",
      properties: 12,
      createdOn: "12 Jun, 2025",
      maintenanceCost: 23450,
      status: "Inactive",
    },
    {
      id: 5,
      clientName: "Brunnfast AB",
      clientId: "945422",
      properties: 0,
      createdOn: "12 Jun, 2025",
      maintenanceCost: 23450,
      status: "Inactive",
    },
    {
      id: 6,
      clientName: "Brunnfast AB",
      clientId: "945422",
      properties: 12,
      createdOn: "12 Jun, 2025",
      maintenanceCost: 23450,
      status: "Inactive",
    },
    {
      id: 7,
      clientName: "Brunnfast AB",
      clientId: "945422",
      properties: 40,
      createdOn: "12 Jun, 2025",
      maintenanceCost: 23450,
      status: "Inactive",
    },
    {
      id: 8,
      clientName: "Brunnfast AB",
      clientId: "945422",
      properties: 12,
      createdOn: "12 Jun, 2025",
      maintenanceCost: 23450,
      status: "Inactive",
    },
    {
      id: 9,
      clientName: "Brunnfast AB",
      clientId: "945422",
      properties: 12,
      createdOn: "12 Jun, 2025",
      maintenanceCost: 23450,
      status: "Inactive",
    },
    {
      id: 10,
      clientName: "Brunnfast AB",
      clientId: "945422",
      properties: 9,
      createdOn: "12 Jun, 2025",
      maintenanceCost: 23450,
      status: "Active",
    },
    {
      id: 11,
      clientName: "Brunnfast AB",
      clientId: "945422",
      properties: 0,
      createdOn: "12 Jun, 2025",
      maintenanceCost: 23450,
      status: "Active",
    },
    {
      id: 12,
      clientName: "Brunnfast AB",
      clientId: "945422",
      properties: 77,
      createdOn: "12 Jun, 2025",
      maintenanceCost: 23450,
      status: "Active",
    },
    {
      id: 13,
      clientName: "Brunnfast AB",
      clientId: "945422",
      properties: 89,
      createdOn: "12 Jun, 2025",
      maintenanceCost: 23450,
      status: "Active",
    },
    {
      id: 14,
      clientName: "Brunnfast AB",
      clientId: "945422",
      properties: 0,
      createdOn: "12 Jun, 2025",
      maintenanceCost: 23450,
      status: "Active",
    },
    {
      id: 15,
      clientName: "Brunnfast AB",
      clientId: "945422",
      properties: 0,
      createdOn: "12 Jun, 2025",
      maintenanceCost: 23450,
      status: "Active",
    },
    {
      id: 16,
      clientName: "Brunnfast AB",
      clientId: "945422",
      properties: 0,
      createdOn: "12 Jun, 2025",
      maintenanceCost: 23450,
      status: "Active",
    },
    {
      id: 17,
      clientName: "Brunnfast AB",
      clientId: "945422",
      properties: 0,
      createdOn: "12 Jun, 2025",
      maintenanceCost: 23450,
      status: "Active",
    },
    {
      id: 18,
      clientName: "Brunnfast AB",
      clientId: "945422",
      properties: 0,
      createdOn: "12 Jun, 2025",
      maintenanceCost: 23450,
      status: "Active",
    },
    {
      id: 19,
      clientName: "Brunnfast AB",
      clientId: "945422",
      properties: 0,
      createdOn: "12 Jun, 2025",
      maintenanceCost: 23450,
      status: "Active",
    },
    {
      id: 20,
      clientName: "Brunnfast AB",
      clientId: "945422",
      properties: 0,
      createdOn: "12 Jun, 2025",
      maintenanceCost: 23450,
      status: "Active",
    },
    {
      id: 21,
      clientName: "Brunnfast AB",
      clientId: "945422",
      properties: 0,
      createdOn: "12 Jun, 2025",
      maintenanceCost: 23450,
      status: "Active",
    },
  ];

  const totalItems = rowsData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Get current page data
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRows = rowsData.slice(startIndex, endIndex);

  const handleRowClick = (row: TableRow, index: number) => {
    console.log("Row clicked:", {
      id: row.id,
      clientName: row.clientName,
      clientId: row.clientId,
      properties: row.properties,
      createdOn: row.createdOn,
      maintenanceCost: row.maintenanceCost,
      status: row.status,
    });
    setSelectedRowId(row.id);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setSelectedRowId("");
  };

  const handlePopoverClose = () => {
    setPopoverState({ show: false, rowId: null });
  };

  const handleViewDetails = () => {
    console.log("View Details clicked for row:", popoverState.rowId);
    // Add your view details logic here
    handlePopoverClose();
  };

  const handleAddBuilding = () => {
    console.log("Add Building clicked for row:", popoverState.rowId);
    // Add your add building logic here
    handlePopoverClose();
  };

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
          onActionButtonClick={() => setShowBottomSheet(true)}
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
        <CommonTable
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
        />
        {/* Popover for action menu */}
        {popoverState.show && popoverState.rowId && (
          <PopOver
            reference={{ current: actionIconRefs.current[popoverState.rowId] }}
            show={popoverState.show}
            onClose={handlePopoverClose}
            placement="bottom-end"
            offset={[0, 8]}
          >
            <div className={styles.action_popoverMenu}>
              <div
                className={styles.action_popoverMenuItem}
                onClick={handleViewDetails}
              >
                View Details
              </div>
              <div
                className={styles.action_popoverMenuItem}
                onClick={handleAddBuilding}
              >
                Add Building
              </div>
            </div>
          </PopOver>
        )}
      </div>
    );
  };

  return (
    <div className={styles.dashboard_container}>
      <p className={styles.dashboard_title}>Hey Vivek</p>
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
      <PopOver
        reference={clientsFilterRef}
        show={showClientsFilter}
        onClose={() => setShowClientsFilter(false)}
      >
        <TableFilter
          title="Filters"
          options={["Active", "Inactive"]}
          selectedOptions={selectedClientsFilters}
          onOptionsChange={(option) => {
            setSelectedClientsFilters(option);
            setShowClientsFilter(false);
          }}
        />
      </PopOver>
      <BottomSheet
        isOpen={showBottomSheet}
        onClose={() => setShowBottomSheet(false)}
        title="Brunnfast AB"
        backButton={true}
        onBackButton={() => setShowBottomSheet(false)}
      >
        <ClientDetails />
      </BottomSheet>
    </div>
  );
}
