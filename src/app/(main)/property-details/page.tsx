"use client";
import React, { useRef, useState } from "react";
import SectionHeader from "@/components/ui/section-header";
import Button from "@/components/ui/button";
import Image from "next/image";
import {
  backButtonIcon,
  filterIcon,
  rightArrowPinkIcon,
} from "@/resources/images";
import Breadcrumb from "@/components/ui/breadcrumb";
import Info from "@/components/ui/info";
import MetricCard from "@/components/ui/metric-card";
import styles from "./styles.module.css";
import { useRouter } from "next/navigation";
import CommonTable, {
  TableColumn,
  TableRow,
} from "@/components/ui/common-table";
import PopOver from "@/components/ui/popover";
import { rowsData } from "@/app/constants";

const PropertyDetails: React.FC = () => {
  const router = useRouter();
  const buildingListRef = useRef<HTMLDivElement>(null);
  const breadcrumbItems = [
    { label: "Brunnfast AB", isActive: false },
    { label: "Kvarter Skatan", isActive: true },
  ];

  const propertyInfoItems = [
    { label: "Name", value: "Brunnfast AB" },
    { label: "Primary Contact Name", value: "John stwien" },
    { label: "Client ID", value: "98088" },
    { label: "Role", value: "CEO" },
    { label: "Organization Number", value: "Stora Nygatan" },
    { label: "Phone", value: "+ 56 287 342 343" },
    { label: "Industry Type", value: "Akrivia Infratech Solutions" },
    { label: "Email", value: "Akrstwien@gmail.com" },
    { label: "Website Url", value: "Brunnfast AB .In" },
    { label: "Description", value: "A Property Management Organizations" },
  ];

  const propertyStatistics = [
    { label: "Total Buildings", value: 24 },
    { label: "Total Area", value: 25000 },
    { label: "Total Maintenance Cost", value: 849340 },
    { label: "Maintenance Updates", value: 24 },
  ];

  const [selectedRowId, setSelectedRowId] = useState<string | number>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [popoverState, setPopoverState] = useState<{
    show: boolean;
    rowId: string | number | null;
  }>({ show: false, rowId: null });
  const actionIconRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const itemsPerPage = 10;

  // Table data and handlers
  const columns: TableColumn[] = [
    {
      key: "clientName",
      title: "Client Name",
      width: 200,
    },
    {
      key: "clientId",
      title: "Client ID",
      width: 120,
    },
    {
      key: "properties",
      title: "Properties",
      width: 100,
    },
    {
      key: "createdOn",
      title: "Created On",
      width: 150,
    },
    {
      key: "maintenanceCost",
      title: "Maintenance Cost",
      width: 150,
    },
    {
      key: "grossArea",
      title: "Gross Area",
      width: 150,
    },
    {
      key: "actions",
      title: "",
      width: 60,
      render: (value, row, index) => (
        <div
          className={styles.actionIcon}
          ref={(el) => {
            actionIconRefs.current[row.id] = el;
          }}
          onClick={(e) => {
            e.stopPropagation();
            setPopoverState({ show: true, rowId: row.id });
          }}
        >
          <Image
            src={rightArrowPinkIcon}
            alt="menu-dot"
            width={16}
            height={16}
          />
        </div>
      ),
    },
  ];

  const totalItems = rowsData?.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Get current page data
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRows = rowsData?.slice(startIndex, endIndex) || [];

  const handleRowClick = (row: TableRow, index: number) => {
    // Disable row click when popover is active
    if (popoverState.show) {
      return;
    }

    console.log("Row clicked:", {
      id: row.id,
      clientName: row.clientName,
      clientId: row.clientId,
      properties: row.properties,
      createdOn: row.createdOn,
      maintenanceCost: row.maintenanceCost,
      status: row.status,
    });
    setSelectedRowId(row.id);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setSelectedRowId("");
  };

  const handlePopoverClose = () => {
    setPopoverState({ show: false, rowId: null });
  };

  const handleViewDetails = () => {
    router.push("/building-details");
    handlePopoverClose();
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
          onClick={() => router.push("/building-details")}
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
            title="Building List"
            searchValue=""
            searchPlaceholder="Search by building name"
            onSearchChange={() => {}}
            filterComponent={
              <div ref={buildingListRef} onClick={() => {}}>
                <Image src={filterIcon} alt="filter" width={24} height={24} />
              </div>
            }
            titleStyle={styles.property_building_info_title}
          />
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
          <CommonTable
            columns={columns}
            rows={currentRows}
            onRowClick={handleRowClick}
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
          {popoverState.show && popoverState.rowId && (
            <>
              <PopOver
                reference={{
                  current: actionIconRefs.current[popoverState.rowId],
                }}
                show={popoverState.show}
                onClose={handlePopoverClose}
                placement="bottom-end"
                offset={[0, 8]}
              >
                <div className={styles.action_popoverMenu}>
                  <div
                    className={styles.action_popoverMenuItem}
                    onClick={handleViewDetails}
                  >
                    View Details
                  </div>
                  <div
                    className={styles.action_popoverMenuItem}
                    onClick={() => {}}
                  >
                    Add Property
                  </div>
                </div>
              </PopOver>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={styles.property_details_container}>
      {renderTopContainer()}
      {renderBodyContainer()}
    </div>
  );
};

export default PropertyDetails;
