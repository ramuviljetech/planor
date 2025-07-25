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
    route: "/clients",
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
    route: "/price-list",
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

export const rowsData = [
  {
    id: 1,
    clientName: "Brunnfast AB",
    clientId: "945422",
    properties: 12,
    createdOn: "12 Jun, 2025",
    maintenanceCost: 23450,
    grossArea: "1200 m²",
    status: "Active",
  },
  {
    id: 2,
    clientName: "Brunnfast AB",
    clientId: "945422",
    properties: 12,
    createdOn: "12 Jun, 2025",
    maintenanceCost: 23450,
    grossArea: "1200 m²",
    status: "Inactive",
  },
  {
    id: 3,
    clientName: "Brunnfast AB",
    clientId: "945422",
    properties: 12,
    createdOn: "12 Jun, 2025",
    maintenanceCost: 23450,
    grossArea: "1200 m²",
    status: "Active",
  },
  {
    id: 4,
    clientName: "Brunnfast AB",
    clientId: "945422",
    properties: 12,
    createdOn: "12 Jun, 2025",
    maintenanceCost: 23450,
    grossArea: "1200 m²",
    status: "Inactive",
  },
  {
    id: 5,
    clientName: "Brunnfast AB",
    clientId: "945422",
    properties: 0,
    createdOn: "12 Jun, 2025",
    maintenanceCost: 23450,
    grossArea: "1200 m²",
    status: "Active",
  },
  {
    id: 6,
    clientName: "Brunnfast AB",
    clientId: "945422",
    properties: 12,
    createdOn: "12 Jun, 2025",
    maintenanceCost: 23450,
    grossArea: "1200 m²",
    status: "Active",
  },
  {
    id: 7,
    clientName: "Brunnfast AB",
    clientId: "945422",
    properties: 40,
    createdOn: "12 Jun, 2025",
    maintenanceCost: 23450,
    status: "Inactive",
  },
  {
    id: 8,
    clientName: "Brunnfast AB",
    clientId: "945422",
    properties: 12,
    createdOn: "12 Jun, 2025",
    maintenanceCost: 23450,
    grossArea: "1200 m²",
    status: "Active",
  },
  {
    id: 9,
    clientName: "Brunnfast AB",
    clientId: "945422",
    properties: 12,
    createdOn: "12 Jun, 2025",
    maintenanceCost: 23450,
    status: "Inactive",
  },
  {
    id: 10,
    clientName: "Brunnfast AB",
    clientId: "945422",
    properties: 9,
    createdOn: "12 Jun, 2025",
    maintenanceCost: 23450,
    grossArea: "1200 m²",
    status: "Active",
  },
  {
    id: 11,
    clientName: "Brunnfast AB",
    clientId: "945422",
    properties: 0,
    createdOn: "12 Jun, 2025",
    maintenanceCost: 23450,
    grossArea: "1200 m²",
    status: "Inactive",
  },
  {
    id: 12,
    clientName: "Brunnfast AB",
    clientId: "945422",
    properties: 77,
    createdOn: "12 Jun, 2025",
    maintenanceCost: 23450,
    grossArea: "1200 m²",
    status: "Inactive",
  },
  {
    id: 13,
    clientName: "Brunnfast AB",
    clientId: "945422",
    properties: 89,
    createdOn: "12 Jun, 2025",
    maintenanceCost: 23450,
    grossArea: "1200 m²",
    status: "Active",
  },
  {
    id: 14,
    clientName: "Brunnfast AB",
    clientId: "945422",
    properties: 0,
    createdOn: "12 Jun, 2025",
    maintenanceCost: 23450,
    grossArea: "1200 m²",
    status: "Inactive",
  },
  {
    id: 15,
    clientName: "Brunnfast AB",
    clientId: "945422",
    properties: 0,
    createdOn: "12 Jun, 2025",
    maintenanceCost: 23450,
    grossArea: "1200 m²",
    status: "Inactive",
  },
  {
    id: 16,
    clientName: "Brunnfast AB",
    clientId: "945422",
    properties: 0,
    createdOn: "12 Jun, 2025",
    maintenanceCost: 23450,
    grossArea: "1200 m²",
    status: "Active",
  },
  {
    id: 17,
    clientName: "Brunnfast AB",
    clientId: "945422",
    properties: 0,
    createdOn: "12 Jun, 2025",
    maintenanceCost: 23450,
    grossArea: "1200 m²",
    status: "Inactive",
  },
  {
    id: 18,
    clientName: "Brunnfast AB",
    clientId: "945422",
    properties: 0,
    createdOn: "12 Jun, 2025",
    maintenanceCost: 23450,
    status: "Active",
    grossArea: "1200 m²",
  },
  {
    id: 19,
    clientName: "Brunnfast AB",
    clientId: "945422",
    properties: 0,
    createdOn: "12 Jun, 2025",
    maintenanceCost: 23450,
    status: "Active",
    grossArea: "1200 m²",
  },
  {
    id: 20,
    clientName: "Brunnfast AB",
    clientId: "945422",
    properties: 0,
    createdOn: "12 Jun, 2025",
    maintenanceCost: 23450,
    grossArea: "1200 m²",
    status: "Inactive",
  },
];

