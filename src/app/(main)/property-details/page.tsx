"use client";
import React, { useEffect, useRef, useState } from "react";
import SectionHeader from "@/components/ui/section-header";
import Button from "@/components/ui/button";
import Image from "next/image";
import { filterIcon, threeDotsIcon } from "@/resources/images";
import Breadcrumb from "@/components/ui/breadcrumb";
import Info from "@/components/ui/info";
import MetricCard from "@/components/ui/metric-card";
import styles from "./styles.module.css";
import { useRouter, useSearchParams } from "next/navigation";
import CommonTableWithPopover, {
  PopoverAction,
} from "@/components/ui/common-table-with-popover";
import { TableColumn, TableRow } from "@/components/ui/common-table";
import {
  buildingListColumns,
  buildingListRowsData,
  rowsData,
} from "@/app/constants";
import AddBuildingModal from "@/components/add-building-modal";
import {
  getBuildingsByPropertyId,
  getPropertyDetailsById,
} from "@/networking/properties-api-service";
import FallbackScreen from "@/components/ui/fallback-screen";
import { Building, PropertyDetailsTypes } from "@/types/property";
import moment from "moment";

const PropertyDetails: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const buildingListRef = useRef<HTMLDivElement>(null);
  const [showAddBuildingModal, setShowAddBuildingModal] = useState(false);
  const [propertyDetails, setPropertyDetails] =
    useState<PropertyDetailsTypes>();
  const [isLoading, setIsLoading] = useState(false);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [buildingsStatistics, setBuildingsStatistics] = useState<any>(null);
  const [buildingsPagination, setBuildingsPagination] = useState<any>(null);
  const breadcrumbItems = [
    { label: "Brunnfast AB", isActive: false },
    { label: "Kvarter Skatan", isActive: true },
  ];

  const propertyInfoItems = [
    { label: "Name", value: propertyDetails?.propertyName || "N/A" },
    {
      label: "Primary Contact Name",
      value: propertyDetails?.primaryContactName || "N/A",
    },
    { label: "Client ID", value: propertyDetails?.clientId || "N/A" },
    { label: "Role", value: propertyDetails?.role || "N/A" },
    {
      label: "Organization Number",
      value: propertyDetails?.organizationNumber || "N/A",
    },
    { label: "Phone", value: propertyDetails?.phone || "N/A" },
    { label: "Industry Type", value: propertyDetails?.propertyType || "N/A" },
    { label: "Email", value: propertyDetails?.email || "N/A" },
    { label: "Website Url", value: propertyDetails?.websiteUrl || "N/A" },
    { label: "Description", value: propertyDetails?.description || "N/A" },
  ];

  const totalMaintenanceCost = buildingsStatistics?.totalMaintenanceCost
    ? Object.values(buildingsStatistics.totalMaintenanceCost).reduce(
        (sum: number, cost: any) => sum + (cost || 0),
        0
      )
    : 0;

  const propertyStatistics = [
    {
      label: "Total Buildings",
      value: buildingsStatistics?.totalBuildings || 0,
    },
    { label: "Total Area", value: buildingsStatistics?.totalArea || 0 },
    {
      label: "Total Maintenance Cost",
      value: totalMaintenanceCost.toLocaleString() || 0,
    },
    {
      label: "Maintenance Updates",
      value: buildingsStatistics?.maintenanceUpdates || 0,
    },
  ];

  const [selectedRowId, setSelectedRowId] = useState<string | number>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchValue, setSearchValue] = useState("");
  const [debouncedSearchValue, setDebouncedSearchValue] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const itemsPerPage = 10;

  // Debounce search value
  useEffect(() => {
    setIsSearching(true);
    const timer = setTimeout(() => {
      setDebouncedSearchValue(searchValue);
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchValue]);

  // Transform building data for table display
  const transformBuildingDataForTable = (buildings: Building[]) => {
    return buildings.map((building) => ({
      id: building.id,
      buildingName: building.buildingName?.trim() || "N/A",
      floors: building.metadata?.floors || 0,
      builtYear: moment(building.createdAt).format("MMM YYYY") || "N/A",
      contactPerson: building.contactPerson || "N/A",
      totalObjectsUsed: building.total_objects_used || 0,
      status: building.isActive ? "Active" : "Inactive",
    }));
  };

  // Filter buildings based on debounced search
  const filteredBuildings =
    buildings?.filter(
      (building) =>
        building.buildingName
          ?.toLowerCase()
          .includes(debouncedSearchValue.toLowerCase()) ||
        building.description
          ?.toLowerCase()
          .includes(debouncedSearchValue.toLowerCase()) ||
        building.contactPerson
          ?.toLowerCase()
          .includes(debouncedSearchValue.toLowerCase())
    ) || [];

  const totalItems = filteredBuildings?.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Get current page data from filtered buildings data
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRows = filteredBuildings
    ? transformBuildingDataForTable(filteredBuildings).slice(
        startIndex,
        endIndex
      )
    : [];

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      try {
        setIsLoading(true);

        // Call both APIs simultaneously
        const [propertyResponse, buildingsResponse] = await Promise.all([
          getPropertyDetailsById(id),
          getBuildingsByPropertyId(id),
        ]);

        // Handle property details response
        if (propertyResponse.success) {
          setPropertyDetails(propertyResponse.data.property);
        } else {
          setPropertyDetails(null as any);
          console.error(
            "Error fetching property details:",
            propertyResponse.message
          );
        }

        // Handle buildings response
        if (buildingsResponse.success) {
          setBuildings(buildingsResponse.data.buildings);
          setBuildingsStatistics(buildingsResponse.data.statistics);
          setBuildingsPagination(buildingsResponse.data.pagination);
        } else {
          console.error("Error fetching buildings:", buildingsResponse.message);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchValue]);

  const actions: PopoverAction[] = [
    {
      label: "View Details",
      onClick: (row: any) => {
        console.log("View Details clicked for building:", row);
        router.push(`/building-details?id=${row.id}`);
      },
    },
    {
      label: "Edit Building",
      onClick: (row: any) => {
        console.log("Edit Building clicked for building:", row);
        // Add your edit building logic here
      },
    },
  ];

  const handleRowClick = (row: TableRow, index: number) => {
    console.log("Building clicked:", row);
    // Navigate to building details with the building ID
    if (row.id) {
      router.push(`/building-details?id=${row.id}`);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setSelectedRowId("");
  };

  const handleAddBuildingClick = () => {
    setShowAddBuildingModal(true);
  };

  const handleCloseModal = () => {
    setShowAddBuildingModal(false);
  };

  const renderAddBuildingModal = () => {
    return (
      <AddBuildingModal
        show={showAddBuildingModal}
        onClose={handleCloseModal}
      />
    );
  };

  const renderTopContainer = () => {
    return (
      <section className={styles.property_details_top_container}>
        <Breadcrumb
          items={breadcrumbItems}
          showBackArrow={true}
          onBackClick={() => router.back()}
        />
        <Button
          title="Add Building"
          onClick={handleAddBuildingClick}
          variant="primary"
        />
      </section>
    );
  };

  const renderBodyContainer = () => {
    return (
      <div className={styles.property_details_body_container}>
        {/* Header */}
        <div className={styles.property_details_body_container_header}>
          <p className={styles.property_details_body_container_title}>
            Property Info
          </p>
        </div>
        {/* Property Info */}
        <div className={styles.property_details_property_info}>
          {propertyInfoItems.map((item, index) => (
            <Info
              key={index}
              title={item.label}
              value={item.value}
              className={styles.property_details_property_info_item}
            />
          ))}
        </div>
        {/* Building List */}
        <div className={styles.property_building_info}>
          <SectionHeader
            title={`Building List`}
            searchValue={searchValue}
            searchPlaceholder="Search by building name, description, or contact person"
            onSearchChange={setSearchValue}
            filterComponent={
              <div ref={buildingListRef} onClick={() => {}}>
                <Image src={filterIcon} alt="filter" width={24} height={24} />
              </div>
            }
            titleStyle={styles.property_building_info_title}
          />
          {filteredBuildings.length > 0 ? (
            <>
              {debouncedSearchValue && (
                <div className={styles.search_results_info}>
                  <div className={styles.search_results_count}>
                    {filteredBuildings.length} result
                    {filteredBuildings.length !== 1 ? "s" : ""} found
                  </div>
                  <p>
                    Showing results for:{" "}
                    <strong>"{debouncedSearchValue}"</strong>
                  </p>
                </div>
              )}
              <div className={styles.property_statistics}>
                {propertyStatistics.map((item, index) => (
                  <MetricCard
                    key={index}
                    title={item.label}
                    value={Number(item.value)}
                    className={styles.property_statistics_item}
                  />
                ))}
              </div>
              <CommonTableWithPopover
                columns={buildingListColumns}
                rows={currentRows}
                onRowClick={handleRowClick}
                selectedRowId={selectedRowId}
                actions={actions}
                pagination={{
                  currentPage,
                  totalPages,
                  totalItems,
                  itemsPerPage,
                  onPageChange: handlePageChange,
                  showItemCount: true,
                }}
                actionIconClassName={styles.actionIcon}
                popoverMenuClassName={styles.action_popoverMenu}
                popoverMenuItemClassName={styles.action_popoverMenuItem}
                aria-label={`Buildings table showing ${filteredBuildings.length} buildings`}
              />
            </>
          ) : buildings.length > 0 ? (
            <div className={styles.property_building_info_empty_state}>
              <p className={styles.property_building_info_empty_state_title}>
                {debouncedSearchValue
                  ? `No buildings found matching "${debouncedSearchValue}"`
                  : "No buildings found"}
              </p>
              {debouncedSearchValue && (
                <p
                  className={styles.property_building_info_empty_state_subtitle}
                >
                  Try adjusting your search terms or clear the search to see all
                  buildings.
                </p>
              )}
            </div>
          ) : (
            <div className={styles.property_building_info_empty_state}>
              <p className={styles.property_building_info_empty_state_title}>
                No buildings found
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={styles.property_details_container}>
      {renderTopContainer()}
      {isLoading ? (
        <FallbackScreen
          title="Loading Property Details"
          subtitle="Please wait while we fetch your property details..."
          className={styles.property_details_loading_fallback}
        />
      ) : (
        renderBodyContainer()
      )}
      {renderAddBuildingModal()}
    </div>
  );
};

export default PropertyDetails;
