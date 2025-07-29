"use client";
import React, { useRef, useState } from "react";
import SectionHeader from "@/components/ui/section-header";
import Button from "@/components/ui/button";
import Image from "next/image";
import {
  backButtonIcon,
  closeRoseIcon,
  filterIcon,
  threeDotsIcon,
} from "@/resources/images";
import Breadcrumb from "@/components/ui/breadcrumb";
import Info from "@/components/ui/info";
import MetricCard from "@/components/ui/metric-card";
import Modal from "@/components/ui/modal";
import CustomTabs from "@/components/ui/tabs";
import FileUpload from "@/components/ui/upload-file";
import styles from "./styles.module.css";
import { useRouter } from "next/navigation";
import CommonTableWithPopover, {
  PopoverAction,
} from "@/components/ui/common-table-with-popover";
import { TableColumn, TableRow } from "@/components/ui/common-table";
import {
  buildingListColumns,
  buildingListRowsData,
  rowsData,
} from "@/app/constants";
import Avatar from "@/components/ui/avatar";

const PropertyDetails: React.FC = () => {
  const router = useRouter();
  const buildingListRef = useRef<HTMLDivElement>(null);
  const [showAddBuildingModal, setShowAddBuildingModal] = useState(false);
  const [activeTab, setActiveTab] = useState("add-revit");
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [revitFiles, setRevitFiles] = useState<any[]>([]);

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
  const itemsPerPage = 10;

  const actions: PopoverAction[] = [
    {
      label: "View Details",
      onClick: (rowId) => {
        console.log("View Details clicked for row:", rowId);
        router.push("/building-details");
      },
    },
    {
      label: "Add Property",
      onClick: (rowId) => {
        console.log("Add Property clicked for row:", rowId);
        // Add your logic here
      },
    },
  ];

  const totalItems = buildingListRowsData?.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Get current page data
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRows = buildingListRowsData?.slice(startIndex, endIndex) || [];

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
    setActiveTab("add-revit");
    setUploadedFiles([]);
    setRevitFiles([]);
  };

  const handleSubmitBuilding = () => {
    if (activeTab === "add-revit" && revitFiles.length > 0) {
      setActiveTab("add-file");
    }
    if (activeTab === "add-file" && uploadedFiles.length > 0) {
      console.log("Uploaded files:", uploadedFiles);
      // Add your API call here to save the building
      handleCloseModal();
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const handleFilesAdded = (files: any[]) => {
    console.log("Files added:", files);
    // Ensure files maintain their progress state
    const filesWithProgress = files.map((file) => ({
      ...file,
      progress: file.progress || 0,
      status: file.status || "uploading",
    }));
    setUploadedFiles((prev) => [...prev, ...filesWithProgress]);
  };

  const handleFileRemoved = (fileId: string) => {
    setUploadedFiles((prev) => prev.filter((file) => file.id !== fileId));
  };

  const handleRevitFilesAdded = (files: any[]) => {
    console.log("Revit files added:", files);
    // Ensure files maintain their progress state
    const filesWithProgress = files.map((file) => ({
      ...file,
      progress: file.progress || 0,
      status: file.status || "uploading",
    }));
    setRevitFiles((prev) => [...prev, ...filesWithProgress]);
    // setActiveTab("add-file");
  };

  const handleRevitFileRemoved = (fileId: string) => {
    setRevitFiles((prev) => prev.filter((file) => file.id !== fileId));
  };

  const renderAddBuildingModal = () => {
    const tabs = [
      { label: "Add Revit", value: "add-revit" },
      { label: "Add File", value: "add-file" },
    ];

    return (
      <Modal
        show={showAddBuildingModal}
        onClose={handleCloseModal}
        closeOnOutSideClick={true}
        container_style={styles.add_building_modal_container}
        overlay_style={styles.add_building_modal_overlay}
      >
        <div className={styles.add_building_modal_content}>
          <div className={styles.add_building_modal_header}>
            <div className={styles.add_building_modal_header_left}>
              <Avatar image={backButtonIcon} size="md" />
              <h2 className={styles.add_building_modal_title}>
                Add New Building
              </h2>
            </div>
            <Avatar
              image={closeRoseIcon}
              size="md"
              onClick={handleCloseModal}
              className={styles.add_building_modal_close_button}
            />
          </div>

          <div className={styles.add_building_modal_tabs}>
            <CustomTabs
              tabs={tabs}
              defaultTab={activeTab}
              onTabChange={handleTabChange}
              customStyles={{
                tabColor: "var(--granite-gray)",
                selectedTabColor: "var(--rose-red)",
                indicatorColor: "var(--rose-red)",
                fontSize: "14px",
                fontFamily: "var(--font-lato-medium)",
              }}
            />
          </div>

          <div className={styles.add_building_modal_body}>
            <div className={styles.add_building_modal_file_upload_section}>
              <FileUpload
                allowedTypes={
                  activeTab === "add-revit"
                    ? [
                        ".rvt",
                        ".rfa",
                        ".rte",
                        ".dwg",
                        ".dxf",
                        "application/pdf",
                      ]
                    : [".ifc", ".rvt", "image/*", "application/pdf"]
                }
                maxSize={50}
                maxFiles={10}
                uploadedFiles={
                  activeTab === "add-revit" ? revitFiles : uploadedFiles || []
                }
                onFilesAdded={
                  activeTab === "add-revit"
                    ? handleRevitFilesAdded
                    : handleFilesAdded
                }
                onFileRemoved={
                  activeTab === "add-revit"
                    ? handleRevitFileRemoved
                    : handleFileRemoved
                }
                onUploadComplete={(fileId) => {
                  if (activeTab === "add-revit") {
                    setRevitFiles((prev) =>
                      prev.map((file) =>
                        file.id === fileId
                          ? { ...file, progress: 100, status: "completed" }
                          : file
                      )
                    );
                  } else {
                    setUploadedFiles((prev) =>
                      prev.map((file) =>
                        file.id === fileId
                          ? { ...file, progress: 100, status: "completed" }
                          : file
                      )
                    );
                  }
                }}
                supportedText={
                  activeTab === "add-revit"
                    ? "Supported files are Revit files (.rvt, .rfa, .rte), CAD files (.dwg, .dxf), and PDFs up to Max 50 MB"
                    : "Supported files are IFC / Images / PDFs up to Max 50 MB"
                }
                className={styles.add_building_modal_file_upload_component}
              />
            </div>
          </div>

          <div className={styles.add_building_modal_footer}>
            <Button
              title="Cancel"
              onClick={handleCloseModal}
              variant="outline"
              className={styles.add_building_modal_cancel_button}
            />
            <Button
              title={activeTab === "add-revit" ? "Save & Continue" : "Submit"}
              onClick={handleSubmitBuilding}
              variant="primary"
              className={styles.add_building_modal_button}
            />
          </div>
        </div>
      </Modal>
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
          />
        </div>
      </div>
    );
  };

  return (
    <div className={styles.property_details_container}>
      {renderTopContainer()}
      {renderBodyContainer()}
      {renderAddBuildingModal()}
    </div>
  );
};

export default PropertyDetails;
