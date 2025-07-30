"use client";

import Image from "next/image";
import { filterIcon, propertiesBlueIcon } from "@/resources/images";
import { clientDetailsCardsData, propertiesRowsData } from "@/app/constants";
import SectionHeader from "@/components/ui/section-header";
import { useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import CommonTableWithPopover, {
  PopoverAction,
} from "@/components/ui/common-table-with-popover";
import { TableColumn, TableRow } from "@/components/ui/common-table";
import styles from "./styles.module.css";

interface ClientPropertiesListProps {
  showPropertyListSection?: boolean;
}

const ClientPropertiesList: React.FC<ClientPropertiesListProps> = ({
  showPropertyListSection = true,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const clientsFilterRef = useRef<HTMLDivElement>(null);
  const [searchValue, setSearchValue] = useState<string>("");
  const [selectedRowId, setSelectedRowId] = useState<string | number>("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Table data and handlers
  const columns: TableColumn[] = [
    {
      key: "propertyName",
      title: "Property Name",
      width: 200,
    },
    {
      key: "buildings",
      title: "Buildings",
      width: 120,
    },
    {
      key: "code",
      title: "Code",
      width: 100,
    },
    {
      key: "types",
      title: "Types",
      width: 150,
    },
    {
      key: "clientName",
      title: "Client Name",
      width: 150,
    },
  ];

  const totalItems = propertiesRowsData?.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Get current page data
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRows = propertiesRowsData?.slice(startIndex, endIndex) || [];

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
    // setSelectedRowId(row.id);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setSelectedRowId("");
  };

  const handleViewDetails = (rowId: string | number) => {
    router.push("/property-details");
  };

  const handleAddProperty = (rowId: string | number) => {
    console.log("Add Property clicked for row:", rowId);
    // Add your add property logic here
  };

  // Define popover actions
  const actions: PopoverAction[] = [
    {
      label: "View Details",
      onClick: handleViewDetails,
    },
    {
      label: "Add Property",
      onClick: handleAddProperty,
    },
  ];

  const renderCard = () => {
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
          actionButtonTitle="Add  Property"
          onActionButtonClick={() => router.push("/property-details")}
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
    </div>
  );
};

export default ClientPropertiesList;
