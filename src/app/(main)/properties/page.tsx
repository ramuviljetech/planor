"use client";

import React, { useEffect, useState } from "react";
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
import FallbackScreen from "@/components/ui/fallback-screen";
import {
  Property,
  PropertiesStatistics,
  PropertiesPagination,
  Building,
} from "@/types/property";
import {
  getAllBuildings,
  getProperties,
} from "@/networking/properties-api-service";

const PropertiesPage = () => {
  const router = useRouter();
  const [selectedRowId, setSelectedRowId] = useState<string | number>("");
  const [activeTab, setActiveTab] = useState<string>("properties");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [statistics, setStatistics] = useState<PropertiesStatistics | null>(
    null
  );
  const [totalProperties, setTotalProperties] = useState(0);
  const [propertiesPagination, setPropertiesPagination] =
    useState<PropertiesPagination | null>(null);
  const [buildingsPagination, setBuildingsPagination] =
    useState<PropertiesPagination | null>(null);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [buildingsStatistics, setBuildingsStatistics] = useState<any>(null);
  const [totalBuildings, setTotalBuildings] = useState(0);
  const tabs: TabItem[] = [
    { label: "Properties", value: "properties" },
    { label: "Buildings", value: "buildings" },
  ];
  console.log("propertiesData", properties);
  // Fetch properties data from API
  const fetchProperties = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await getProperties();

      if (response.success) {
        const {
          properties: propertiesData,
          count,
          statistics: stats,
          pagination,
        } = response.data;
        setProperties(propertiesData || []);
        setStatistics(stats || null);
        setTotalProperties(count || 0);
        setPropertiesPagination(pagination || null);
        setBuildingsPagination(pagination || null);
      } else {
        setError(response.message || "Failed to fetch properties");
      }
    } catch (error) {
      console.error("Error fetching properties:", error);
      setError("Failed to fetch properties. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBuildings = async () => {
    try {
      const response = await getAllBuildings();
      if (response.success) {
        setBuildings(response.data);
        setBuildingsPagination(response.data.pagination);
        setBuildingsStatistics(response.data.statistics);
        setTotalBuildings(response.data.count);
      } else {
        setError(response.message || "Failed to fetch buildings");
      }
    } catch (error) {
      console.error("Error fetching buildings:", error);
    }
  };

  // Use statistics from API response
  const getStatisticsCards = () => {
    if (!statistics) return [];

    return [
      {
        title: "Total Properties",
        value: statistics.totalProperties.toString(),
      },
      { title: "Total Area", value: statistics.totalArea.toString() },
      { title: "Total Buildings", value: statistics.totalBuildings.toString() },
      {
        title: "Total Maintenance Cost",
        value: Object.values(statistics.totalMaintenanceCost)
          .reduce((sum, cost) => sum + cost, 0)
          .toString(),
      },
    ];
  };
  // Get current page data from API response
  const currentRows = properties || [];

  useEffect(() => {
    fetchProperties();
    fetchBuildings();
  }, []); // Empty dependency array since we only want to run this once

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

  // Handle page change for buildings tab
  const handleBuildingsPageChange = (page: number) => {
    // TODO: Implement pagination for buildings when API supports it
    console.log("Page changed to:", page);
  };

  // ui

  const renderHeaderSection = () => {
    return (
      <div className={styles.properties_header_section}>
        <div className={styles.properties_header_section_title_container}>
          <p className={styles.properties_count}>
            {isLoading ? "..." : totalProperties || 0}
          </p>
          <p className={styles.properties_header_section_title}>Properties</p>
        </div>
      </div>
    );
  };

  const renderBuldingsTab = () => {
    const statisticsCards = getStatisticsCards();

    return (
      <div className={styles.properties_buldings_tab_container}>
        {/* building static card */}
        <div className={styles.properties_buldings_static_card_container}>
          {statisticsCards.map((card, index) => (
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
        {/* building table */}
        <div className={styles.properties_buldings_table_container}>
          <CommonTableWithPopover
            columns={buildingListColumns}
            rows={currentRows}
            onRowClick={() => {}}
            selectedRowId={selectedRowId}
            pagination={{
              currentPage: buildingsPagination?.currentPage || 1,
              totalPages: buildingsPagination?.totalPages || 0,
              totalItems: buildingsPagination?.totalItems || 0,
              itemsPerPage: buildingsPagination?.itemsPerPage || 10,
              onPageChange: handleBuildingsPageChange,
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

  // Show error state
  if (error && !isLoading) {
    return (
      <div className={styles.properties_page_container}>
        {renderHeaderSection()}
        <FallbackScreen
          title="Error Loading Properties"
          subtitle={error}
          className={styles.properties_loading_fallback}
        />
      </div>
    );
  }

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
          <>
            {isLoading ? (
              <FallbackScreen
                title="Loading Properties"
                subtitle="Please wait while we fetch your properties data..."
                className={styles.properties_loading_fallback}
              />
            ) : (
              <ClientPropertiesList
                showPropertyListSection={false}
                propertiesData={properties}
                pagination={propertiesPagination}
                statistics={statistics}
              />
            )}
          </>
        )}
        {activeTab === "buildings" && renderBuldingsTab()}
      </div>
    </div>
  );
};

export default PropertiesPage;
