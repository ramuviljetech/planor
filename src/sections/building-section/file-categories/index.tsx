import React, { useState } from "react";
import Input from "@/components/ui/input";
import {
  downloadBlackIcon,
  filterIcon,
  folderIcon,
  gridGrayIcon,
  gridPinkIcon,
  listGrayIcon,
  listPinkIcon,
  pdfIcon,
  recentUploadedFileDummyImg2,
  searchIcon,
  threeDotsIcon,
} from "@/resources/images";
import Button from "@/components/ui/button";
import CommonTable from "@/components/ui/common-table";
import CustomCheckbox from "@/components/ui/checkbox";
import styles from "./styles.module.css";

const FileCategories = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [layoutType, setLayoutType] = useState("grid");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const fileTabsData = [
    { label: "All", value: "all" },
    { label: "Recently Added", value: "recently_added" },
    { label: "By Folders", value: "by_folders" },
    { label: "By Files", value: "by_files" },
  ];

  const allRows = Array(20)
    .fill(null)
    .map((_, index) => ({
      id: index,
      filename: `blockc-${index + 1}.Pdf`,
      uploadedBy: "Kvarter Skatan",
      uploadDate: "12 Jun, 2025",
      size: "3 MB",
    }));

  const paginatedRows = allRows.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleToggleCheckbox = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((val) => val !== id) : [...prev, id]
    );
  };

  const handleToggleAll = () => {
    if (selectAll) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedRows.map((r) => r.id));
    }
    setSelectAll(!selectAll);
  };

  const renderRecentVisitedFilesTable = () => {
    const columns = [
      {
        key: "checkbox",
        title: (
          <CustomCheckbox
            checked={selectAll}
            onChange={handleToggleAll}
            label=""
          />
        ),
        render: (_value: any, row: any) => (
          <CustomCheckbox
            checked={selectedIds.includes(row.id)}
            onChange={() => handleToggleCheckbox(row.id)}
            label=""
          />
        ),
        width: 48,
      },
      { key: "filename", title: "Filename" },
      { key: "uploadedBy", title: "Uploaded By" },
      { key: "uploadDate", title: "Uploaded Date" },
      { key: "size", title: "Size" },
      {
        key: "actions",
        render: () => (
          <div className={styles.files_tableActions}>
            <img
              src={downloadBlackIcon.src}
              alt="download"
              width={16}
              height={16}
            />
            <img src={threeDotsIcon.src} alt="more" width={16} height={16} />
          </div>
        ),
      },
    ];

    return (
      <div style={{ marginTop: "16px" }}>
        <CommonTable
          columns={columns}
          rows={paginatedRows}
          pagination={{
            currentPage,
            totalPages: Math.ceil(allRows.length / itemsPerPage),
            totalItems: allRows.length,
            itemsPerPage,
            onPageChange: (page) => setCurrentPage(page),
          }}
        />
      </div>
    );
  };

  const renderLeftSection = () => (
    <div className={styles.file_categories_left_section}>
      <p className={styles.file_categories_left_section_header}>
        File Categories
      </p>
      <div className={styles.file_categories_left_section_content}>
        {fileTabsData.map((tab) => (
          <p
            className={
              activeTab === tab.value
                ? styles.active_tab
                : styles.file_categories_tabs
            }
            onClick={() => setActiveTab(tab.value)}
            key={tab.value}
          >
            {tab.label}
          </p>
        ))}
      </div>
    </div>
  );

  const renderRightSection = () => (
    <div className={styles.file_categories_right_section}>
      <Input
        label=""
        placeholder="Search"
        leftIcon={searchIcon}
        leftIconStyle={styles.input_search_icon}
        inputStyle={styles.search_input}
        inputWrapperClass={styles.search_input_wrapper}
        inputContainerClass={styles.search_input_container}
      />
      <div className={styles.file_rightActions}>
        <div className={styles.file_switchLayout}>
          {switchLayout.map((layout, index) => {
            const isActive = layoutType === layout.title;
            return (
              <div
                key={index}
                className={`${styles.file_switchLayoutItem} ${
                  isActive ? styles.activeLayout : ""
                }`}
                onClick={() => setLayoutType(layout.title)}
              >
                <img
                  src={isActive ? layout.iconPink.src : layout.iconGray.src}
                  alt={layout.title}
                  className={styles.file_switchIcon}
                />
              </div>
            );
          })}
        </div>

        <div className={styles.file_filterIcon}>
          <img
            src={filterIcon.src}
            alt="filterIcon"
            className={styles.file_filterIconImg}
          />
        </div>
        <Button title="Add Folder" />
      </div>
    </div>
  );

  const switchLayout = [
    {
      title: "list",
      iconGray: listGrayIcon,
      iconPink: listPinkIcon,
    },
    {
      title: "grid",
      iconGray: gridGrayIcon,
      iconPink: gridPinkIcon,
    },
  ];

  const renderRecentFolders = () => (
    <div className={styles.file_recentFolderBox}>
      <div className={styles.file_recentFolderHeader}>
        <h5 className={styles.file_recentFolderHeading}>Recent Folders</h5>
        <p className={styles.file_viewAllText}>View all</p>
      </div>
      <div className={styles.file_recentFolders}>
        {Array(4)
          .fill(null)
          .map((_, index) => (
            <div key={index} className={styles.file_folderBox}>
              <div className={styles.file_folderBoxIconAndInfo}>
                <div className={styles.file_folderIcon}>
                  <img
                    src={folderIcon.src}
                    alt="folderIcon"
                    className={styles.file_folderIconImg}
                  />
                </div>
                <label className={styles.file_folderLabelText}>
                  blockc-1.Pdf
                </label>
              </div>
              <div className={styles.file_verticalMenuIcon}>
                <img
                  src={threeDotsIcon.src}
                  alt="threeDotsIcon"
                  className={styles.file_folderIconImg}
                />
              </div>
            </div>
          ))}
      </div>
    </div>
  );

  const renderRecentVisitedFiles = () => (
    <div className={styles.file_recentVisitedFileSection}>
      <div className={styles.file_recentVisitedFileHeader}>
        <h5 className={styles.file_recentVisitedFilesText}>
          Recent Visited Files
        </h5>
        <p className={styles.file_viewAllText}>View all</p>
      </div>

      <div className={styles.file_recentVisitedFilesGrid}>
        {Array(8)
          .fill(null)
          .map((_, index) => (
            <div key={index} className={styles.file_recentVisitedFileCard}>
              <div className={styles.file_recentVisitedFileCardHeader}>
                <div className={styles.file_recentVisitedFileInfo}>
                  <div className={styles.file_recentVisitedFileIcon}>
                    <img
                      src={pdfIcon.src}
                      alt="pdfIcon"
                      className={styles.file_recentVisitedFileImg}
                    />
                  </div>
                  <label className={styles.recentVisitedFileLabelText}>
                    blockc-1.Pdf
                  </label>
                </div>
                <div className={styles.file_verticalMenuIcon}>
                  <img
                    src={threeDotsIcon.src}
                    alt="threeDotsIcon"
                    className={styles.file_folderIconImg}
                  />
                </div>
              </div>

              <div className={styles.file_recentVisitedFilePreview}>
                <img
                  src={recentUploadedFileDummyImg2.src}
                  alt="recentUploadedImg"
                />
              </div>
            </div>
          ))}
      </div>
    </div>
  );

  return (
    <div className={styles.file_categories_container}>
      {renderLeftSection()}
      <div className={styles.file_rightSection}>
        {renderRightSection()}
        {renderRecentFolders()}
        {layoutType === "grid"
          ? renderRecentVisitedFiles()
          : renderRecentVisitedFilesTable()}
      </div>
    </div>
  );
};

export default FileCategories;
