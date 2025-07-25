"use client";

import React from "react";
import Info from "@/components/ui/info";
import {
  buildingContact,
  buildingInfo,
  buildingPhysicalAttributes,
} from "@/app/constants";
import styles from "./styles.module.css";

const Overview = () => {
  return (
    <section className={styles.building_overview_container}>
      <div className={styles.building_overview_top_section}>
        <p className={styles.building_overview_top_section_title}>
          Building Info
        </p>
        <div className={styles.building_overview_top_section_info}>
          {buildingInfo.map((item, index) => (
            <Info
              key={index}
              title={item.label}
              value={item.value}
              className={styles.building_overview_top_section_info_item}
            />
          ))}
        </div>
      </div>
      <div className={styles.building_overview_bottom_section}>
        <div className={styles.building_overview_top_section}>
          <p className={styles.building_overview_top_section_title}>
            Building Physical Attributes
          </p>
          <div className={styles.building_overview_top_section_info2}>
            {buildingPhysicalAttributes.map((item, index) => (
              <Info
                key={index}
                title={item.label}
                value={item.value}
                className={styles.building_overview_top_section_info_item2}
              />
            ))}
          </div>
        </div>
        <div className={styles.building_overview_top_section}>
          <p className={styles.building_overview_top_section_title}>
            Building contact
          </p>
          <div className={styles.building_overview_top_section_info2}>
            {buildingContact.map((item, index) => (
              <Info
                key={index}
                title={item.label}
                value={item.value}
                className={styles.building_overview_top_section_info_item2}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Overview;
