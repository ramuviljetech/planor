// User Role Enum
export enum UserRole {
  ADMIN = 'admin',
  STANDARD_USER = 'standard_user',
  CLIENT = 'client'
}

// User Status Enum
export enum UserStatus {
  ACTIVE = 'active',
  DEACTIVE = 'deactive',
  BLOCK = 'block'
}

// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  clientId?: string | null;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date | null;
  password?: string; // Optional for responses, required for database operations
}

// Client Types
export interface Client {
  id: string;
  role: 'client';
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  adminId: string;
  status: UserStatus;
}

// New Client Creation Interface
export interface CreateClientRequest {
  email(email: any): unknown;
  id: string;
  role: UserRole.CLIENT;
  clientName: string;
  organizationNumber: string;
  industryType: string;
  address: string;
  websiteUrl?: string;
  timezone: string;
  primaryContactName: string;
  primaryContactEmail: string;
  primaryContactRole: string;
  primaryContactPhoneNumber: string;
  description?: string;
  status: UserStatus.ACTIVE;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string;
  // Optional clientId for creating users for existing clients
  clientId?: string;
  // Optional user data for creating standard user along with client
  user?: {
    username: string;
    contact?: string;
    email: string;
  };
}

// New Standard User Creation Interface
export interface CreateStandardUserRequest {
  id: string;
  username: string;
  role: UserRole.STANDARD_USER;
  contact: string; // Optional field
  email: string;
  clientId: string; // Mandatory field
  status: UserStatus.ACTIVE;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string;
  password: string;
}

// Updated User Types
export interface StandardUser {
  id: string;
  username: string;
  name: string; // Added to match User interface
  contact?: string; // Optional field
  email: string;
  clientId: string;
  role: UserRole.STANDARD_USER;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date | null;
  password?: string;
}


//client filters
export interface ClientFilters {
  maintananceCost: any;
  page: number | string
  limit: number | string
  clientName?: string
  clientId?: string
  status?: string
  createdOn?: string
  properties?: number
}










// Property Types
export interface Property {
  id: string;
  propertyName: string;
  propertyCode: string;
  propertyType: string;
  address: string;
  city: string;
  primaryContactName: string;
  email: string;
  role: string;
  phone: string;
  description: string;
  inactive: boolean;
  createdAt: Date;
  updatedAt: Date;
  adminId: string;
  clientId: string;
  metadata?: {
    grossArea?: number;
  };
}

// Property with building count for API responses
export interface PropertyWithBuildingCount extends Property {
  numOfBuildings: number;
}

// Building Types
// Note: One building belongs to exactly one property (one-to-one relationship)
export interface Building {
  id: string;
  type: 'building';
  buildingName: string;
  description: string;
  buildingId: string;
  propertyId: string; // One building has exactly one property
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  constructionYear: number;
  imageUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  adminId: string;
  clientId: string; // Derived from the property
  totalBuildings?: number;
  totalArea?: number;
  totalMaintenanceCost?: number;
  maintenanceUpdates?: number;
  metadata?: {
    totalArea?: number;
    yearBuilt?: number;
  };
  buildingObjects?: Array<{
    id: string;
    type: string;
    count?: number; // For window/door types
    area?: number; // For floor/wall/area types
    object: string;
    maintenanceDate?: string;
  }> | Record<string, Array<{
    id: string;
    type: string;
    count?: number; // For window/door types
    area?: number; // For floor/wall/area types
    object: string;
    maintenanceDate?: string;
  }>>;
}

// File Types
export interface File {
  id: string;
  type: 'file';
  buildingId: string;
  fileName: string;
  fileType: 'csv' | 'ifc4';
  fileUrl: string;
  fileSize: number;
  uploadedBy: string;
  uploadedAt: string;
  validationStatus: 'pending' | 'approved' | 'rejected';
  metadata?: {
    rowCount?: number;
    columns?: string[];
  };
}

