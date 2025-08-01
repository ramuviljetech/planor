"use client";

import React, { useRef, useState } from "react";
import CommonTable, {
  TableColumn,
  TableRow,
} from "@/components/ui/common-table";
import MetricCard from "@/components/ui/metric-card";
import Avatar from "@/components/ui/avatar";
import PopOver from "@/components/ui/popover";
import { closeRoseIcon, downloadIcon } from "@/resources/images";
import { buildingMaintenancePlanRowsData } from "@/app/constants";
import styles from "./styles.module.css";

// Reusable component for maintenance plan value container
const MaintenancePlanValueContainer: React.FC<{
  value: any;
  row: any;
  year: string;
  actionIconRefs: React.MutableRefObject<{
    [key: string]: HTMLDivElement | null;
  }>;
  setHoveredMaintenanceItem: (item: any) => void;
  setShowMaintenanceModal: (show: boolean) => void;
  isSelected: boolean;
  setSelectedValueKey: (key: string) => void;
}> = ({
  value,
  row,
  year,
  actionIconRefs,
  setHoveredMaintenanceItem,
  setShowMaintenanceModal,
  isSelected,
  setSelectedValueKey,
}) => {
  const uniqueRefKey = `${row.id}-${year}`;

  return (
    <div
      className={`${styles.maintenance_plan_value_container} ${
        isSelected ? styles.selected_value : ""
      }`}
      ref={(el) => {
        actionIconRefs.current[uniqueRefKey] = el;
      }}
      onClick={(e) => {
        e.stopPropagation();
        const valueKey = `${row.id}-${year}`;
        setSelectedValueKey(valueKey);
        setHoveredMaintenanceItem({ ...row, value, year });
        setShowMaintenanceModal(true);
      }}
    >
      {value}
    </div>
  );
};

interface MaintenancePlanProps {
  className?: string;
}

const MaintenancePlan: React.FC<MaintenancePlanProps> = ({ className }) => {
  const [selectedRowId, setSelectedRowId] = useState<string | number>("");
  const [selectedValueKey, setSelectedValueKey] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [hoveredMaintenanceItem, setHoveredMaintenanceItem] =
    useState<any>(null);
  const actionIconRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const itemsPerPage = 5;

  const maintenancePlanCardTitle = [
    { title: "Total Objects", value: "900" },
    { title: "Total Maintenance for 1 Year", value: "680" },
    { title: "Total Maintenance for 5 Year", value: "320" },
    { title: "Total Maintenance for 10 Year", value: "100" },
  ];

  // Table columns configuration
  const maintenancePlanColumns: TableColumn[] = [
    {
      key: "objectName",
      title: "Object Name",
      width: "calc(100% / 4)",
    },
    {
      key: "year1",
      title: "1 Year",
      width: "calc(100% / 4)",
      render: (value, row, index) => (
        <MaintenancePlanValueContainer
          value={value}
          row={row}
          year="1 Year"
          actionIconRefs={actionIconRefs}
          setHoveredMaintenanceItem={setHoveredMaintenanceItem}
          setShowMaintenanceModal={setShowMaintenanceModal}
          isSelected={selectedValueKey === `${row.id}-1 Year`}
          setSelectedValueKey={setSelectedValueKey}
        />
      ),
    },
    {
      key: "year5",
      title: "5 Year",
      width: "calc(100% / 4)",
      render: (value, row, index) => (
        <MaintenancePlanValueContainer
          value={value}
          row={row}
          year="5 Year"
          actionIconRefs={actionIconRefs}
          setHoveredMaintenanceItem={setHoveredMaintenanceItem}
          setShowMaintenanceModal={setShowMaintenanceModal}
          isSelected={selectedValueKey === `${row.id}-5 Year`}
          setSelectedValueKey={setSelectedValueKey}
        />
      ),
    },
    {
      key: "year10",
      title: "10 Year",
      width: "calc(100% / 4)",
      render: (value, row, index) => (
        <MaintenancePlanValueContainer
          value={value}
          row={row}
          year="10 Year"
          actionIconRefs={actionIconRefs}
          setHoveredMaintenanceItem={setHoveredMaintenanceItem}
          setShowMaintenanceModal={setShowMaintenanceModal}
          isSelected={selectedValueKey === `${row.id}-10 Year`}
          setSelectedValueKey={setSelectedValueKey}
        />
      ),
    },
    {
      key: "actions",
      title: "",
      width: "calc(100% / 4)",
      render: (value, row, index) => (
        <div
          onClick={() => {
            console.log("download");
          }}
          className={styles.actionIconContainer}
        >
          <Avatar
            image={downloadIcon}
            size="sm"
            className={styles.actionIcon}
          />
        </div>
      ),
    },
  ];

  const breakdownItems = [
    { label: "Object", value: "900" },
    { label: "Object", value: "6800" },
    { label: "Object", value: "3200" },
    { label: "Object", value: "1000" },
  ];

  const maintenancePlanTotalItems = buildingMaintenancePlanRowsData?.length;
  const maintenancePlanTotalPages = Math.ceil(
    maintenancePlanTotalItems / itemsPerPage
  );

  // Get current page data
  const maintenancePlanStartIndex = (currentPage - 1) * itemsPerPage;
  const maintenancePlanEndIndex = maintenancePlanStartIndex + itemsPerPage;
  const maintenancePlanCurrentRows =
    buildingMaintenancePlanRowsData?.slice(
      maintenancePlanStartIndex,
      maintenancePlanEndIndex
    ) || [];

  const handleMaintenancePlanPageChange = (page: number) => {
    setCurrentPage(page);
    setSelectedRowId("");
  };

  return (
    <div className={`${styles.maintenance_plan_container} ${className || ""}`}>
      <div className={styles.maintenance_plan_card_container}>
        {maintenancePlanCardTitle.map((card, index) => (
          <MetricCard
            key={index}
            title={card.title}
            value={Number(card.value)}
            className={styles.maintenance_plan_card}
            titleStyle={styles.maintenance_plan_card_title}
            showK={true}
          />
        ))}
      </div>
      <CommonTable
        columns={maintenancePlanColumns}
        rows={maintenancePlanCurrentRows}
        selectedRowId={selectedRowId}
        disabled={false}
        pagination={{
          currentPage,
          totalPages: maintenancePlanTotalPages,
          totalItems: maintenancePlanTotalItems,
          itemsPerPage,
          onPageChange: handleMaintenancePlanPageChange,
          showItemCount: true,
        }}
      />
      {showMaintenanceModal && hoveredMaintenanceItem && (
        <PopOver
          reference={{
            current:
              actionIconRefs.current[
                `${hoveredMaintenanceItem.id}-${hoveredMaintenanceItem.year}`
              ],
          }}
          show={showMaintenanceModal}
          onClose={() => setShowMaintenanceModal(false)}
          placement="bottom-end"
          offset={[0, 8]}
        >
          <div className={styles.breakdown_popover}>
            <div className={styles.breakdown_popover_header}>
              <p className={styles.breakdown_popover_title}>Break Down</p>
              <Avatar
                image={closeRoseIcon}
                size="sm"
                onClick={() => {
                  setShowMaintenanceModal(false);
                  setSelectedValueKey("");
                }}
                avatarStyle={styles.close_button_icon}
                className={styles.close_button}
              />
            </div>
            <div className={styles.breakdown_items_container}>
              {breakdownItems.map((item, index) => (
                <div className={styles.breakdown_item} key={index}>
                  <p className={styles.breakdown_label}>{item.label}</p>
                  <p className={styles.breakdown_value}>{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </PopOver>
      )}
    </div>
  );
};

export default MaintenancePlan;
