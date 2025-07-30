"use client";

import React, { useState, useRef } from "react";
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

const Clients: React.FC = () => {
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

  const totalItems = rowsData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Get current page data
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRows = rowsData.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
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
          <p className={styles.clients_count}>24</p>
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
