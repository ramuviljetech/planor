import React, { useState, useRef } from "react";
import CommonTable, { TableColumn, TableRow } from "./index";
import PopOver from "../popover";
import styles from "./styles.module.css";
import Image from "next/image";
import { rightArrowPinkIcon } from "@/resources/images";
import CustomCheckbox from "../checkbox";

// Example usage of CommonTable component with pagination
const CommonTableExample: React.FC = () => {
  const [selectedRowId, setSelectedRowId] = useState<string | number>("");
  const [selectedRows, setSelectedRows] = useState<Set<string | number>>(
    new Set()
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [popoverState, setPopoverState] = useState<{
    show: boolean;
    rowId: string | number | null;
  }>({ show: false, rowId: null });
  const actionIconRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const itemsPerPage = 5;

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

  // Check if all current page items are selected
  const currentPageIds = currentRows.map((row) => row.id);
  const allCurrentPageSelected =
    currentPageIds.length > 0 &&
    currentPageIds.every((id) => selectedRows.has(id));

  const columns: TableColumn[] = [
    {
      key: "checkbox",
      title: "",
      width: 50,
      headerRender: () => (
        <div onClick={(e) => e.stopPropagation()}>
          <CustomCheckbox
            checked={allCurrentPageSelected}
            onChange={handleSelectAll}
            label=""
          />
        </div>
      ),
      render: (value, row, index) => (
        <div onClick={(e) => e.stopPropagation()}>
          <CustomCheckbox
            checked={selectedRows.has(row.id)}
            onChange={() => handleCheckboxChange(row.id)}
            label=""
          />
        </div>
      ),
    },
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

  const handleCheckboxChange = (rowId: string | number) => {
    setSelectedRows((prev) => {
      const newSelectedRows = new Set(prev);
      if (newSelectedRows.has(rowId)) {
        newSelectedRows.delete(rowId);
      } else {
        newSelectedRows.add(rowId);
      }
      return newSelectedRows;
    });
  };

  const handleSelectAll = () => {
    const currentPageIds = currentRows.map((row) => row.id);
    setSelectedRows((prev) => {
      const newSelectedRows = new Set(prev);
      const allCurrentPageSelected = currentPageIds.every((id) =>
        newSelectedRows.has(id)
      );

      if (allCurrentPageSelected) {
        // Deselect all current page items
        currentPageIds.forEach((id) => newSelectedRows.delete(id));
      } else {
        // Select all current page items
        currentPageIds.forEach((id) => newSelectedRows.add(id));
      }
      return newSelectedRows;
    });
  };

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

  return (
    <div>
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
          <div className={styles.popoverMenu}>
            <div className={styles.popoverMenuItem} onClick={handleViewDetails}>
              View Details
            </div>
            <div className={styles.popoverMenuItem} onClick={handleAddBuilding}>
              Add Building
            </div>
          </div>
        </PopOver>
      )}
    </div>
  );
};

export default CommonTableExample;
