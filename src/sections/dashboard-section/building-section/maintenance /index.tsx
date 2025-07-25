"use client";

import React from "react";
import styles from "./styles.module.css";

const Maintenance = () => {
  return (
    <section className={styles.building_maintenance_container}>
      <div className={styles.building_maintenance_top_section}>
        <div className={styles.building_maintenance_top_section_left}>
          <div className={styles.building_maintenance_top_section_left_item}>
            <p
              className={styles.building_maintenance_top_section_left_item_text}
            >
              Object View
            </p>
          </div>
        </div>
        <div className={styles.building_maintenance_top_section_right}></div>
      </div>
    </section>
  );
};

export default Maintenance;
