"use client";

import Image from "next/image";
import {
  filterIcon,
  propertiesBlueIcon,
  rightArrowPinkIcon,
} from "@/resources/images";
import { clientDetailsCardsData, rowsData } from "@/app/constants";
import SectionHeader from "@/components/ui/section-header";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import CommonTable, {
  TableColumn,
  TableRow,
} from "@/components/ui/common-table";
import PopOver from "@/components/ui/popover";
import styles from "./styles.module.css";

const ClientDetails: React.FC = () => {
  const router = useRouter();
  const clientsFilterRef = useRef<HTMLDivElement>(null);
  const [searchValue, setSearchValue] = useState<string>("");
  const [selectedRowId, setSelectedRowId] = useState<string | number>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [popoverState, setPopoverState] = useState<{
    show: boolean;
    rowId: string | number | null;
  }>({ show: false, rowId: null });
  const actionIconRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const itemsPerPage = 10;

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
      key: "grossArea",
      title: "Gross Area",
      width: 150,
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

  const totalItems = rowsData?.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Get current page data
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRows = rowsData?.slice(startIndex, endIndex) || [];

  const handleRowClick = (row: TableRow, index: number) => {
    // Disable row click when popover is active
    if (popoverState.show) {
      return;
    }

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
    router.push("/property-details");
    handlePopoverClose();
  };

  const handleAddBuilding = () => {
    console.log("Add Building clicked for row:", popoverState.rowId);
    // Add your add building logic here
    handlePopoverClose();
  };

  const renderCard = () => {
    return (
      <div className={styles.client_details_card_container}>
        {clientDetailsCardsData.map((card, index) => (
          <div className={styles.client_details_card} key={index}>
            <div className={styles.client_details_card_icon}>
              <Image
                src={propertiesBlueIcon}
                alt="client"
                width={24}
                height={24}
              />
            </div>
            <div className={styles.client_details_card_content}>
              <p className={styles.client_details_card_value}>{card.value}</p>
              <p className={styles.client_details_card_label}>{card.title}</p>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className={styles.client_details_container}>
      {renderCard()}
      <SectionHeader
        title="Properties List"
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        searchPlaceholder="Search properties..."
        actionButtonTitle="Add  Property"
        onActionButtonClick={() => router.push("/property-details")}
        filterComponent={
          <div ref={clientsFilterRef} onClick={() => {}}>
            <Image src={filterIcon} alt="filter" width={24} height={24} />
          </div>
        }
        searchBarStyle={styles.client_details_search_bar}
        actionButtonStyle={styles.client_details_add_property_button}
      />
      <CommonTable
        columns={columns}
        rows={currentRows}
        onRowClick={handleRowClick}
        selectedRowId={selectedRowId}
        disabled={popoverState.show}
        pagination={{
          currentPage,
          totalPages,
          totalItems,
          itemsPerPage,
          onPageChange: handlePageChange,
          showItemCount: true,
        }}
      />
      {popoverState.show && popoverState.rowId && (
        <>
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
              <div className={styles.action_popoverMenuItem} onClick={() => {}}>
                Add Property
              </div>
            </div>
          </PopOver>
        </>
      )}
    </div>
  );
};

export default ClientDetails;
