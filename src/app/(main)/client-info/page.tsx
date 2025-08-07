"use client";

import React, { useRef, useState, useEffect } from "react";
import Breadcrumb from "@/components/ui/breadcrumb";
import Button from "@/components/ui/button";
import { useRouter } from "next/navigation";
import CustomTabs, { TabItem } from "@/components/ui/tabs";
import Info from "@/components/ui/info";
import { clientInfoItems, clientInfoUsersRowsData } from "@/app/constants";
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
import { filterIcon } from "@/resources/images";
import ClientPropertiesList from "@/sections/clients-section/client-properties-list";
import styles from "./styles.module.css";
import AddPropertyModal from "@/components/add-property-modal";
import MaintenancePlan from "@/components/maintenance-plan";
import AddUserModal from "@/components/add-user-modal";

interface UserData {
  id: string | number;
  userName: string;
  phoneNumber: string;
  email: string;
}

const ClientInfo: React.FC = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [activePropertiesTab, setActivePropertiesTab] =
    useState<string>("propertyList");
  const [searchValue, setSearchValue] = useState<string>("");
  const [isSelectAll, setIsSelectAll] = useState<boolean>(false);
  const [showAddUserModal, setShowAddUserModal] = useState<boolean>(false);
  const [showAddPropertyModal, setShowAddPropertyModal] =
    useState<boolean>(false);
  
  // Edit mode state
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [selectedUserData, setSelectedUserData] = useState<UserData | null>(null);
  
  // Table data state - initialize with static data
  const [tableData, setTableData] = useState<any[]>([]);
  
  const tabs: TabItem[] = [
    { label: "Over View", value: "overview" },
    { label: "Properties", value: "properties" },
  ];

  const tabItems = [
    { label: "Property List", value: "propertyList" },
    { label: "Maintenance Plan", value: "maintenancePlan" },
  ];

  const [selectedRowId, setSelectedRowId] = useState<string | number>("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Initialize table data on component mount
  useEffect(() => {
    setTableData([...clientInfoUsersRowsData]);
  }, []);

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

  const totalItems = tableData?.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Get current page data
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRows = tableData?.slice(startIndex, endIndex) || [];

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

  // Handle opening modal for add user
  const handleAddUser = () => {
    setIsEditMode(false);
    setSelectedUserData(null);
    setShowAddUserModal(true);
  };

  // Handle opening modal for edit user
  const handleEditUser = (rowId: string | number) => {
    console.log("Edit User clicked for row:", rowId);
    
    // Find the user data from the current rows
    const userToEdit = currentRows.find((row: any) => row.id === rowId);
    
    if (userToEdit) {
      // Transform the data to match the modal's expected format
      const userData: UserData = {
        id: userToEdit.id,
        userName: userToEdit.userName,
        phoneNumber: userToEdit.phoneNumber,
        email: userToEdit.email,
      };
      
      setSelectedUserData(userData);
      setIsEditMode(true);
      setShowAddUserModal(true);
    }
  };

  // Handle saving user data (both add and edit)
  const handleSaveUser = (userData: any) => {
    console.log("Saving user data:", userData);
    
    if (isEditMode) {
      // Handle edit logic here
      console.log("Updating user:", userData);
      
      // Update the table data
      setTableData(prevData => 
        prevData.map(user => 
          user.id === userData.id 
            ? {
                ...user,
                userName: userData.name,
                phoneNumber: userData.contact,
                email: userData.email
              }
            : user
        )
      );
    } else {
      // Handle add logic here
      console.log("Adding new user:", userData);
      
      // Add new user to table data
      const newUser = {
        id: Date.now(),
        userName: userData.name,
        phoneNumber: userData.contact,
        email: userData.email
      };
      
      setTableData(prevData => [...prevData, newUser]);
    }
    
    // Reset modal state
    setIsEditMode(false);
    setSelectedUserData(null);
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
              <Button title="Add New User" variant="plain" size="sm" onClick={handleAddUser} />
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
          {activePropertiesTab === "maintenancePlan" && <MaintenancePlan />}
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
      <AddUserModal
        show={showAddUserModal}
        onClose={() => {
          setShowAddUserModal(false);
          setIsEditMode(false);
          setSelectedUserData(null);
        }}
        isEditMode={isEditMode}
        userData={selectedUserData ? {
          id: selectedUserData.id,
          name: selectedUserData.userName,
          contact: selectedUserData.phoneNumber,
          email: selectedUserData.email
        } : null}
        onSave={handleSaveUser}
      />
    </div>
  );
};

export default ClientInfo;
