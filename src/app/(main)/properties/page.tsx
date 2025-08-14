"use client";

import React, { useEffect, useState } from "react";
import { TableColumn } from "@/components/ui/common-table";
import CustomTabs, { TabItem } from "@/components/ui/tabs";
import ClientPropertiesList from "@/sections/clients-section/client-properties-list";
import MetricCard from "@/components/ui/metric-card";
import { buildingListColumns } from "@/app/constants";
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
  const [isPropertiesLoading, setIsPropertiesLoading] = useState(true);
  const [isBuildingsLoading, setIsBuildingsLoading] = useState(true);
  const [isPaginationLoading, setIsPaginationLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [propertiesError, setPropertiesError] = useState<string | null>(null);
  const [buildingsError, setBuildingsError] = useState<string | null>(null);
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

  // Fetch properties data from API
  const fetchProperties = async (
    page: number = 1,
    limit: number = 5,
    isPagination: boolean = false
  ) => {
    try {
      // Only set loading state if it's not a pagination request
      if (!isPagination) {
        setIsPropertiesLoading(true);
      }
      setPropertiesError(null);

      const response = await getProperties(page, limit);
      console.log("properties response", response);

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
        setPropertiesError(response.message || "Failed to fetch properties");
      }
    } catch (error) {
      console.error("Error fetching properties:", error);
      setPropertiesError("Failed to fetch properties. Please try again later.");
    } finally {
      setIsPropertiesLoading(false);
      setIsLoading(false); // Set main loading to false when both are done
    }
  };

  const fetchBuildings = async () => {
    try {
      setIsBuildingsLoading(true);
      setBuildingsError(null);

      const response = await getAllBuildings();
      if (response.success) {
        // Extract data from the nested structure
        const buildingsData = response.data.buildings || [];
        const count = response.data.count || 0;
        const statistics = response.data.statistics || null;
        const pagination = response.data.pagination || null;

        // Transform pagination to match expected format
        const transformedPagination = pagination
          ? {
              currentPage: pagination.page || 1,
              itemsPerPage: pagination.limit || 10,
              totalItems: pagination.total || 0,
              totalPages: pagination.totalPages || 1,
              hasNextPage:
                (pagination.page || 1) < (pagination.totalPages || 1),
              hasPreviousPage: (pagination.page || 1) > 1,
            }
          : null;

        setBuildings(buildingsData);
        setBuildingsPagination(transformedPagination);
        setBuildingsStatistics(statistics);
        setTotalBuildings(count);
      } else {
        setBuildingsError(response.message || "Failed to fetch buildings");
      }
    } catch (error) {
      console.error("Error fetching buildings:", error);
      setBuildingsError("Failed to fetch buildings. Please try again later.");
    } finally {
      setIsBuildingsLoading(false);
      setIsLoading(false); // Set main loading to false when both are done
    }
  };

  // Use statistics from API response
  const getStatisticsCards = () => {
    if (!buildingsStatistics) return [];

    return [
      {
        title: "Total Buildings",
        value: buildingsStatistics.totalBuildings || 0,
      },
      {
        title: "Total Area",
        value: buildingsStatistics.totalArea || 0,
      },
      {
        title: "Total Maintenance Cost",
        value: buildingsStatistics.totalMaintenanceCost
          ? Object.values(
              buildingsStatistics.totalMaintenanceCost as Record<string, number>
            )
              .reduce((sum: number, cost: number) => sum + cost, 0)
              .toString()
          : "0",
      },
      {
        title: "Maintenance Updates",
        value: buildingsStatistics.totalMaintenanceUpdates || 0,
      },
    ];
  };
  // Get current page data from API response
  const currentRows = properties || [];

  useEffect(() => {
    fetchProperties(currentPage, 5, false); // Initial load, not pagination
    fetchBuildings();
  }, []); // Empty dependency array since we only want to run this once

  // Handle building row click
  const handleBuildingRowClick = (row: any, index: number) => {
    router.push(`/building-details/${row.id}`);
  };

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

  // Define building-specific actions
  const buildingActions: PopoverAction[] = [
    {
      label: "View Details",
      onClick: (rowId: string | number) =>
        router.push(`/building-details/${rowId}`),
    },
    {
      label: "Edit Building",
      onClick: (rowId: string | number) => {
        // TODO: Implement edit building functionality
        console.log("Edit building:", rowId);
      },
    },
    {
      label: "View Objects",
      onClick: (rowId: string | number) => {
        // TODO: Implement view objects functionality
        console.log("View objects for building:", rowId);
      },
    },
  ];

  // Handle page change for properties tab
  const handlePropertiesPageChange = async (page: number) => {
    console.log("Properties page changed to:", page);
    setCurrentPage(page);
    await fetchProperties(page, 5, true); // Fetch properties with new page, mark as pagination
  };

  // Handle page change for buildings tab
  const handleBuildingsPageChange = (page: number) => {
    console.log("Buildings page changed to:", page);
    setCurrentPage(page);
    // TODO: Implement pagination API call when backend supports it
    // For now, we'll just update the current page state
  };

  // Handle pagination start/end for properties
  const handlePaginationStart = () => {
    setIsPaginationLoading(true);
  };

  const handlePaginationEnd = () => {
    setIsPaginationLoading(false);
  };

  // Fetch buildings with pagination (for future use)
  const fetchBuildingsWithPagination = async (
    page: number = 1,
    limit: number = 10
  ) => {
    try {
      // TODO: Update API call to support pagination parameters
      // const response = await getAllBuildings(page, limit);
      // For now, just fetch all buildings
      await fetchBuildings();
    } catch (error) {
      console.error("Error fetching buildings with pagination:", error);
    }
  };

  // ui

  const renderHeaderSection = () => {
    const getCount = () => {
      if (activeTab === "buildings") {
        return totalBuildings;
      }
      return totalProperties;
    };

    const getTitle = () => {
      if (activeTab === "buildings") {
        return "Buildings";
      }
      return "Properties";
    };

    const getLoadingState = () => {
      if (activeTab === "buildings") {
        return isBuildingsLoading;
      }
      return isPropertiesLoading;
    };

    return (
      <div className={styles.properties_header_section}>
        <div className={styles.properties_header_section_title_container}>
          <p className={styles.properties_count}>
            {getLoadingState() ? "" : getCount() || 0}
          </p>
          <p className={styles.properties_header_section_title}>{getTitle()}</p>
        </div>
      </div>
    );
  };

  const renderBuldingsTab = () => {
    // Transform buildings data for the table
    const transformedBuildingsData = buildings?.map((building: Building) => ({
      id: building.id,
      buildingName: building.buildingName,
      floors: building.metadata?.floors || 0,
      builtYear: new Date(building.createdAt).getFullYear(),
      contactPerson: building.contactPerson,
      totalObjectsUsed: building.total_objects_used || 0,
      status: building.isActive ? "Active" : "Inactive",
      totalArea: building.metadata?.totalArea || 0,
      buildingObjects: building.buildingObjects,
      description: building.description,
    }));

    return (
      <div className={styles.properties_buldings_tab_container}>
        {/* building static card */}
        <div className={styles.properties_buldings_static_card_container}>
          {isBuildingsLoading
            ? // Show loading skeleton for statistics cards
              Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className={styles.properties_buldings_static_card}
                >
                  <div className={styles.properties_buldings_static_card_title}>
                    <div className={styles.loading_skeleton_title}></div>
                  </div>
                  <div className={styles.properties_buldings_static_card_value}>
                    <div className={styles.loading_skeleton_value}></div>
                  </div>
                </div>
              ))
            : getStatisticsCards().map((card, index) => (
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
          {isBuildingsLoading ? (
            <div className={styles.buildings_table_loading}>
              <FallbackScreen
                title="Loading Buildings Table"
                subtitle="Please wait while we fetch the buildings data..."
                className={styles.properties_loading_fallback}
              />
            </div>
          ) : (
            <CommonTableWithPopover
              columns={buildingListColumns}
              rows={transformedBuildingsData}
              onRowClick={handleBuildingRowClick}
              selectedRowId={selectedRowId}
              pagination={{
                currentPage: buildingsPagination?.currentPage || 1,
                totalPages: buildingsPagination?.totalPages || 0,
                totalItems: buildingsPagination?.totalItems || 0,
                itemsPerPage: buildingsPagination?.itemsPerPage || 10,
                onPageChange: handleBuildingsPageChange,
                showItemCount: true,
              }}
              actions={buildingActions}
              actionIconClassName={styles.actionIcon}
              popoverMenuClassName={styles.action_popoverMenu}
              popoverMenuItemClassName={styles.action_popoverMenuItem}
            />
          )}
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
            {isPropertiesLoading && !isPaginationLoading ? (
              <FallbackScreen
                title="Loading Properties"
                subtitle="Please wait while we fetch your properties data..."
                className={styles.properties_loading_fallback}
              />
            ) : propertiesError ? (
              <FallbackScreen
                title="Error Loading Properties"
                subtitle={propertiesError}
                className={styles.properties_loading_fallback}
              />
            ) : (
              <ClientPropertiesList
                showPropertyListSection={false}
                propertiesData={properties}
                pagination={propertiesPagination || undefined}
                statistics={statistics}
                onPageChange={handlePropertiesPageChange}
                currentPage={currentPage}
                onPaginationStart={handlePaginationStart}
                onPaginationEnd={handlePaginationEnd}
              />
            )}
          </>
        )}
        {activeTab === "buildings" && (
          <>
            {isBuildingsLoading ? (
              <FallbackScreen
                title="Loading Buildings"
                subtitle="Please wait while we fetch your buildings data..."
                className={styles.properties_loading_fallback}
              />
            ) : buildingsError ? (
              <FallbackScreen
                title="Error Loading Buildings"
                subtitle={buildingsError}
                className={styles.properties_loading_fallback}
              />
            ) : (
              renderBuldingsTab()
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PropertiesPage;
