"use client";

import React, { useRef, useState } from "react";
import styles from "./styles.module.css";
import SearchBar from "@/components/ui/searchbar";
import Button from "@/components/ui/button";
import MetricCard from "@/components/ui/metric-card";
import CommonTable, {
  TableColumn,
  TableRow,
} from "@/components/ui/common-table";
import Image from "next/image";
import { downloadIcon, rightArrowPinkIcon } from "@/resources/images";
import { buildingMaintenancePlanRowsData, rowsData } from "@/app/constants";
import { useRouter } from "next/navigation";
import Avatar from "@/components/ui/avatar";
import Capsule from "@/components/ui/capsule";

const tabItems = [
  { label: "Object View", value: "objectView" },
  { label: "Maintenance Plan", value: "maintenancePlan" },
];

const maintenancePlanCardTitle = [
  { title: "Total Objects", value: "900" },
  { title: "Total Maintenance for 1 Year", value: "680" },
  { title: "Total Maintenance for 5 Year", value: "320" },
  { title: "Total Maintenance for 10 Year", value: "100" },
];

const Maintenance = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>("objectView");
  const [searchValue, setSearchValue] = useState<string>("");
  const [selectedRowId, setSelectedRowId] = useState<string | number>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isSelectAll, setIsSelectAll] = useState<boolean>(false);
  const [popoverState, setPopoverState] = useState<{
    show: boolean;
    rowId: string | number | null;
  }>({ show: false, rowId: null });
  const actionIconRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const itemsPerPage = 5;

  // Table data and handlers
  const columns: TableColumn[] = [
    {
      key: "objectName",
      title: "Object Name",
      width: "calc(100% / 4)",
    },
    {
      key: "year1",
      title: "1 Year",
      width: "calc(100% / 4)",
    },
    {
      key: "year5",
      title: "5 Year",
      width: "calc(100% / 4)",
    },
    {
      key: "year10",
      title: "10 Year",
      width: "calc(100% / 4)",
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

  const totalItems = buildingMaintenancePlanRowsData?.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Get current page data
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRows =
    buildingMaintenancePlanRowsData?.slice(startIndex, endIndex) || [];

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setSelectedRowId("");
  };
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // Handle tab change logic here
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
        {activeTab === "objectView" && isSelectAll && (
          <Button
            title="Select All"
            onClick={() => {}}
            variant="outline"
            size="sm"
            className={styles.building_maintenance_top_section_right_select_all}
          />
        )}
        <Button
          title="Update Last Date "
          onClick={() => {}}
          variant="primary"
          size="sm"
        />
      </div>
    );
  };
  const renderObjectView = () => {
    return <div>Object View</div>;
  };
  const renderMaintenancePlan = () => {
    return (
      <div className={styles.building_maintenance_plan_container}>
        <div className={styles.dashboard_clients_middle_container}>
          {maintenancePlanCardTitle.map((card, index) => (
            <MetricCard
              key={index}
              title={card.title}
              value={Number(card.value)}
              className={styles.dashboard_clients_static_card}
              titleStyle={styles.dashboard_clients_static_card_title}
              showK={true}
            />
          ))}
        </div>
        <CommonTable
          columns={columns}
          rows={currentRows}
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
      {activeTab === "maintenancePlan" && renderMaintenancePlan()}
    </section>
  );
};

export default Maintenance;