export const buildingMaintenancePlanRowsData = [
  {
    id: 1,
    objectName: "Doore 1",
    year1: "100SEK",
    year5: "200SEK",
    year10: "300SEK",
  },
  {
    id: 2,
    objectName: "Floor ",
    year1: "100SEK",
    year5: "200SEK",
    year10: "300SEK",
  },
  {
    id: 3,
    objectName: "Window D",
    year1: "100SEK",
    year5: "200SEK",
    year10: "300SEK",
  },
  {
    id: 4,
    objectName: "Window A",
    year1: "100SEK",
    year5: "200SEK",
    year10: "300SEK",
  },
  {
    id: 5,
    objectName: "Block A",
    year1: "100SEK",
    year5: "200SEK",
    year10: "300SEK",
  },
  {
    id: 6,
    objectName: "Block B",
    year1: "100SEK",
    year5: "200SEK",
    year10: "300SEK",
  },
  {
    id: 7,
    objectName: "Block C",
    year1: "100SEK",
    year5: "200SEK",
    year10: "300SEK",
  },
  {
    id: 8,
    objectName: "Block D",
    year1: "100SEK",
    year5: "200SEK",
    year10: "300SEK",
  },
];

export const clientInfoItems = [
  { label: "Name", value: "Brunnfast AB" },
  { label: "Primary Contact Name", value: "John stwien" },
  { label: "Client ID", value: "98088" },
  { label: "Role", value: "CEO" },
  { label: "Organization Number", value: "Stora Nygatan" },
  { label: "Phone", value: "+ 56 287 342 343" },
  { label: "Industry Type", value: "Akrivia Infratech Solutions" },
  { label: "Email", value: "Akrstwien@gmail.com" },
  { label: "Website Url", value: "Brunnfast AB .In" },
  { label: "Description", value: "A Property Management Organizations" },
];

export const clientInfoUsersRowsData = [
  {
    id: 1,
    userName: "John Doe",
    phoneNumber: "+1234567890",
    email: "john.doe@example.com",
  },
  {
    id: 2,
    userName: "John Doe",
    phoneNumber: "+1234567890",
    email: "john.doe@example.com",
  },
  {
    id: 3,
    userName: "John Doe",
    phoneNumber: "+1234567890",
    email: "john.doe@example.com",
  },
  {
    id: 4,
    userName: "John Doe",
    phoneNumber: "+1234567890",
    email: "john.doe@example.com",
  },
  {
    id: 5,
    userName: "John Doe",
    phoneNumber: "+1234567890",
    email: "john.doe@example.com",
  },
  {
    id: 6,
    userName: "John Doe",
    phoneNumber: "+1234567890",
    email: "john.doe@example.com",
  },
  {
    id: 7,
    userName: "John Doe",
    phoneNumber: "+1234567890",
    email: "john.doe@example.com",
  },
];
