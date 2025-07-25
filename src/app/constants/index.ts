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

export const buildingInfo = [
  { label: "Name", value: "Tower A" },
  { label: "Construction Year", value: "2011" },
  { label: "Building ID", value: "BLD-TO-00A" },
  { label: "Buildings Status", value: "Active" },
  { label: "Property Linked", value: "Stora Nygatan" },
  { label: "Location", value: "random street , nswe  ds-22 , maoes" },
  { label: "Client Name", value: "Akrivia Infratech Solutions" },
  { label: "Description", value: "Main tower for the community" },
  { label: "Building Type", value: "Residential" },
];

export const buildingPhysicalAttributes = [
  { label: "Number of floors", value: "12" },
  { label: "Total floor area", value: "4,500 m²" },
  { label: "Building Height", value: "45 m" },
  { label: "Basement", value: "Yes" },
  { label: "Roof Type", value: "Flat / pitched" },
  { label: "Facade material", value: "Glass & Steel" },
];

export const buildingContact = [
  { label: "Responsible Person", value: "John stwien" },
  { label: "Email", value: "Akrstwien@gmail.com" },
  { label: "Phone", value: "+46 70 123 45 67" },
];
