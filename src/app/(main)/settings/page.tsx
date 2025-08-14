"use client";

import Button from "@/components/ui/button";
import { UserProfile } from "@/components/user-profile/user-profile";
import PropertiesFilter from "@/sections/properties-section/properties-filter";
import BuildingFilter from "@/sections/building-section/buidings-filter";
import { useState } from "react";
import Modal from "@/components/ui/modal";
import styles from "./styles.module.css";

export default function Settings() {
  const [showPropertiesFilter, setShowPropertiesFilter] = useState(false);
  const [showBuildingFilter, setShowBuildingFilter] = useState(false);
  return (
    <>
      <UserProfile />
      <Button
        title="properties filter"
        onClick={() => {
          setShowPropertiesFilter(true);
        }}
      />

      {showPropertiesFilter && (
        <Modal
          show={showPropertiesFilter}
          onClose={() => {
            setShowPropertiesFilter(false);
          }}
          closeOnOutSideClick={true}
          container_style={styles.properties_filter_modal_container_style}
          overlay_style={styles.properties_filter_modal_overlay_style}
        >
          <PropertiesFilter
            onClose={() => setShowPropertiesFilter(false)}
            onApplyFilters={() => {}}
          />
        </Modal>
      )}
      <Button
        title="building filter"
        onClick={() => {
          setShowBuildingFilter(true);
        }}
      />
      {showBuildingFilter && (
        <Modal
          show={showBuildingFilter}
          onClose={() => {
            setShowBuildingFilter(false);
          }}
          closeOnOutSideClick={true}
          container_style={styles.properties_filter_modal_container_style}
          overlay_style={styles.properties_filter_modal_overlay_style}
        >
          <BuildingFilter
            onClose={() => setShowBuildingFilter(false)}
              onApplyFilters={() => {}}
          />
        </Modal>
      )}
    </>
  );
}

  {/* <Modal
        show={showClientsFilter}
        onClose={() => setShowClientsFilter(false)}
        closeOnOutSideClick={true}
        container_style={styles.clients_filter_modal_container_style}
        overlay_style={styles.clients_filter_modal_overlay_style}
      >
        <ClientsFilter
          onClose={() => setShowClientsFilter(false)}
          onApplyFilters={(data: any) => {
            console.log("data", data);
          }}
        />
      </Modal> */}