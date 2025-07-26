"use client";

import React, { useRef, useState } from "react";
import styles from "./styles.module.css";
import Breadcrumb from "@/components/ui/breadcrumb";
import { leftArrowBlackIcon } from "@/resources/images";
import Image from "next/image";
import Button from "@/components/ui/button";
import { useRouter } from "next/navigation";
import CustomTabs, { TabItem } from "@/components/ui/tabs";
import Info from "@/components/ui/info";
import { clientInfoItems, clientInfoUsersRowsData } from "@/app/constants";
import { rightArrowPinkIcon } from "@/resources/images";
import CommonTable, {
  TableColumn,
  TableRow,
} from "@/components/ui/common-table";
import PopOver from "@/components/ui/popover";

const ClientInfo: React.FC = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>("overview");
  const tabs: TabItem[] = [
    { label: "Over View", value: "overview" },
    { label: "Properties", value: "properties" },
  ];

  const [selectedRowId, setSelectedRowId] = useState<string | number>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [popoverState, setPopoverState] = useState<{
    show: boolean;
    rowId: string | number | null;
  }>({ show: false, rowId: null });
  const actionIconRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
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
    {
      key: "actions",
      title: "",
      width: "calc(100% / 6)",
      render: (value, row, index) => (
        <div
          className={styles.client_info_overview_action_icon}
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

  const totalItems = clientInfoUsersRowsData?.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Get current page data
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRows =
    clientInfoUsersRowsData?.slice(startIndex, endIndex) || [];

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
    // router.push("/building-details");
    handlePopoverClose();
  };

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
        <Button title="Add Property" variant="primary" size="sm" />
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
              <Button
                title="Add New User"
                variant="outline"
                size="sm"
                className={styles.client_info_overview_add_user_button}
              />
            </div>
            {/* Users List table */}
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
                      Edit User
                    </div>
                    <div
                      className={styles.action_popoverMenuItem}
                      onClick={() => {}}
                    >
                      Delete User
                    </div>
                  </div>
                </PopOver>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderPropertiesSection = () => {
    return <div>Properties</div>;
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
    </div>
  );
};

export default ClientInfo;
