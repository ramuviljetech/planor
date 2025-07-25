"use client";

import React, { useRef, useState } from "react";
import Button from "@/components/ui/button";
import styles from "./styles.module.css";
import ClientDetails from "@/sections/client-properties-list";
import SectionHeader from "@/components/ui/section-header";
import { filterIcon } from "@/resources/images";
import Image from "next/image";
import MetricCard from "@/components/ui/metric-card";
import CommonTable, {
  TableColumn,
  TableRow,
} from "@/components/ui/common-table";
import PopOver from "@/components/ui/popover";
import { clientsStaticCardTitle, rowsData } from "@/app/constants";
import { rightArrowPinkIcon } from "@/resources/images";
import { useRouter } from "next/navigation";

const Clients: React.FC = () => {
  const [clientsSearchValue, setClientsSearchValue] = useState<string>("");
  const [showClientsFilter, setShowClientsFilter] = useState<boolean>(false);
  const [selectedRowId, setSelectedRowId] = useState<string | number>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const clientsFilterRef = useRef<HTMLDivElement>(null);
  const actionIconRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const [popoverState, setPopoverState] = useState<{
    show: boolean;
    rowId: string | null;
  }>({ show: false, rowId: null });
  const router = useRouter();

  const handleAddClient = () => {
    router.push("/clients/add");
  };
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
      width: "calc(100% / 8)",
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

  const totalItems = rowsData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Get current page data
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRows = rowsData.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePopoverClose = () => {
    setPopoverState({ show: false, rowId: null });
  };
  const handleViewDetails = () => {
    console.log("View Details clicked for row:", popoverState.rowId);
    router.push("/client-info");
    handlePopoverClose();
  };

  const handleAddBuilding = () => {
    console.log("Add Building clicked for row:", popoverState.rowId);
    // Add your add building logic here
    handlePopoverClose();
  };

  const renderHeaderSection = () => {
    return (
      <div className={styles.clients_header_section}>
        <div className={styles.clients_header_section_title_container}>
          <p className={styles.clients_count}>24</p>
          <p className={styles.clients_header_section_title}>Clients</p>
        </div>
        <Button title="New Clients" variant="primary" size="sm" />
      </div>
    );
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
          // onRowClick={handleRowClick}
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
                Add Property
              </div>
            </div>
          </PopOver>
        )}
      </div>
    );
  };
  return (
    <div className={styles.clients_container}>
      {renderHeaderSection()}
      {renderClients()}
    </div>
  );
};

export default Clients;
