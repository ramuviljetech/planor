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
