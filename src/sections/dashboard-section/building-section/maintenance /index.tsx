"use client";

import React, { useState } from "react";
import styles from "./styles.module.css";
import SearchBar from "@/components/ui/searchbar";
import Button from "@/components/ui/button";

const tabItems = [
  { label: "Object View", value: "objectView" },
  { label: "Maintenance Plan", value: "maintenancePlan" },
];

const Maintenance = () => {
  const [activeTab, setActiveTab] = useState<string>("objectView");
  const [searchValue, setSearchValue] = useState<string>("");
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // Handle tab change logic here
  };

  const renderTabContent = () => {
    return (
      <div className={styles.building_maintenance_top_section_left}>
        {tabItems.map((item) => (
          <div
            key={item.value}
            onClick={() => handleTabChange(item.value)}
            className={`${styles.building_maintenance_top_section_left_item} ${
              activeTab === item.value
                ? styles.building_maintenance_top_section_left_item_active
                : ""
            }`}
          >
            <p
              className={`${
                styles.building_maintenance_top_section_left_item_text
              } ${
                activeTab === item.value
                  ? styles.building_maintenance_top_section_left_item_text_active
                  : ""
              }`}
            >
              {item.label}
            </p>
          </div>
        ))}
      </div>
    );
  };

  const renderRightSection = () => {
    return (
      <div className={styles.building_maintenance_top_section_right}>
        <SearchBar
          placeholder="Search  by object , Reuit id...."
          value={searchValue}
          onChange={(e) => setSearchValue(e)}
          className={styles.building_maintenance_top_section_right_search}
        />
        <Button
          title="Select All"
          onClick={() => {}}
          variant="outline"
          size="sm"
          className={styles.building_maintenance_top_section_right_select_all}
        />
        <Button
          title="Update Last Date "
          onClick={() => {}}
          variant="primary"
          size="sm"
        />
      </div>
    );
  };
  const renderObjectView = () => {
    return <div>Object View</div>;
  };
  const renderMaintenancePlan = () => {
    return (
      <div className={styles.building_maintenance_plan_container}>
        {/* <div className={styles.dashboard_clients_middle_container}>
          {clientsStaticCardTitle.map((card, index) => (
            <MetricCard
              key={index}
              title={card.title}
              value={card.value}
              className={styles.dashboard_clients_static_card}
              titleStyle={styles.dashboard_clients_static_card_title}
            />
          ))}
        </div> */}
      </div>
    );
  };
  return (
    <section className={styles.building_maintenance_container}>
      <div className={styles.building_maintenance_top_section}>
        {renderTabContent()}
        {renderRightSection()}
      </div>
      {activeTab === "objectView" && renderObjectView()}
      {activeTab === "maintenancePlan" && renderMaintenancePlan()}
    </section>
  );
};

export default Maintenance;