// Price List Types
export interface PriceList {
  id: string;
  type: 'price_list';
  name: string;
  isGlobal: boolean;
  isActive: boolean;
  effectiveFrom: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  buildingId?: string; // Optional building ID for building-specific pricelists
  prices: {
    [key: string]: {
      type: string;
      object: string;
      count: number;
      price: number;
      totalPrice: number;
    };
  };
}

// Individual Price Item Types
export interface PriceItem {
  id: string;
  type: string; // window, door, floor, etc.
  isGlobal?: boolean;
  createdAt: string;
  updatedAt: string;
  buildingId?: string;
  object: string; // The actual type like "11x13 Fast"
  price: number;
}

// Building Element Types
export interface BuildingElement {
  id: string;
  type: 'building_element';
  buildingId: string;
  elementType: 'area' | 'door' | 'floor' | 'window' | 'roof' | 'wall';
  elementId: string;
  name: string;
  area: number;
  material: string;
  quantity: number;
  lastMaintenanceDate: string;
  nextMaintenanceDate: string;
  maintenanceCost: number;
  replacementCost: number;
  totalCost: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  sourceFileId: string;
  metadata?: {
    location?: string;
    specifications?: string;
    warranty?: string;
  };
}

// Maintenance Plan Types
export interface MaintenancePlan {
  id: string;
  type: 'maintenance_plan';
  buildingId: string;
  propertyId: string;
  planName: string;
  year: number;
  totalCost: number;
  elementCount: number;
  status: 'draft' | 'pending' | 'approved' | 'active';
  createdBy: string;
  createdAt: string;
  approvedAt?: string;
  approvedBy?: string;
  summary: {
    [key: string]: {
      count: number;
      totalCost: number;
      maintenanceCost: number;
    };
  };
  files?: {
    excelUrl?: string;
    pdfUrl?: string;
    smartPdfUrl?: string;
  };
}

// Maintenance Record Types
export interface MaintenanceRecord {
  id: string;
  type: 'maintenance_record';
  buildingId: string;
  elementId: string;
  maintenanceType: 'scheduled' | 'emergency' | 'preventive';
  maintenanceDate: string;
  nextMaintenanceDate: string;
  cost: number;
  description: string;
  performedBy: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  attachments?: string[];
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  statusCode?: number;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Request Types
export interface CreateUserRequest {
  email: string
  name: string
  role: UserRole
  clientId?: string | null
}

export interface UpdateUserRequest {
  email?: string
  name?: string
  role?: UserRole
  clientId?: string | null
  status?: UserStatus
  password?: string // Optional for admin updates
}

export interface UserListResponse {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreatePropertyRequest {
  propertyName: string;
  propertyCode: string;
  propertyType: string;
  address: string;
  city: string;
  primaryContactName: string;
  email: string;
  role: string;
  phone: string;
  description: string;
  inactive?: boolean;
  clientId: string;
  metadata?: {
    grossArea?: number;
  };
}

export interface CreateBuildingRequest {
  buildingName: string;
  buildingId: string;
  description: string;
  propertyId: string;
  type: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  isActive: boolean;
  imageUrl?: string;
  constructionYear: number;
  clientId: string; 
  totalBuildings?: number;
  totalArea?: number;
  totalMaintenanceCost?: number;
  maintenanceUpdates?: number;
  metadata?: {
    totalBuildings?: number;
    totalMaintenanceCost?: number;
    maintenanceUpdates?: number;
    floors?: number;
    totalArea?: number;
    yearBuilt?: number;
  };
  buildingObjects?: Array<{
    id: string;
    type: string;
    count?: number; // For window/door types
    area?: number; // For floor/wall/area types
    object: string;
  }> | Record<string, Array<{
    id: string;
    type: string;
    count?: number; // For window/door types
    area?: number; // For floor/wall/area types
    object: string;
  }>>;
}

// Authentication Types
export interface AuthRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  expiresIn: number;
}

// Express Request Extensions
import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  user?: User;
  userRole?: string;
  clientId?: string;
}

// Error Types
export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
  code?: string;
} 