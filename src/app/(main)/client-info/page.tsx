"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/ui/breadcrumb";
import Button from "@/components/ui/button";
import { useRouter } from "next/navigation";
import CustomTabs, { TabItem } from "@/components/ui/tabs";
import Info from "@/components/ui/info";
import {
  buildingMaintenancePlanRowsData,
  clientInfoItems,
  clientInfoUsersRowsData,
} from "@/app/constants";
import CommonTableWithPopover, {
  PopoverAction,
} from "@/components/ui/common-table-with-popover";
import CommonTable, {
  TableColumn,
  TableRow,
} from "@/components/ui/common-table";
import Capsule from "@/components/ui/capsule";
import SearchBar from "@/components/ui/searchbar";
import Avatar from "@/components/ui/avatar";
import { downloadIcon, filterIcon } from "@/resources/images";
import ClientPropertiesList from "@/sections/clients-section/client-properties-list";
import MetricCard from "@/components/ui/metric-card";
import styles from "./styles.module.css";
import AddPropertyModal from "@/components/add-property-modal";

const ClientInfo: React.FC = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [activePropertiesTab, setActivePropertiesTab] =
    useState<string>("propertyList");
  const [searchValue, setSearchValue] = useState<string>("");
  const [isSelectAll, setIsSelectAll] = useState<boolean>(false);
  const [showAddPropertyModal, setShowAddPropertyModal] =
    useState<boolean>(false);
  const tabs: TabItem[] = [
    { label: "Over View", value: "overview" },
    { label: "Properties", value: "properties" },
  ];

  const maintenancePlanCardTitle = [
    { title: "Total Objects", value: "900" },
    { title: "Total Maintenance for 1 Year", value: "680" },
    { title: "Total Maintenance for 5 Year", value: "320" },
    { title: "Total Maintenance for 10 Year", value: "100" },
  ];

  const tabItems = [
    { label: "Property List", value: "propertyList" },
    { label: "Maintenance Plan", value: "maintenancePlan" },
  ];

  const [selectedRowId, setSelectedRowId] = useState<string | number>("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Table data and handlers
  const columns: TableColumn[] = [
    {
      key: "userName",
      title: "User Name",
      width: "calc(100% / 3)",
    },
    {
      key: "phoneNumber",
      title: "Phone Number",
      width: "calc(100% / 4)",
    },
    {
      key: "email",
      title: "Email",
      width: "calc(100% / 3)",
    },
  ];

  // Table data and handlers
  const maintenancePlanColumns: TableColumn[] = [
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

  const totalItems = clientInfoUsersRowsData?.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Get current page data
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRows =
    clientInfoUsersRowsData?.slice(startIndex, endIndex) || [];

  const maintenancePlanTotalItems = buildingMaintenancePlanRowsData?.length;
  const maintenancePlanTotalPages = Math.ceil(
    maintenancePlanTotalItems / itemsPerPage
  );

  // Get current page data
  const maintenancePlanStartIndex = (currentPage - 1) * itemsPerPage;
  const maintenancePlanEndIndex = maintenancePlanStartIndex + itemsPerPage;
  const maintenancePlanCurrentRows =
    buildingMaintenancePlanRowsData?.slice(startIndex, endIndex) || [];

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
    setSelectedRowId(row.id);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setSelectedRowId("");
  };

  const handleMaintenancePlanPageChange = (page: number) => {
    setCurrentPage(page);
    setSelectedRowId("");
  };

  // Action handlers
  const handleEditUser = (rowId: string | number) => {
    console.log("Edit User clicked for row:", rowId);
    // Add your edit user logic here
  };

  const handleDeleteUser = (rowId: string | number) => {
    console.log("Delete User clicked for row:", rowId);
    // Add your delete user logic here
  };

  // Define actions for the popover
  const actions: PopoverAction[] = [
    {
      label: "Edit User",
      onClick: handleEditUser,
    },
    {
      label: "Delete User",
      onClick: handleDeleteUser,
    },
  ];

  const renderHeaderSection = () => {
    return (
      <div className={styles.client_info_header_section}>
        <Breadcrumb
          items={[
            {
              label: "Brunnfast AB",
              isActive: true,
            },
          ]}
          showBackArrow={true}
          onBackClick={() => {
            router.back();
          }}
        />
        <Button
          title="Add Property"
          variant="primary"
          size="sm"
          onClick={() => {
            setShowAddPropertyModal(true);
          }}
        />
      </div>
    );
  };

  const renderOverviewSection = () => {
    return (
      <div className={styles.client_info_overview_section}>
        <div className={styles.client_info_overview_sub_section}>
          <p className={styles.client_info_overview_info_title}>Client Info</p>
          {/* Client Info */}
          <div className={styles.client_info_overview_info_container}>
            {clientInfoItems.map((item, index) => (
              <Info
                key={index}
                title={item.label}
                value={item.value}
                className={styles.client_info_overview_info_item}
              />
            ))}
          </div>
          {/* Users List */}
          <div className={styles.client_info_overview_sub_section}>
            <div className={styles.client_info_overview_users_list_container}>
              <p className={styles.client_info_overview_info_title}>
                Users List
              </p>
              <Button title="Add New User" variant="plain" size="sm" />
            </div>
            {/* Users List table */}
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
              actionIconClassName={styles.client_info_overview_action_icon}
              popoverMenuClassName={styles.action_popoverMenu}
              popoverMenuItemClassName={styles.action_popoverMenuItem}
            />
          </div>
        </div>
      </div>
    );
  };

  const renderPropertiesSection = () => {
    return (
      <div className={styles.client_info_properties_section}>
        <div className={styles.client_info_properties_section_header}>
          <Capsule
            items={tabItems}
            activeValue={activePropertiesTab}
            onItemClick={setActivePropertiesTab}
            className={styles.client_info_properties_section_header_tabs}
          />
          <div className={styles.client_info_properties_section_header_right}>
            <SearchBar
              placeholder="Search  by object , Reuit id...."
              value={searchValue}
              onChange={(e: string) => setSearchValue(e)}
              className={styles.client_info_properties_section_header_search}
            />
            <Avatar
              image={filterIcon}
              alt="filter"
              className={
                styles.client_info_properties_section_header_filter_icon
              }
            />
          </div>
        </div>
        {/* property list tabs data */}
        <div className={styles.client_info_properties_section_tabs_data}>
          {activePropertiesTab === "propertyList" && (
            <ClientPropertiesList showPropertyListSection={false} />
          )}
          {activePropertiesTab === "maintenancePlan" && (
            <div
              className={
                styles.client_info_properties_section_maintenance_plan_container
              }
            >
              <div
                className={
                  styles.client_info_properties_section_maintenance_plan_card_container
                }
              >
                {maintenancePlanCardTitle.map((card, index) => (
                  <MetricCard
                    key={index}
                    title={card.title}
                    value={Number(card.value)}
                    className={
                      styles.client_info_properties_section_maintenance_plan_card
                    }
                    titleStyle={
                      styles.client_info_properties_section_maintenance_plan_card_title
                    }
                    showK={true}
                  />
                ))}
              </div>
              <CommonTable
                columns={maintenancePlanColumns}
                rows={maintenancePlanCurrentRows}
                selectedRowId={selectedRowId}
                disabled={false}
                pagination={{
                  currentPage,
                  totalPages: maintenancePlanTotalPages,
                  totalItems: maintenancePlanTotalItems,
                  itemsPerPage,
                  onPageChange: handleMaintenancePlanPageChange,
                  showItemCount: true,
                }}
              />
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderInfoSection = () => {
    return (
      <div className={styles.client_info_section}>
        <CustomTabs
          tabs={tabs}
          onTabChange={setActiveTab}
          defaultTab={activeTab}
        />
        <div className={styles.client_info_section_content}>
          {activeTab === "overview" && renderOverviewSection()}
          {activeTab === "properties" && renderPropertiesSection()}
        </div>
      </div>
    );
  };
  return (
    <div className={styles.client_info_container}>
      {renderHeaderSection()}
      {renderInfoSection()}
      <AddPropertyModal
        show={showAddPropertyModal}
        onClose={() => setShowAddPropertyModal(false)}
      />
    </div>
  );
};

export default ClientInfo;
