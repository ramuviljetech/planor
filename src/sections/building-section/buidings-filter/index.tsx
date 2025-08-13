"use client";

import React, { useState } from "react";
import { closeRoseIcon } from "@/resources/images";
import Avatar from "@/components/ui/avatar";
import Button from "@/components/ui/button";
import Slider from "@mui/material/Slider";
import Input from "@/components/ui/input";
import styles from "./styles.module.css";

interface BuildingFilterProps {
  onClose: () => void;
  onApplyFilters: (data: any) => void;
}

const BuildingFilter = ({ onClose, onApplyFilters }: BuildingFilterProps) => {
  const [selectedUsage, setSelectedUsage] = useState<string>("");
  const [floors, setFloors] = useState<number | null>(null);
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);
  const [builtPeriod, setBuiltPeriod] = useState<{
    from: string;
    to: string;
  } | null>(null);

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
        <p className={styles.clients_filter_status_section_title}>Usage</p>
        <div className={styles.clients_filter_status_section_buttons}>
          {["Commercial", "Public", "Residential"].map((item, index) => (
            <Button
              key={index}
              title={item}
              variant={selectedUsage === item ? "primary" : "ghost"}
              className={styles.clients_filter_status_section_button}
              onClick={() => {
                setSelectedUsage(selectedUsage === item ? "" : item);
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
        <p className={styles.clients_filter_status_section_title}>Floors</p>
        <div className={styles.slider_container}>
          <Slider
            getAriaLabel={() => "Properties range"}
            value={floors || 0}
            onChange={(event, newValue) => {
              setFloors(newValue as number);
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
            <p className={styles.slider_min_value}>{floors}</p>
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
                value={floors === null ? "" : floors.toString()}
                type="number"
                onChange={(e) => {
                  const raw = e.target.value;
                  const value = Number(raw);

                  if (raw === "") {
                    setFloors(null); // keep it empty so placeholder shows
                    return;
                  }

                  if (/^\d{0,3}$/.test(raw) && value >= 0 && value <= 100) {
                    setFloors(value);
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
        <p className={styles.clients_filter_status_section_title}>
          Built period
        </p>
        <div className={styles.clients_filter_created_on_section_buttons}>
          {["Today", "This Week", "This Month", "This Year"].map(
            (item, index) => (
              <Button
                key={index}
                title={item}
                variant={
                  builtPeriod &&
                  JSON.stringify(builtPeriod) ===
                    JSON.stringify(getDateRange(item))
                    ? "primary"
                    : "ghost"
                }
                className={styles.clients_filter_status_section_button}
                onClick={() => {
                  const range = getDateRange(item);
                  if (range) {
                    setBuiltPeriod(range);
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
            setSelectedUsage("");
            setFloors(0);
            setIsCustomMode(false);
            setBuiltPeriod(null);
          }}
          className={styles.clients_filter_button_section_cancel_button}
        />
        <Button
          title="Save and Continue"
          variant="primary"
          onClick={() => {
            const filterData = {
              usage:
                selectedUsage === "Commercial"
                  ? "commercial"
                  : selectedUsage === "Public"
                  ? "public"
                  : selectedUsage === "Residential"
                  ? "residential"
                  : "",
              floors: floors ?? 0,
              builtPeriod: builtPeriod,
            };

            console.log("Selected Filters:", filterData); // 👈 log the details

            onApplyFilters(filterData);
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
        {renderButtonSection()}
      </section>
    </section>
  );
};

export default BuildingFilter;
