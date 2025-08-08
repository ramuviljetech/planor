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
  const [propertiesRange, setPropertiesRange] = useState<number[]>([0, 100]);
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);
  const [customMinValue, setCustomMinValue] = useState<string>("");
  const [customMaxValue, setCustomMaxValue] = useState<string>("");
  const [selectedCreatedOn, setSelectedCreatedOn] = useState<string>("");
  const [selectedByLocation, setSelectedByLocation] = useState<string[]>([]);
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
  const renderStatusSection = () => {
    return (
      <section className={styles.clients_filter_status_section}>
        <p className={styles.clients_filter_status_section_title}>Status</p>
        <div className={styles.clients_filter_status_section_buttons}>
          {["Active", "Inactive"].map((item,index) => (
            <Button
              key={index}
              title={item}
              variant={selectedStatus === item ? "primary" : "ghost"}
              className={styles.clients_filter_status_section_button}
              onClick={() => {
                setSelectedStatus(item);
              }}
              iconContainerClass={styles.clients_filter_status_section_button_icon_container} 
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
            value={propertiesRange}
            onChange={(event, newValue) => {
              setPropertiesRange(newValue as number[]);
            }}
            // valueLabelDisplay="auto"
            getAriaValueText={(value) => `${value}`}
            disableSwap={true}
            min={0}
            max={100}
            disabled={isCustomMode}
            sx={{
              
              width: "100%",
              "& .MuiSlider-track": {
                backgroundColor: isCustomMode
                  ? "#9CA3AF"
                  : "var(--rose-red)",
                border: "none",
                height: 3,
              },
              "& .MuiSlider-rail": {
                backgroundColor: "var(--gray)",
                height: 3,
              },
              "& .MuiSlider-thumb": {
                backgroundColor: isCustomMode
                  ? "#9CA3AF"
                  : "var(--rose-red)",
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
                color: "white",
              },
            }}
          />
          <div className={styles.slider_values_container}>
            <p className={styles.slider_min_value}>{propertiesRange[0]}</p>
            <p className={styles.slider_max_value}>{propertiesRange[1]}</p>
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
            iconContainerClass={styles.clients_filter_properties_custom_section_button_icon_container}
            
          />
          {isCustomMode && (
            <div
              className={
                styles.clients_filter_properties_custom_section_input_container
              }
            >
              <Input
                label="From*"
                placeholder="Enter a number"
                value={customMinValue}
                type="number"
                onChange={(e) => {
                  const raw = e.target.value;
                  const value = Number(raw);
                  const max = Number(customMaxValue) || 101;
                
                  if (raw === "") {
                    setCustomMinValue("");
                    return;
                  }
                
                  if (/^\d{0,3}$/.test(raw) && value >= 1 && value <= 100) {
                    if (raw.length === 1 || value < max) {
                      setCustomMinValue(raw);
                    }
                  }
                }}
                
               
              />
              <Input
                label="To*"
                placeholder="Enter a number"
                value={customMaxValue}
               type="number"
               onChange={(e) => {
                const raw = e.target.value;
                const value = Number(raw);
                const min = Number(customMinValue) || 0;
              
                if (raw === "") {
                  setCustomMaxValue("");
                  return;
                }
              
                if (/^\d{0,3}$/.test(raw) && value >= 1 && value <= 100) {
                  if (raw.length === 1 || value > min) {
                    setCustomMaxValue(raw);
                  }
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
          {["Today", "This Week", "This Month", "This Year"].map((item,index) => (
            <Button
              key={index}
              title={item}
              variant={selectedCreatedOn === item ? "primary" : "ghost"}
              className={styles.clients_filter_status_section_button}
              onClick={() => {
                setSelectedCreatedOn(item);
              }}
            />
          ))}
        </div>
      </section>
    );
  };

  const renderByLocationSection = () => {
    return (
      <section className={styles.clients_filter_by_location_section}>
        <p className={styles.clients_filter_status_section_title}>
          By Location
        </p>
        <SelectDropDown
          label="Locations*"
          placeholder="Select Locations"
          options={[
            "Hyderabad",
            "Mumbai",
            "Delhi",
            "Chennai",
            "Kolkata",
            "Bengaluru",
            "Pune",
            "Jaipur",
            "Ahmedabad",
            "Surat",
            "Lucknow",
            "Kanpur",
            "Nagpur",
          ]}
          selected={selectedByLocation || []}
          onSelect={(value) =>
            setSelectedByLocation(Array.isArray(value) ? value : [value])
          }
          multiSelect={true}
          onCloseIconClick={(item: string) => {
            setSelectedByLocation(selectedByLocation.filter((f) => f !== item));
          }}
          selectedItemsContainerClass={
            styles.clients_filter_by_location_section_selected_items_container
          }
        />
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
            setPropertiesRange([0, 100]);
            setIsCustomMode(false);
            setCustomMinValue("");
            setCustomMaxValue("");
            setSelectedCreatedOn("");
            setSelectedByLocation([]);
          }}
          className={styles.clients_filter_button_section_cancel_button}
        />
        <Button
          title="Save and Continue"
          variant="primary"
          onClick={() => {
            onApplyFilters({
              status: selectedStatus,
              propertiesRange: {
                min: isCustomMode ? customMinValue : propertiesRange[0],
                max: isCustomMode ? customMaxValue : propertiesRange[1],
              },
              createdOn: selectedCreatedOn,
              byLocation: selectedByLocation,
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
        {renderByLocationSection()}
        {renderButtonSection()}
      </section>
    </section>
  );
};

export default ClientsFilter;
