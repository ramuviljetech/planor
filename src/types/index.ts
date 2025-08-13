export interface Property {
  id: string;
  propertyName: string;
  propertyCode: string;
  propertyType: string;
  address: string;
  city: string;
  primaryContactName: string;
  email: string;
  phone: string;
  description: string;
  inactive: boolean;
  createdAt: string;
  updatedAt: string;
  adminId: string;
  clientId: string;
  metadata: Record<string, any>;
  numOfBuildings: number;
  role?: string;
}

export interface PropertiesStatistics {
  totalProperties: number;
  totalArea: number;
  totalBuildings: number;
  totalMaintenanceCost: {
    doors: number;
    floors: number;
    windows: number;
    walls: number;
    roofs: number;
    areas: number;
  };
}

export interface PropertiesPagination {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// Re-export other types
export * from "./auth";
export * from "./ui";
export * from "./sections";
