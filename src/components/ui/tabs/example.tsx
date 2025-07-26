import React from "react";
import CustomTabs, { TabItem } from "./index";

// Example 1: Basic usage
export const BasicTabsExample = () => {
  const tabs: TabItem[] = [
    { label: "Overview", value: "overview" },
    { label: "Details", value: "details" },
    { label: "Settings", value: "settings" },
  ];

  const handleTabChange = (value: string) => {
    console.log("Tab changed to:", value);
  };

  return (
    <CustomTabs
      tabs={tabs}
      defaultTab="overview"
      onTabChange={handleTabChange}
    />
  );
};

// Example 2: With custom styles
export const CustomStyledTabsExample = () => {
  const tabs: TabItem[] = [
    { label: "Profile", value: "profile" },
    { label: "Security", value: "security" },
    { label: "Notifications", value: "notifications" },
    { label: "Billing", value: "billing", disabled: true },
  ];

  return (
    <CustomTabs
      tabs={tabs}
      defaultTab="profile"
      customStyles={{
        tabColor: "var(--jet-black)",
        selectedTabColor: "var(--rose-red)",
        indicatorColor: "var(--rose-red)",
        fontSize: "16px",
        fontFamily: "var(--font-lato-bold)",
      }}
    />
  );
};

// Example 3: Full width tabs
export const FullWidthTabsExample = () => {
  const tabs: TabItem[] = [
    { label: "All", value: "all" },
    { label: "Active", value: "active" },
    { label: "Completed", value: "completed" },
    { label: "Archived", value: "archived" },
  ];

  return <CustomTabs tabs={tabs} variant="fullWidth" defaultTab="all" />;
};

// Example 4: Vertical tabs
export const VerticalTabsExample = () => {
  const tabs: TabItem[] = [
    { label: "Dashboard", value: "dashboard" },
    { label: "Analytics", value: "analytics" },
    { label: "Reports", value: "reports" },
  ];

  return (
    <CustomTabs tabs={tabs} orientation="vertical" defaultTab="dashboard" />
  );
};

// Example 5: Without indicator
export const NoIndicatorTabsExample = () => {
  const tabs: TabItem[] = [
    { label: "Tab 1", value: "tab1" },
    { label: "Tab 2", value: "tab2" },
    { label: "Tab 3", value: "tab3" },
  ];

  return <CustomTabs tabs={tabs} showIndicator={false} defaultTab="tab1" />;
};
