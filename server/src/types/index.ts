// User Role Enum
export enum UserRole {
  ADMIN = 'admin',
  STANDARD_USER = 'standard_user',
  CLIENT = 'client'
}

// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  clientId?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date | null;
  azureAdId?: string | null;
  password?: string; // Optional for responses, required for database operations
}

// Client Types
export interface Client {
  id: string;
  type: 'client';
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  adminId: string;
}

// Property Types
export interface Property {
  id: string;
  type: 'property';
  name: string;
  address: string;
  clientId: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  adminId: string;
  metadata?: {
    totalArea?: number;
    yearBuilt?: number;
    propertyType?: string;
  };
}

// Building Types
export interface Building {
  id: string;
  type: 'building';
  name: string;
  description: string;
  propertyId: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  imageUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  adminId: string;
  metadata?: {
    floors?: number;
    totalArea?: number;
    yearBuilt?: number;
  };
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
  prices: {
    [key: string]: {
      unit: string;
      price: number;
      maintenanceInterval: number;
      maintenanceCost: number;
    };
  };
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
  azureAdId?: string | null
}

export interface UpdateUserRequest {
  email?: string
  name?: string
  role?: UserRole
  clientId?: string | null
  isActive?: boolean
  azureAdId?: string | null
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
  name: string;
  address: string;
  clientId: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  metadata?: {
    totalArea?: number;
    yearBuilt?: number;
    propertyType?: string;
  };
}

export interface CreateBuildingRequest {
  name: string;
  description: string;
  propertyId: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  metadata?: {
    floors?: number;
    totalArea?: number;
    yearBuilt?: number;
  };
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