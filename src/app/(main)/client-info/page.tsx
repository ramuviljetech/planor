"use client";

import React, { useRef, useState, useEffect } from "react";
import Breadcrumb from "@/components/ui/breadcrumb";
import Button from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
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
import {
  getClientInfo,
  getUserDetails,
  getMaintancePlan,
  getPropertiesByClientId,
} from "@/networking/client-api-service";
import FallbackScreen from "@/components/ui/fallback-screen";

interface UserData {
  id: string | number;
  userName: string;
  phoneNumber: string;
  email: string;
}

const ClientInfo: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [activePropertiesTab, setActivePropertiesTab] =
    useState<string>("propertyList");
  const [searchValue, setSearchValue] = useState<string>("");
  const [isSelectAll, setIsSelectAll] = useState<boolean>(false);
  const [showAddUserModal, setShowAddUserModal] = useState<boolean>(false);
  const [clientInfo, setClientInfo] = useState<any>(null);
  const [showAddPropertyModal, setShowAddPropertyModal] =
    useState<boolean>(false);
  const [properties, setProperties] = useState<any>(null);
  const [itemsPerPage, setItemsPerPage] = useState<number>(5);
  const [propertiesCurrentPage, setPropertiesCurrentPage] = useState<number>(1);
  const [propertiesItemsPerPage, setPropertiesItemsPerPage] =
    useState<number>(5);

  // Edit mode state
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [selectedUserData, setSelectedUserData] = useState<UserData | null>(
    null
  );

  // Table data state - initialize with static data
  const [clinetUsers, setClinetUsers] = useState<any[]>([]);

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
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);
  const [isPaginationLoading, setIsPaginationLoading] =
    useState<boolean>(false);
  // Fetch client information
  const fetchClientInfo = async (clientId: string) => {
    try {
      const clientResponse = await getClientInfo(clientId);

      if (clientResponse.data) {
        const transformedData = [
          { label: "Name", value: clientResponse.data.clientName || "N/A" },
          {
            label: "Primary Contact Name",
            value: clientResponse.data.primaryContactName || "N/A",
          },
          { label: "Client ID", value: clientResponse.data.id || "N/A" },
          { label: "Role", value: clientResponse.data.role || "N/A" },
          {
            label: "Organization Number",
            value: clientResponse.data.organizationNumber || "N/A",
          },
          {
            label: "Phone",
            value: clientResponse.data.primaryContactPhoneNumber || "N/A",
          },
          {
            label: "Industry Type",
            value: clientResponse.data.industryType || "N/A",
          },
          {
            label: "Email",
            value: clientResponse.data.primaryContactEmail || "N/A",
          },
          {
            label: "Website URL",
            value: clientResponse.data.websiteUrl || "N/A",
          },
          {
            label: "Description",
            value: clientResponse.data.description || "N/A",
          },
        ];
        setClientInfo(transformedData);
      }
    } catch (error) {
      console.error("Error fetching client info:", error);
      setHasError(true);
    }
  };

  // Fetch user details
  const fetchUserDetails = async (clientId: string) => {
    try {
      const userDetails = await getUserDetails(clientId);

      if (userDetails.data) {
        const transformedUserDetails = userDetails.data.map((user: any) => ({
          id: user.id || "N/A",
          userName: user.username || "N/A",
          phoneNumber: user.contact || "N/A",
          email: user.email || "N/A",
        }));
        setClinetUsers(transformedUserDetails);
      } else {
        setClinetUsers([]);
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
      setHasError(true);
    }
  };

  // Fetch properties
  const fetchProperties = async (
    clientId: string,
    page: number = 1,
    limit: number = 10,
    isPaginationRequest: boolean = false
  ) => {
    try {
      // Set pagination loading state if this is a pagination request
      if (isPaginationRequest) {
        setIsPaginationLoading(true);
      }

      const properties = await getPropertiesByClientId(clientId, page, limit);
      if (properties.data) {
        // Ensure pagination data is properly formatted
        if (properties.data.pagination) {
          const paginationData = {
            currentPage: properties.data.pagination.currentPage || page,
            itemsPerPage: properties.data.pagination.itemsPerPage || limit,
            totalItems: properties.data.pagination.totalItems || 0,
            totalPages: properties.data.pagination.totalPages || 1,
            hasNextPage: properties.data.pagination.hasNextPage || false,
            hasPreviousPage:
              properties.data.pagination.hasPreviousPage || false,
          };

          setProperties({
            ...properties.data,
            pagination: paginationData,
          });
        } else {
          // Create fallback pagination data
          const fallbackPagination = {
            currentPage: page,
            itemsPerPage: limit,
            totalItems: properties.data.properties?.length || 0,
            totalPages: Math.ceil(
              (properties.data.properties?.length || 0) / limit
            ),
            hasNextPage: false,
            hasPreviousPage: false,
          };

          setProperties({
            ...properties.data,
            pagination: fallbackPagination,
          });
        }
      } else {
        setProperties(null);
      }
      // Reset pagination loading on successful completion
      setIsPaginationLoading(false);
    } catch (error) {
      console.error("Error fetching properties:", error);
      setHasError(true);
      setProperties(null);
      setIsPaginationLoading(false); // Reset pagination loading on error
    }
  };

  // Fetch maintance plan
  const fetchMaintancePlan = async (clientId: string) => {
    try {
      const maintancePlan = await getMaintancePlan(clientId);
    } catch (error) {
      console.error("Error fetching maintance plan:", error);
      setHasError(true);
    }
  };

  // Main data fetching effect - only for initial load and search params change
  useEffect(() => {
    const clientId = searchParams?.get("id");
    if (!clientId) return;

    setHasError(false);
    setIsLoading(true);
    // Reset pagination state when client changes
    setPropertiesCurrentPage(1);
    setIsPaginationLoading(false);

    const fetchAllData = async () => {
      try {
        await Promise.all([
          fetchClientInfo(clientId),
          fetchUserDetails(clientId),
          fetchProperties(
            clientId,
            1, // Always start with page 1 for initial load
            propertiesItemsPerPage,
            false // Not a pagination request
          ),
          // fetchMaintancePlan(clientId),
        ]);
      } catch (error) {
        console.error("Error fetching data:", error);
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, [searchParams, propertiesItemsPerPage]); // Removed propertiesCurrentPage from dependencies

  // Note: Pagination is now handled directly in handlePropertiesPageChange
  // to ensure proper loading state management

  // Cleanup effect to reset pagination loading state
  useEffect(() => {
    return () => {
      setIsPaginationLoading(false);
    };
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

  const totalItems = clinetUsers?.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Get current page data
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRows = clinetUsers?.slice(startIndex, endIndex) || [];

  const handleRowClick = (row: TableRow, index: number) => {
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
    if (isEditMode) {
      // Handle edit logic here
      console.log("Updating user:", userData);

      // Update the table data
      setClinetUsers((prevData) =>
        prevData.map((user) =>
          user.id === userData.id
            ? {
                ...user,
                userName: userData.name,
                phoneNumber: userData.contact,
                email: userData.email,
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
        email: userData.email,
      };

      setClinetUsers((prevData) => [...prevData, newUser]);
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

  // Handle properties pagination
  const handlePropertiesPageChange = async (page: number) => {
    const clientId = searchParams?.get("id");
    if (!clientId) return;

    setPropertiesCurrentPage(page);
    // Directly fetch properties for pagination to ensure proper loading state management
    await fetchProperties(clientId, page, propertiesItemsPerPage, true);
  };

  const handlePropertiesPaginationStart = () => {
    setIsPaginationLoading(true);
  };

  const handlePropertiesPaginationEnd = () => {
    setIsPaginationLoading(false);
  };

  // Table data and handlers
  const renderHeaderSection = () => {
    return (
      <div className={styles.client_info_header_section}>
        <Breadcrumb
          items={[
            {
              label: clientInfo?.[0]?.value || "N/A",
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
    // Show error state
    if (hasError && (!clientInfo || clientInfo.length === 0)) {
      return (
        <div className={styles.client_info_overview_section}>
          <FallbackScreen
            title="Failed to Load Client Information"
            subtitle="There was an error loading the client data. Please try refreshing the page."
            className={styles.client_info_loading_fallback}
          />
        </div>
      );
    }

    // Show loading state
    if (isLoading) {
      return (
        <div className={styles.client_info_overview_section}>
          <FallbackScreen
            title="Loading Client Information"
            subtitle="Please wait while we fetch the client data..."
            className={styles.client_info_loading_fallback}
          />
        </div>
      );
    }

    return (
      <div className={styles.client_info_overview_section}>
        <div className={styles.client_info_overview_sub_section}>
          <p className={styles.client_info_overview_info_title}>Client Info</p>
          {/* Client Info */}
          <div className={styles.client_info_overview_info_container}>
            {clientInfo &&
              clientInfo.map((item: any, index: number) => (
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
              <Button
                title="Add New User"
                variant="plain"
                size="sm"
                onClick={handleAddUser}
              />
            </div>
            {/* Users List table */}
            {clinetUsers.length === 0 ? (
              <div className={styles.no_users_found_container}>
                <p className={styles.no_users_found_text}>No users found</p>
              </div>
            ) : (
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
                disabled={isLoading}
              />
            )}
          </div>
        </div>
      </div>
    );
  };

  // Extract the properties section header to avoid duplication
  const renderPropertiesHeader = () => (
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
          className={styles.client_info_properties_section_header_filter_icon}
        />
      </div>
    </div>
  );

  const renderPropertiesSection = () => {
    // Show error state for properties section
    if (hasError && !properties) {
      return (
        <div className={styles.client_info_properties_section}>
          {renderPropertiesHeader()}
          <div className={styles.client_info_properties_section_tabs_data}>
            <FallbackScreen
              title="Failed to Load Properties"
              subtitle="There was an error loading the properties data. Please try refreshing the page."
              className={styles.client_info_loading_fallback}
            />
          </div>
        </div>
      );
    }

    // Show loading state for properties section
    if (isLoading) {
      return (
        <div className={styles.client_info_properties_section}>
          {renderPropertiesHeader()}
          {/* Loading overlay for properties */}
          <FallbackScreen
            title="Loading Properties"
            subtitle="Please wait while we fetch the properties data..."
            className={styles.client_info_loading_fallback}
          />
        </div>
      );
    }

    return (
      <div className={styles.client_info_properties_section}>
        {renderPropertiesHeader()}
        {/* property list tabs data */}
        <div className={styles.client_info_properties_section_tabs_data}>
          {activePropertiesTab === "propertyList" && (
            <>
              {isLoading ? (
                <FallbackScreen
                  title="Loading Properties"
                  subtitle="Please wait while we fetch your properties data..."
                  className={styles.properties_loading_fallback}
                />
              ) : hasError ? (
                <FallbackScreen
                  title="Error Loading Properties"
                  subtitle={hasError.toString()}
                  className={styles.properties_loading_fallback}
                />
              ) : (
                <>
                  <ClientPropertiesList
                    showPropertyListSection={false}
                    propertiesData={properties?.properties || []}
                    pagination={properties?.pagination || undefined}
                    statistics={properties?.statistics}
                    onPageChange={handlePropertiesPageChange}
                    currentPage={propertiesCurrentPage}
                    onPaginationStart={handlePropertiesPaginationStart}
                    onPaginationEnd={handlePropertiesPaginationEnd}
                    isPaginationLoading={isPaginationLoading}
                  />
                </>
              )}
              {/* {properties?.properties && properties.properties.length === 0 ? (
                <div className={styles.no_properties_found_container}>
                  <p className={styles.no_properties_found_text}>
                    No properties found for this client
                  </p>
                </div>
              ) : (
                <ClientPropertiesList
                  showPropertyListSection={false}
                  propertiesData={properties?.properties || []}
                  statistics={properties?.statistics}
                  pagination={properties?.pagination}
                  onPageChange={handlePropertiesPageChange}
                  currentPage={propertiesCurrentPage}
                  onPaginationStart={handlePropertiesPaginationStart}
                  onPaginationEnd={handlePropertiesPaginationEnd}
                />
              )} */}
            </>
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
        userData={
          selectedUserData
            ? {
                id: selectedUserData.id,
                name: selectedUserData.userName,
                contact: selectedUserData.phoneNumber,
                email: selectedUserData.email,
              }
            : null
        }
        onSave={handleSaveUser}
      />
    </div>
  );
};

export default ClientInfo;
