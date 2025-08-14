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

interface ClientPropertiesListProps {
  showPropertyListSection?: boolean;
  propertiesData?: Property[];
  pagination?: any;
  statistics?: any;
}

const ClientPropertiesList: React.FC<ClientPropertiesListProps> = ({
  showPropertyListSection = true,
  propertiesData,
  statistics,
  pagination,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const clientsFilterRef = useRef<HTMLDivElement>(null);
  const [searchValue, setSearchValue] = useState<string>("");
  const [selectedRowId, setSelectedRowId] = useState<string | number>("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [showAddPropertyModal, setShowAddPropertyModal] = useState(false);

  console.log("statistics", statistics);

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

  const totalItems = filteredRows.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Get current page data
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRows = filteredRows.slice(startIndex, endIndex);

  const handleRowClick = (row: TableRow, index: number) => {
    console.log("Property row clicked:", {
      id: row.id,
      propertyName: row.propertyName,
      propertyCode: row.propertyCode,
      propertyType: row.propertyType,
      city: row.city,
      metadata: row.metadata,
      numOfBuildings: row.numOfBuildings,
      originalData: row.originalData,
    });
    setSelectedRowId(row.id);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setSelectedRowId("");
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
      <CommonTableWithPopover
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
        actions={actions}
        actionIconClassName={styles.actionIcon}
        popoverMenuClassName={styles.action_popoverMenu}
        popoverMenuItemClassName={styles.action_popoverMenuItem}
      />
      <AddPropertyModal
        show={showAddPropertyModal}
        onClose={() => setShowAddPropertyModal(false)}
        clientId={searchParams?.get("id") || ""}
      />
    </div>
  );
};

export default ClientPropertiesList;
