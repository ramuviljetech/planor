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
  grossArea?: number;
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

export interface PropertyDetailsTypes {
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
  websiteUrl: string;
  organizationNumber: string;
  role: string;
  // Cosmos DB specific fields
  _rid: string;
  _self: string;
  _etag: string;
  _attachments: string;
  _ts: number;
}

export interface Building {
  id: string;
  type: string;
  buildingName: string;
  description: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  imageUrl: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  adminId: string;
  clientId: string;
  metadata: {
    floors: number;
    totalArea: number;
  };
  propertyId: string;
  buildingObjects: {
    walls?: Array<{
      id: string;
      type: string;
      object: string;
      pricelistId: string;
      area: number;
      count: number;
    }>;
    areas?: Array<{
      id: string;
      type: string;
      object: string;
      pricelistId: string;
      area: number;
      count: number;
    }>;
    floors?: Array<{
      id: string;
      type: string;
      object: string;
      pricelistId: string;
      area: number;
      count: number;
    }>;
  };
  _rid: string;
  _self: string;
  _etag: string;
  _attachments: string;
  _ts: number;
  total_objects_used: number;
}
