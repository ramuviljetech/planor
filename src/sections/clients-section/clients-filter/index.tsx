"use client";

import React, { useState } from "react";
import { closeRoseIcon } from "@/resources/images";
import Avatar from "@/components/ui/avatar";
import Button from "@/components/ui/button";
import Slider from "@mui/material/Slider";
import Input from "@/components/ui/input";
import styles from "./styles.module.css";
import SelectDropDown from "@/components/ui/select-dropdown";

interface ClientsFilterProps {
  onClose: () => void;
  onApplyFilters: (data: any) => void;
}

const ClientsFilter = ({ onClose, onApplyFilters }: ClientsFilterProps) => {
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [properties, setProperties] = useState<number | null>(null);
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);
  const [selectedCreatedOn, setSelectedCreatedOn] = useState<{
    from: string;
    to: string;
  } | null>(null);

  // const [selectedByLocation, setSelectedByLocation] = useState<string[]>([]);
  const renderHeader = () => {
    return (
      <section className={styles.clients_filter_header}>
        <p className={styles.clients_filter_header_title}>Filters</p>
        <Avatar
          image={closeRoseIcon}
          size="md"
          onClick={() => {
            onClose();
          }}
          className={styles.clients_filter_header_close_icon}
        />
      </section>
    );
  };
  const getDateRange = (option: string) => {
    const today = new Date();
    const pastDate = new Date(today);

    switch (option) {
      case "Today":
        return { from: formatDate(today), to: formatDate(today) };
      case "This Week":
        pastDate.setDate(today.getDate() - 7);
        return { from: formatDate(today), to: formatDate(pastDate) };
      case "This Month":
        pastDate.setMonth(today.getMonth() - 1);
        return { from: formatDate(today), to: formatDate(pastDate) };
      case "This Year":
        pastDate.setFullYear(today.getFullYear() - 1);
        return { from: formatDate(today), to: formatDate(pastDate) };
      default:
        return null;
    }
  };

  const formatDate = (date: Date) => {
    return date.toISOString().split("T")[0]; // YYYY-MM-DD
  };

  const renderStatusSection = () => {
    return (
      <section className={styles.clients_filter_status_section}>
        <p className={styles.clients_filter_status_section_title}>Status</p>
        <div className={styles.clients_filter_status_section_buttons}>
          {["Active", "Inactive"].map((item, index) => (
            <Button
              key={index}
              title={item}
              variant={selectedStatus === item ? "primary" : "ghost"}
              className={styles.clients_filter_status_section_button}
              onClick={() => {
                setSelectedStatus(selectedStatus === item ? "" : item);
              }}
              iconContainerClass={
                styles.clients_filter_status_section_button_icon_container
              }
            />
          ))}
        </div>
      </section>
    );
  };

  const renderPropertiesSection = () => {
    return (
      <section className={styles.clients_filter_properties_section}>
        <p className={styles.clients_filter_status_section_title}>Properties</p>
        <div className={styles.slider_container}>
          <Slider
            getAriaLabel={() => "Properties range"}
            value={properties || 0}
            onChange={(event, newValue) => {
              setProperties(newValue as number);
            }}
            valueLabelDisplay="auto"
            getAriaValueText={(value) => `${value}`}
            min={0}
            max={100}
            disabled={isCustomMode}
            sx={{
              width: "100%",
              "& .MuiSlider-track": {
                backgroundColor: isCustomMode ? "#9CA3AF" : "var(--rose-red)",
                border: "none",
                height: 3,
              },
              "& .MuiSlider-rail": {
                backgroundColor: "var(--gray)",
                height: 3,
              },
              "& .MuiSlider-thumb": {
                backgroundColor: isCustomMode ? "#9CA3AF" : "var(--rose-red)",
                width: 16,
                height: 16,
                "&:hover, &.Mui-focusVisible": {
                  boxShadow: isCustomMode
                    ? "none"
                    : "0 0 0 8px var(--rose-tint)",
                },
              },
              "& .MuiSlider-valueLabel": {
                backgroundColor: isCustomMode
                  ? "var(--gray)"
                  : "var(--rose-red)",
                borderRadius: "10px",
                color: "white",
              },
            }}
          />
          <div className={styles.slider_values_container}>
            <p className={styles.slider_min_value}>{properties}</p>
            {/* <p className={styles.slider_max_value}>{propertiesRange}</p> */}
          </div>
        </div>

        {/* Custom mode */}
        <div className={styles.clients_filter_properties_custom_section}>
          <Button
            title={isCustomMode ? "Remove Custom Number" : "Set Custom Number"}
            variant="ghost"
            className={styles.clients_filter_status_section_button}
            onClick={() => {
              setIsCustomMode(!isCustomMode);
            }}
            iconContainerClass={
              styles.clients_filter_properties_custom_section_button_icon_container
            }
          />
          {isCustomMode && (
            <div
              className={
                styles.clients_filter_properties_custom_section_input_container
              }
            >
              <Input
                label="Upto*"
                placeholder="Enter the number"
                value={properties === null ? "" : properties.toString()}
                type="number"
                onChange={(e) => {
                  const raw = e.target.value;
                  const value = Number(raw);

                  if (raw === "") {
                    setProperties(null); // keep it empty so placeholder shows
                    return;
                  }

                  if (/^\d{0,3}$/.test(raw) && value >= 0 && value <= 100) {
                    setProperties(value);
                  }
                }}
              />
            </div>
          )}
        </div>
      </section>
    );
  };

  const renderCreatedOnSection = () => {
    return (
      <section className={styles.clients_filter_created_on_section}>
        <p className={styles.clients_filter_status_section_title}>Created On</p>
        <div className={styles.clients_filter_created_on_section_buttons}>
          {["Today", "This Week", "This Month", "This Year"].map(
            (item, index) => (
              <Button
                key={index}
                title={item}
                variant={
                  selectedCreatedOn &&
                  JSON.stringify(selectedCreatedOn) ===
                    JSON.stringify(getDateRange(item))
                    ? "primary"
                    : "ghost"
                }
                className={styles.clients_filter_status_section_button}
                onClick={() => {
                  const range = getDateRange(item);
                  if (range) {
                    setSelectedCreatedOn(range);
                  }
                }}
              />
            )
          )}
        </div>
      </section>
    );
  };
  const renderButtonSection = () => {
    return (
      <section className={styles.clients_filter_button_section}>
        <Button
          title="Cancel"
          variant="plain"
          onClick={() => {
            setSelectedStatus("");
            setProperties(0);
            setIsCustomMode(false);
            setSelectedCreatedOn(null);
            // setSelectedByLocation([]);
          }}
          className={styles.clients_filter_button_section_cancel_button}
        />
        <Button
          title="Save and Continue"
          variant="primary"
          onClick={() => {
            onApplyFilters({
              status:
                selectedStatus === "Active"
                  ? "active"
                  : selectedStatus === "Inactive"
                  ? "deactive"
                  : "",
              properties: properties ?? 0,
              createdOn: selectedCreatedOn,
              // byLocation: selectedByLocation,
            });

            onClose();
          }}
          className={styles.clients_filter_button_section_save_button}
        />
      </section>
    );
  };
  return (
    <section className={styles.clients_filter_container}>
      {renderHeader()}
      <section className={styles.clients_filter_sub_container}>
        {renderStatusSection()}
        {renderPropertiesSection()}
        {renderCreatedOnSection()}
        {/* {renderByLocationSection()} */}
        {renderButtonSection()}
      </section>
    </section>
  );
};

export default ClientsFilter;
