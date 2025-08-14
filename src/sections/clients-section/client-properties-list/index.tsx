"use client";

import Image from "next/image";
import { filterIcon, propertiesBlueIcon } from "@/resources/images";
import { clientDetailsCardsData } from "@/app/constants";
import SectionHeader from "@/components/ui/section-header";
import { useRef, useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import CommonTableWithPopover, {
  PopoverAction,
} from "@/components/ui/common-table-with-popover";
import { TableColumn, TableRow } from "@/components/ui/common-table";
import styles from "./styles.module.css";
import AddPropertyModal from "@/components/add-property-modal";
import { Property } from "@/types/property";
import { PropertiesPagination } from "@/types/property";

interface ClientPropertiesListProps {
  showPropertyListSection?: boolean;
  propertiesData?: Property[];
  pagination?: PropertiesPagination;
  statistics?: any;
  onPageChange?: (page: number) => void;
  currentPage?: number;
  onPaginationStart?: () => void;
  onPaginationEnd?: () => void;
}

const ClientPropertiesList: React.FC<ClientPropertiesListProps> = ({
  showPropertyListSection = true,
  propertiesData,
  statistics,
  pagination,
  onPageChange,
  currentPage: externalCurrentPage,
  onPaginationStart,
  onPaginationEnd,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const clientsFilterRef = useRef<HTMLDivElement>(null);
  const [searchValue, setSearchValue] = useState<string>("");
  const [selectedRowId, setSelectedRowId] = useState<string | number>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const itemsPerPage = 10;
  const [showAddPropertyModal, setShowAddPropertyModal] = useState(false);

  // Use external currentPage if provided (for server-side pagination)
  const effectiveCurrentPage = externalCurrentPage || currentPage;

  // Use server-side pagination if available, otherwise fall back to client-side
  const useServerPagination = pagination && onPageChange;

  // Table columns updated to match property data
  const columns: TableColumn[] = [
    {
      key: "propertyName",
      title: "Property Name",
      width: 200,
    },
    {
      key: "numOfBuildings",
      title: "Buildings",
      width: 120,
    },
    {
      key: "propertyCode",
      title: "Code",
      width: 100,
    },
    {
      key: "propertyType",
      title: "Type",
      width: 150,
    },
    {
      key: "city",
      title: "City",
      width: 150,
    },
    {
      key: "metadata",
      title: "Gross Area",
      width: 150,
    },
  ];

  // Transform properties data to table rows
  const transformedRows = useMemo(() => {
    if (!propertiesData) return [];

    return propertiesData.map((property) => ({
      id: property.id,
      propertyName: property.propertyName,
      numOfBuildings: property.numOfBuildings,
      propertyCode: property.propertyCode,
      propertyType: property.propertyType,
      city: property.city,
      metadata: property.grossArea || "-",
      originalData: property,
    }));
  }, [propertiesData]);

  // Filter rows based on search
  const filteredRows = useMemo(() => {
    if (!searchValue) return transformedRows;

    return transformedRows.filter(
      (row) =>
        row.propertyName.toLowerCase().includes(searchValue.toLowerCase()) ||
        row.propertyCode.toLowerCase().includes(searchValue.toLowerCase()) ||
        row.city.toLowerCase().includes(searchValue.toLowerCase())
    );
  }, [transformedRows, searchValue]);

  const totalItems = useServerPagination
    ? pagination.totalItems
    : filteredRows.length;
  const totalPages = useServerPagination
    ? pagination.totalPages
    : Math.ceil(filteredRows.length / itemsPerPage);

  // Get current page data - use server data or client-side slicing
  const startIndex = (effectiveCurrentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRows = useServerPagination
    ? filteredRows
    : filteredRows.slice(startIndex, endIndex);

  const handleRowClick = (row: TableRow, index: number) => {
    router.push(`/property-details?id=${encodeURIComponent(row.id)}`);
  };

  const handlePageChange = async (page: number) => {
    setCurrentPage(page);
    setSelectedRowId("");

    // Show loading state for server-side pagination
    if (useServerPagination) {
      setIsLoading(true);
      // Notify parent component that pagination has started
      onPaginationStart?.();
    }

    try {
      await onPageChange?.(page);
    } finally {
      // Hide loading state after page change completes
      if (useServerPagination) {
        setIsLoading(false);
        // Notify parent component that pagination has ended
        onPaginationEnd?.();
      }
    }
  };

  const handleViewDetails = (rowData: any) => {
    router.push(`/property-details?id=${encodeURIComponent(rowData?.id)}`);
  };

  const handleAddBuilding = (rowData: any) => {
    console.log("Add Building clicked for property:", rowData);
    // Add your add building logic here
  };

  // Define popover actions
  const actions: PopoverAction[] = [
    {
      label: "View Details",
      onClick: handleViewDetails,
    },
    {
      label: "Add Building",
      onClick: handleAddBuilding,
    },
  ];

  const renderCard = () => {
    if (!statistics) {
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
    }

    const totalMaintenanceCost = Object.values(
      statistics.totalMaintenanceCost
    ).reduce((sum: number, cost: any) => sum + (cost || 0), 0);

    const statisticsCards = [
      {
        title: "Properties",
        value: statistics.totalProperties?.toString() || "0",
      },
      {
        title: "Total Area",
        value: `${(statistics.totalArea || 0).toLocaleString()} m²`,
      },
      {
        title: "Maintenance Cost",
        value: `$${totalMaintenanceCost.toLocaleString()}`,
      },
      {
        title: "Buildings",
        value: statistics.totalBuildings?.toString() || "0",
      },
    ];

    return (
      <div className={styles.client_details_card_container}>
        {statisticsCards.map((card, index) => (
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
      {showPropertyListSection && (
        <SectionHeader
          title="Properties List"
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          searchPlaceholder="Search properties..."
          actionButtonTitle="Add Property"
          onActionButtonClick={() => setShowAddPropertyModal(true)}
          filterComponent={
            <div ref={clientsFilterRef} onClick={() => {}}>
              <Image src={filterIcon} alt="filter" width={24} height={24} />
            </div>
          }
          searchBarStyle={styles.client_details_search_bar}
          actionButtonStyle={styles.client_details_add_property_button}
        />
      )}
      <div className={styles.table_container_wrapper}>
        {propertiesData && propertiesData.length === 0 ? (
          <div className={styles.no_properties_found_container}>
            <p className={styles.no_properties_found_text}>
              No properties found for this client
            </p>
          </div>
        ) : (
          <CommonTableWithPopover
            columns={columns}
            rows={currentRows}
            onRowClick={handleRowClick}
            selectedRowId={selectedRowId}
            pagination={{
              currentPage: effectiveCurrentPage,
              totalPages: useServerPagination
                ? pagination.totalPages
                : totalPages,
              totalItems: useServerPagination
                ? pagination.totalItems
                : totalItems,
              itemsPerPage: useServerPagination
                ? pagination.itemsPerPage
                : itemsPerPage,
              onPageChange: handlePageChange,
              showItemCount: true,
            }}
            actions={actions}
            actionIconClassName={styles.actionIcon}
            popoverMenuClassName={styles.action_popoverMenu}
            popoverMenuItemClassName={styles.action_popoverMenuItem}
            disabled={isLoading}
          />
        )}
        {/* Loading overlay for pagination */}
        {isLoading &&
          useServerPagination &&
          propertiesData &&
          propertiesData.length > 0 && (
            <div className={styles.pagination_loading_overlay}>
              <div className={styles.pagination_loading_spinner}>
                <div className={styles.spinner}></div>
                <span>Loading...</span>
              </div>
            </div>
          )}
      </div>
      <AddPropertyModal
        show={showAddPropertyModal}
        onClose={() => setShowAddPropertyModal(false)}
      />
    </div>
  );
};

export default ClientPropertiesList;
