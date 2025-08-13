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
    route: "/properties",
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
    route: "/settings",
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

export const propertiesRowsData = [
  {
    id: 1,
    propertyName: "Property 1",
    buildings: 12,
    code: "123456",
    types: "Commercial",
    clientName: "Brunnfast AB",
  },
  {
    id: 2,
    propertyName: "Property 2",
    buildings: 12,
    code: "123456",
    types: "Public",
    clientName: "Brunnfast AB",
  },
  {
    id: 3,
    propertyName: "Property 3",
    buildings: 12,
    code: "123456",
    types: "Public",
    clientName: "Brunnfast AB",
  },
  {
    id: 4,
    propertyName: "Property 4",
    buildings: 12,
    code: "123456",
    types: "Commercial",
    clientName: "Brunnfast AB",
  },
  {
    id: 5,
    propertyName: "Property 5",
    buildings: 12,
    code: "123456",
    types: "Commercial",
    clientName: "Brunnfast AB",
  },
  {
    id: 6,
    propertyName: "Property 6",
    buildings: 12,
    code: "123456",
    types: "Public",
    clientName: "Brunnfast AB",
  },
  {
    id: 7,
    propertyName: "Property 7",
    buildings: 12,
    code: "123456",
    types: "Commercial",
    clientName: "Brunnfast AB",
  },
  {
    id: 8,
    propertyName: "Property 8",
    buildings: 12,
    code: "123456",
    types: "Public",
    clientName: "Brunnfast AB",
  },
  {
    id: 9,
    propertyName: "Property 9",
    buildings: 12,
    code: "123456",
    types: "Commercial",
    clientName: "Brunnfast AB",
  },
  {
    id: 10,
    propertyName: "Property 10",
    buildings: 12,
    code: "123456",
    types: "Public",
    clientName: "Brunnfast AB",
  },
  {
    id: 11,
    propertyName: "Property 11",
    buildings: 12,
    code: "123456",
    types: "Commercial",
    clientName: "Brunnfast AB",
  },
];

export const buildingListColumns = [
  {
    key: "buildingName",
    title: "Building Name",
    width: "calc(100% / 7)",
  },
  {
    key: "floors",
    title: "Floors",
    width: "calc(100% / 7)",
  },
  {
    key: "builtYear",
    title: "Built year",
    width: "calc(100% / 7)",
  },
  {
    key: "usage",
    title: "Usage",
    width: "calc(100% / 7)",
  },
  {
    key: "totalObjectsUsed",
    title: "Total Objects Used",
    width: "calc(100% / 7)",
  },
  {
    key: "totalMaintenanceCost",
    title: "Total Maintenance Cost",
    width: "calc(100% / 7)",
  },
];

export const buildingListRowsData = [
  {
    id: 1,
    buildingName: "Building 1",
    floors: 12,
    builtYear: 2020,
    usage: "Residential",
    totalObjectsUsed: 100,
    totalMaintenanceCost: 10000,
  },
  {
    id: 2,
    buildingName: "Building 2",
    floors: 12,
    builtYear: 2020,
    usage: "Commercial",
    totalObjectsUsed: 100,
    totalMaintenanceCost: 10000,
  },
  {
    id: 3,
    buildingName: "Building 3",
    floors: 12,
    builtYear: 2020,
    usage: "Residential",
    totalObjectsUsed: 100,
    totalMaintenanceCost: 10000,
  },
  {
    id: 4,
    buildingName: "Building 4",
    floors: 12,
    builtYear: 2020,
    usage: "Residential",
    totalObjectsUsed: 100,
    totalMaintenanceCost: 10000,
  },
  {
    id: 5,
    buildingName: "Building 5",
    floors: 12,
    builtYear: 2020,
    usage: "Public",
    totalObjectsUsed: 100,
    totalMaintenanceCost: 10000,
  },
  {
    id: 6,
    buildingName: "Building 6",
    floors: 12,
    builtYear: 2020,
    usage: "Public",
    totalObjectsUsed: 100,
    totalMaintenanceCost: 10000,
  },
  {
    id: 7,
    buildingName: "Building 7",
    floors: 12,
    builtYear: 2020,
    usage: "Commercial",
    totalObjectsUsed: 100,
    totalMaintenanceCost: 10000,
  },
  {
    id: 8,
    buildingName: "Building 8",
    floors: 12,
    builtYear: 2020,
    usage: "Public",
    totalObjectsUsed: 100,
    totalMaintenanceCost: 10000,
  },
  {
    id: 9,
    buildingName: "Building 9",
    floors: 12,
    builtYear: 2020,
    usage: "Commercial",
    totalObjectsUsed: 100,
    totalMaintenanceCost: 10000,
  },
  {
    id: 10,
    buildingName: "Building 10",
    floors: 12,
    builtYear: 2020,
    usage: "Commercial",
    totalObjectsUsed: 100,
    totalMaintenanceCost: 10000,
  },
  {
    id: 11,
    buildingName: "Building 11",
    floors: 12,
    builtYear: 2020,
    usage: "Commercial",
    totalObjectsUsed: 100,
    totalMaintenanceCost: 10000,
  },
];

export const sampleActivities = [
  {
    id: "1",
    title: "Approved Excel data for Block S Skatan",
    description:
      "is a platform for showcasing and discovering creative work, connecting artists and designers worldwide.",
    timestamp: "2 days ago",
    files: [
      {
        id: "file1",
        fileName: "blockc-1.Pdf",
        uploadedBy: "Kvarter Skatan",
        uploadedDate: "12 jun, 2025",
        fileSize: "3 MB",
        folder: "Block C",
      },
      {
        id: "file2",
        fileName: "blockc-2.Pdf",
        uploadedBy: "Kvarter Skatan",
        uploadedDate: "12 jun, 2025",
        fileSize: "3 MB",
        folder: "Block C",
      },
      {
        id: "file3",
        fileName: "BlockA_objectsP...",
        uploadedBy: "Kvarter Skatan",
        uploadedDate: "12 jun, 2025",
        fileSize: "3 MB",
        folder: "Modified details",
      },
    ],
  },
  {
    id: "2",
    title: "Approved Excel data for Block S Skatan",
    description:
      "is a platform for showcasing and discovering creative work, connecting artists and designers worldwide.",
    timestamp: "12 Hrs ago",
    status: "Approved",
  },
  {
    id: "3",
    title: "Approved Excel data for Block S Skatan",
    description:
      "is a platform for showcasing and discovering creative work, connecting artists and designers worldwide.",
    timestamp: "1 day ago",
    status: "Approved",
  },
];

export const allObjectsAccordionTableColumns = [
  { key: "object", label: "Type" },
  { key: "price", label: "Price" },
  { key: "unit", label: "Unit" },
  { key: "interval", label: "Interval" },
];

export const newObjectsTableHeadings = [
  { heading: "Object", key: "object" },
  { heading: "Type", key: "type" },
  { heading: "Price", key: "price" },
  { heading: "Unit", key: "unit" },
  { heading: "Intervals", key: "intervals" },
];