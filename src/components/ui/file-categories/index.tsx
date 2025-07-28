import React, { useState } from "react";
import styles from "./styles.module.css";
import Input from "../input";
import { searchIcon } from "@/resources/images";

const FileCategories = () => {
  const [activeTab, setActiveTab] = useState("all");

  const fileTabsData = [
    {
      label: "All",
      value: "all",
    },
    {
      label: "Recently Added",
      value: "recently_added",
    },
    {
      label: "By Folders",
      value: "by_folders",
    },
    {
      label: "By Files",
      value: "by_files",
    },
  ];

  const renderLeftSection = () => {
    return (
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
  };

  const renderRightSection = () => {
    return (
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
      </div>
    );
  };

  return (
    <div className={styles.file_categories_container}>
      {renderLeftSection()}
      {renderRightSection()}
    </div>
  );
};

export default FileCategories;
