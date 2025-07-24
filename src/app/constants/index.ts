import {
  clientGrayIcon,
  clientWhiteIcon,
  dashboardGraykIcon,
  dashboardWhiteIcon,
  priceListGrayIcon,
  priceListWhiteIcon,
  propertiesGrayIcon,
  propertiesWhiteIcon,
} from "@/resources/images";
import { settingsGrayIcon } from "@/resources/images";
import { MenuItem } from "@/types/ui";

export const MainMenu: MenuItem[] = [
  {
    label: "Dashboard",
    icon: dashboardGraykIcon,
    active_icon: dashboardWhiteIcon,
    route: "/dashboard",
  },
  {
    label: "Clients",
    icon: clientGrayIcon,
    active_icon: clientWhiteIcon,
    route: "/",
  },
  {
    label: "Properties",
    icon: propertiesGrayIcon,
    active_icon: propertiesWhiteIcon,
    route: "/",
  },
  {
    label: "Price List",
    icon: priceListGrayIcon,
    active_icon: priceListWhiteIcon,
    route: "/",
  },
  {
    label: "Settings",
    icon: settingsGrayIcon,
    active_icon: settingsGrayIcon,
    route: "/",
  },
];

export const yearlyMaintenanceSummaryOptions = [
  {
    label: "This Year",
    value: "thisYear",
  },
  {
    label: "Next Year",
    value: "nextYear",
  },
  {
    label: "Select Year",
    value: "selectYear",
  },
];

export const filterOptions = [
  {
    label: "Clients",
    value: "clients",
  },
  {
    label: "Properties",
    value: "properties",
  },
  {
    label: "Buildings",
    value: "buildings",
  },
];

export const clientsStaticCardTitle = [
  {
    title: "Total Clients",
    value: 24,
  },
  {
    title: "New Clients This Month",
    value: 4,
  },
  {
    title: "Total Files Uploaded",
    value: 24,
  },
  {
    title: "Total Buildings",
    value: 1430,
  },
];

export const clientDetailsCardsData = [
  {
    title: "Properties",
    value: "23",
  },
  {
    title: "Total Area",
    value: "89,700 m²",
  },
  {
    title: "Maintenance Cost",
    value: "4,43,433",
  },
  {
    title: "Buildings",
    value: "190",
  },
];
