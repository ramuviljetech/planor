"use client";

import Button from "@/components/ui/button";
import { UserProfile } from "@/components/user-profile/user-profile";
import PropertiesFilter from "@/sections/properties-section/properties-filter";
import BuildingFilter from "@/sections/building-section/buidings-filter";
import { useState } from "react";

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
        <PropertiesFilter
          onClose={() => {
            setShowPropertiesFilter(false);
          }}
          onApplyFilters={() => {}}
        />
      )}
      <Button
        title="building filter"
        onClick={() => {
          setShowBuildingFilter(true);
        }}
      />
      {showBuildingFilter && (
        <BuildingFilter
          onClose={() => {
            setShowBuildingFilter(false);
          }}
          onApplyFilters={() => {}}
        />
      )}
    </>
  );
}
