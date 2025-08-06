"use client";

import React, { useState } from "react";
import { TableColumn } from "@/components/ui/common-table";
import CustomTabs, { TabItem } from "@/components/ui/tabs";
import ClientPropertiesList from "@/sections/clients-section/client-properties-list";
import MetricCard from "@/components/ui/metric-card";
import {
  buildingListColumns,
  buildingListRowsData,
  rowsData,
} from "@/app/constants";
import CommonTableWithPopover, {
  PopoverAction,
} from "@/components/ui/common-table-with-popover";
import styles from "./styles.module.css";
import { useRouter } from "next/navigation";

const PropertiesPage = () => {
  const router = useRouter();
  const [selectedRowId, setSelectedRowId] = useState<string | number>("");
  const [activeTab, setActiveTab] = useState<string>("properties");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const tabs: TabItem[] = [
    { label: "Properties", value: "properties" },
    { label: "Buldings", value: "buldings" },
  ];

  const buldingsStaticCardTitle = [
    { title: " Total Buildings", value: "24" },
    { title: "Total Area", value: "25000" },
    { title: "Total Maintenance Cost", value: "849340" },
    { title: "Maintenance Updates", value: "24" },
  ];

  const totalItems = buildingListRowsData?.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Get current page data
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRows = buildingListRowsData?.slice(startIndex, endIndex) || [];

  // Define popover actions
  const actions: PopoverAction[] = [
    {
      label: "View Details",
      onClick: () => router.push("/building-details"),
    },
    {
      label: "Edit Building",
      onClick: () => {},
    },
  ];

  // ui

  const renderHeaderSection = () => {
    return (
      <div className={styles.properties_header_section}>
        <div className={styles.properties_header_section_title_container}>
          <p className={styles.properties_count}>124</p>
          <p className={styles.properties_header_section_title}>Properties</p>
        </div>
      </div>
    );
  };

  const renderBuldingsTab = () => {
    return (
      <div className={styles.properties_buldings_tab_container}>
        {/* bulding static card */}
        <div className={styles.properties_buldings_static_card_container}>
          {buldingsStaticCardTitle.map((card, index) => (
            <MetricCard
              key={index}
              title={card.title}
              value={Number(card.value)}
              className={styles.properties_buldings_static_card}
              titleStyle={styles.properties_buldings_static_card_title}
              valueStyle={styles.properties_buldings_static_card_value}
              showK={false}
            />
          ))}
        </div>
        {/* bulding table */}
        <div className={styles.properties_buldings_table_container}>
          <CommonTableWithPopover
            columns={buildingListColumns}
            rows={currentRows}
            onRowClick={() => {}}
            selectedRowId={selectedRowId}
            pagination={{
              currentPage,
              totalPages,
              totalItems,
              itemsPerPage,
              onPageChange: () => {},
              showItemCount: true,
            }}
            actions={actions}
            actionIconClassName={styles.actionIcon}
            popoverMenuClassName={styles.action_popoverMenu}
            popoverMenuItemClassName={styles.action_popoverMenuItem}
          />
        </div>
      </div>
    );
  };
  return (
    <div className={styles.properties_page_container}>
      {renderHeaderSection()}
      <div className={styles.properties_details_container}>
        <CustomTabs
          tabs={tabs}
          onTabChange={setActiveTab}
          defaultTab={activeTab}
          className={styles.properties_tabs_container}
        />
        {activeTab === "properties" && (
          <ClientPropertiesList showPropertyListSection={false} />
        )}
        {activeTab === "buldings" && renderBuldingsTab()}
      </div>
    </div>
  );
};

export default PropertiesPage;
