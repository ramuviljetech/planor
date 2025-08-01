"use client";

import React, { useRef, useState } from "react";
import SearchBar from "@/components/ui/searchbar";
import Button from "@/components/ui/button";
import CommonTable, {
  TableColumn,
  TableRow,
} from "@/components/ui/common-table";
import Image from "next/image";
import { threeDotsIcon } from "@/resources/images";
import { useRouter } from "next/navigation";
import Capsule from "@/components/ui/capsule";
import CustomCheckbox from "@/components/ui/checkbox";
import UpdateLastDate from "@/components/ui/update-last-date";
import styles from "./styles.module.css";
import MaintenancePlan from "@/components/maintenance-plan";

const tabItems = [
  { label: "Object View", value: "objectView" },
  { label: "Maintenance Plan", value: "maintenancePlan" },
];

const Maintenance = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>("objectView");
  const [searchValue, setSearchValue] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [popoverState, setPopoverState] = useState<{
    show: boolean;
    rowId: string | number | null;
  }>({ show: false, rowId: null });
  const actionIconRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const itemsPerPage = 5;
  const [selectedObjectViewRowId, setSelectedObjectViewRowId] = useState<
    string | number
  >("");
  const [selectedRows, setSelectedRows] = useState<Set<string | number>>(
    new Set()
  );
  // New state to store selected rows data
  const [selectedRowsData, setSelectedRowsData] = useState<TableRow[]>([]);

  // Modal state
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  const objectViewColumns: TableColumn[] = [
    {
      key: "objectName",
      title: "Object Name",
      width: 50,
      headerRender: () => (
        <div onClick={(e) => e.stopPropagation()}>
          <CustomCheckbox
            checked={allCurrentObjectViewPageSelected}
            onChange={handleSelectAll}
            label="Object Name"
            labelClassName={styles.checkbox_column_header_label}
          />
        </div>
      ),
      render: (value, row, index) => (
        <div onClick={(e) => e.stopPropagation()}>
          <CustomCheckbox
            checked={selectedRows.has(row.id)}
            onChange={() => {
              console.log("checkbox changed");
              handleCheckboxChange(row.id, row);
            }}
            label={row.objectName}
          />
        </div>
      ),
    },
    {
      key: "objectType",
      title: "Object Type",
      width: "calc(100% / 4)",
    },
    {
      key: "unit",
      title: "Unit",
      width: "calc(100% / 4)",
    },
    {
      key: "interval",
      title: "Interval",
      width: "calc(100% / 4)",
    },
    {
      key: "utilized",
      title: "Utilized",
      width: "calc(100% / 4)",
    },
    {
      key: "lastMaintenanceDate",
      title: "Last Maintenance date",
      width: "calc(100% / 4)",
      render: (value, row, index) => (
        <div
          className={styles.last_maintenance_date_container}
          onClick={() => {
            setSelectedRowsData([row]);
            setShowUpdateModal(true);
            setSelectedObjectViewRowId(row.id);
          }}
        >
          <p className={styles.last_maintenance_date_text}>{value}</p>
        </div>
      ),
    },
    {
      key: "actions",
      title: "Actions",
      width: "calc(100% / 4)",
      render: (value, row, index) => (
        <div
          className={styles.actionIconContainer}
          ref={(el) => {
            actionIconRefs.current[row.id] = el;
          }}
          onClick={(e) => {
            e.stopPropagation();
            setPopoverState({ show: true, rowId: row.id });
          }}
        >
          <Image src={threeDotsIcon} alt="menu-dot" width={16} height={16} />
        </div>
      ),
    },
  ];

  const objectViewRows = [
    {
      id: 1,
      objectName: "Object 1",
      objectType: "Object Type 1",
      unit: "m²",
      interval: "Yearly",
      utilized: "100",
      lastMaintenanceDate: "2021-01-01",
    },
    {
      id: 2,
      objectName: "Object 2",
      objectType: "Object Type 2",
      unit: "m²",
      interval: "Yearly",
      utilized: "100",
      lastMaintenanceDate: "2021-01-01",
    },
    {
      id: 3,
      objectName: "Object 3",
      objectType: "Object Type 3",
      unit: "m²",
      interval: "Yearly",
      utilized: "100",
      lastMaintenanceDate: "2021-01-01",
    },
  ];

  const totalObjectViewItems = objectViewRows?.length;
  const totalObjectViewPages = Math.ceil(totalObjectViewItems / itemsPerPage);

  // Get current page data
  const startObjectViewIndex = (currentPage - 1) * itemsPerPage;
  const endObjectViewIndex = startObjectViewIndex + itemsPerPage;
  const currentObjectViewRows =
    objectViewRows?.slice(startObjectViewIndex, endObjectViewIndex) || [];
  const currentObjectViewPageIds = currentObjectViewRows.map((row) => row.id);
  const allCurrentObjectViewPageSelected =
    currentObjectViewPageIds.length > 0 &&
    currentObjectViewPageIds.every((id) => selectedRows.has(id));

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setSelectedRows(new Set());
    setSelectedRowsData([]);
  };
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // Handle tab change logic here
  };

  const handleCheckboxChange = (rowId: string | number, rowData: TableRow) => {
    setSelectedRows((prev) => {
      const newSelectedRows = new Set(prev);
      if (newSelectedRows.has(rowId)) {
        newSelectedRows.delete(rowId);
      } else {
        newSelectedRows.add(rowId);
      }
      return newSelectedRows;
    });

    // Update selected rows data
    setSelectedRowsData((prev) => {
      const existingIndex = prev.findIndex(
        (item) => String(item.id) === String(rowId)
      );
      if (existingIndex !== -1) {
        // Remove from selected data
        return prev.filter((item) => String(item.id) !== String(rowId));
      } else {
        // Add to selected data
        return [...prev, rowData];
      }
    });
  };

  const handleSelectAll = () => {
    const currentPageIds = currentObjectViewRows.map((row) => row.id);
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

    // Update selected rows data
    setSelectedRowsData((prev) => {
      const currentPageIds = currentObjectViewRows.map((row) => row.id);
      const allCurrentPageSelected = currentPageIds.every((id) =>
        selectedRows.has(id)
      );

      if (allCurrentPageSelected) {
        // Deselect all current page items
        return prev.filter(
          (item) => !currentPageIds.some((id) => String(id) === String(item.id))
        );
      } else {
        // Select all current page items
        const newSelectedData = [...prev];
        currentObjectViewRows.forEach((row) => {
          if (
            !newSelectedData.find((item) => String(item.id) === String(row.id))
          ) {
            newSelectedData.push(row);
          }
        });
        return newSelectedData;
      }
    });
  };

  const handleUpdateLastDate = () => {
    console.log("Selected rows data:", selectedRowsData);

    if (selectedRowsData.length === 0) {
      console.log("No rows selected");
      return;
    }

    // Open the modal
    setShowUpdateModal(true);
  };

  const handleModalClose = () => {
    setShowUpdateModal(false);
    setSelectedRowsData([]);
    setSelectedObjectViewRowId("");
  };

  const handleDateSubmit = (date: Date) => {
    console.log("Updating maintenance date to:", date);
    console.log("For selected objects:", selectedRowsData);

    // Here you would typically make an API call to update the maintenance dates
    // The date is now available in the parent component
  };

  const renderTabContent = () => {
    return (
      <Capsule
        items={tabItems}
        activeValue={activeTab}
        onItemClick={handleTabChange}
        className={styles.building_maintenance_top_section_left}
      />
    );
  };

  const renderRightSection = () => {
    return (
      <div className={styles.building_maintenance_top_section_right}>
        <SearchBar
          placeholder="Search  by object , Reuit id...."
          value={searchValue}
          onChange={(e) => setSearchValue(e)}
          className={styles.building_maintenance_top_section_right_search}
        />
        {activeTab === "objectView" && selectedRows.size > 0 && (
          <Button
            title={
              selectedRows.size === currentObjectViewRows.length
                ? "Deselect All"
                : "Select All"
            }
            onClick={() => {
              handleSelectAll();
            }}
            variant="outline"
            size="sm"
            className={styles.building_maintenance_top_section_right_select_all}
          />
        )}
        <Button
          title="Update Last Date "
          onClick={handleUpdateLastDate}
          variant="primary"
          size="sm"
        />
      </div>
    );
  };
  const renderObjectView = () => {
    return (
      <div className={styles.building_maintenance_object_view}>
        <CommonTable
          key={`object-view-${selectedRows.size}-${currentPage}`}
          columns={objectViewColumns}
          rows={currentObjectViewRows}
          // onRowClick={(row) => {
          //   setSelectedObjectViewRowId(row.id);
          // }}
          selectedRowId={selectedObjectViewRowId}
          selectedRowIds={selectedRows}
          pagination={{
            currentPage,
            totalPages: totalObjectViewPages,
            totalItems: totalObjectViewItems,
            itemsPerPage,
            onPageChange: handlePageChange,
            showItemCount: true,
          }}
        />
      </div>
    );
  };
  return (
    <section className={styles.building_maintenance_container}>
      <div className={styles.building_maintenance_top_section}>
        {renderTabContent()}
        {renderRightSection()}
      </div>
      {activeTab === "objectView" && renderObjectView()}
      {activeTab === "maintenancePlan" && <MaintenancePlan />}

      {/* Update Last Maintenance Date Modal */}
      <UpdateLastDate
        show={showUpdateModal}
        onClose={handleModalClose}
        selectedObjectsCount={selectedRowsData.length}
        onDateSubmit={handleDateSubmit}
        buildingName="Block-C"
      />
    </section>
  );
};

export default Maintenance;
