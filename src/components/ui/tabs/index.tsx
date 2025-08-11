import React, { useState } from "react";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import styles from "./styles.module.css";

export interface TabItem {
  label: string;
  value: string;
  disabled?: boolean;
}

interface CustomTabsProps {
  tabs: TabItem[];
  defaultTab?: string;
  activeTab?: string;
  onTabChange?: (value: string) => void;
  className?: string;
  variant?: "standard" | "fullWidth" | "scrollable";
  orientation?: "horizontal" | "vertical";
  showIndicator?: boolean;
  customStyles?: {
    tabColor?: string;
    selectedTabColor?: string;
    indicatorColor?: string;
    fontSize?: string;
    fontFamily?: string;
    borderBottom?: string;
  };
}

const CustomTabs: React.FC<CustomTabsProps> = ({
  tabs,
  defaultTab,
  activeTab: controlledActiveTab,
  onTabChange,
  className,
  variant = "standard",
  orientation = "horizontal",
  showIndicator = true,
  customStyles = {},
}) => {
  const [internalActiveTab, setInternalActiveTab] = useState(
    defaultTab || tabs[0]?.value || ""
  );

  // Use controlled value if provided, otherwise use internal state
  const activeTab =
    controlledActiveTab !== undefined ? controlledActiveTab : internalActiveTab;

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setInternalActiveTab(newValue);
    onTabChange?.(newValue);
  };

  const {
    tabColor = "var(--granite-gray)",
    selectedTabColor = "var(--black)",
    indicatorColor = "var(--black)",
    fontSize = "14px",
    fontFamily = "var(--font-lato-regular)",
    borderBottom = "none",
  } = customStyles;

  return (
    <div className={`${styles.customTabsContainer} ${className || ""}`}>
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        variant={variant}
        orientation={orientation}
        className={styles.customTabs}
        sx={{
          "& .MuiTabs-indicator": {
            backgroundColor: showIndicator ? indicatorColor : "transparent",
            height: "1px",
          },
        }}
      >
        {tabs.map((tab) => (
          <Tab
            key={tab.value}
            label={tab.label}
            value={tab.value}
            disabled={tab.disabled}
            className={styles.customTab}
            sx={{
              textTransform: "none",
              fontFamily: fontFamily,
              fontSize: fontSize,
              color: tabColor,
              minWidth: "auto",
              padding: "12px 16px",
              borderRadius: "8px 8px 0 0",
              transition: "all 0.2s ease",
              "&:hover": {
                color: selectedTabColor,
              },
              "&.Mui-selected": {
                color: selectedTabColor,
                fontWeight: 400,
              },
              "&.Mui-disabled": {
                color: "var(--concrete)",
                opacity: 0.6,
              },
            }}
          />
        ))}
      </Tabs>
    </div>
  );
};

export default CustomTabs;
