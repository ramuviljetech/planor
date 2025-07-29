import { Request, Response } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { Building, CreateBuildingRequest } from '../types'
import {
  findBuildingById,
  getAllBuildings,
  getBuildingsByAdminId,
  getBuildingsByClientId,
  getBuildingsByPropertyId,
  createBuilding,
  searchBuildings
} from '../entities/building.entity'
import { findPropertyById } from '../entities/property.entity'

// *Get all buildings (Admin only) or buildings by client ID and propertyId
export const getAllBuildingsController = async (req: Request, res: Response) => {
  try {
    const authenticatedUser = (req as any).user
    const { search, adminId, clientId, propertyId } = req.query

    let buildings: Building[]

    // If clientId is provided, return buildings for that client (no admin required)
    if (clientId && typeof clientId === 'string') {
      buildings = await getBuildingsByClientId(clientId)
      
      return res.json({
        success: true,
        message: 'Buildings retrieved successfully for client',
        data: {
          buildings,
          count: buildings.length,
          clientId
        }
      })
    }

    // If propertyId is provided, return buildings for that property
    if (propertyId && typeof propertyId === 'string') {
      buildings = await getBuildingsByPropertyId(propertyId)
      
      return res.json({
        success: true,
        message: 'Buildings retrieved successfully for property',
        data: {
          buildings,
          count: buildings.length,
          propertyId
        }
      })
    }

    // If no clientId or propertyId, require admin access
    if (!authenticatedUser || authenticatedUser.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Admin access required to view all buildings'
      })
    }

    if (search && typeof search === 'string') {
      // Search buildings
      buildings = await searchBuildings(search)
    } else if (adminId && typeof adminId === 'string') {
      // Get buildings by admin ID
      buildings = await getBuildingsByAdminId(adminId)
    } else {
      // Get all buildings
      buildings = await getAllBuildings()
    }

    return res.json({
      success: true,
      message: 'Buildings retrieved successfully',
      data: {
        buildings,
        count: buildings.length
      }
    })
  } catch (error) {
    console.error('Get buildings error:', error)
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
}

// Get building by ID (Admin only)
export const getBuildingById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const building = await findBuildingById(id)
    if (!building) {
      return res.status(404).json({
        success: false,
        error: 'Building not found'
      })
    }

    return res.json({
      success: true,
      message: 'Building retrieved successfully',
      data: {
        building
      }
    })
  } catch (error) {
    console.error('Get building by ID error:', error)
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
}

// Create new building (Admin only)
export const createBuildingController = async (req: Request, res: Response) => {
  try {
    const authenticatedUser = (req as any).user
    const buildingData: CreateBuildingRequest = req.body

    // Validate that propertyId is provided
    if (!buildingData.propertyId) {
      return res.status(400).json({
        success: false,
        error: 'Property ID is required'
      })
    }

    // Find the property to get the clientId
    const property = await findPropertyById(buildingData.propertyId)
    if (!property) {
      return res.status(404).json({
        success: false,
        error: 'Property not found'
      })
    }

    // Validate that building belongs to only one property (this is enforced by the data structure)
    // Each building has exactly one propertyId field

    // Create new building
    const newBuilding: Building = {
      id: uuidv4(),
      type: 'building',
      buildingName: buildingData.buildingName,
      description: buildingData.description,
      buildingId: buildingData.buildingId,
      contactPerson: buildingData.contactPerson,
      contactEmail: buildingData.contactEmail,
      contactPhone: buildingData.contactPhone,
      address: buildingData.address,
      constructionYear: buildingData.constructionYear,
      imageUrl: buildingData.imageUrl,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      adminId: authenticatedUser.id,
      clientId: property.clientId, // Get clientId from the property
      metadata: buildingData.metadata || {},
      propertyId: buildingData.propertyId // Save the propertyId
    }

    // Save building to database
    await createBuilding(newBuilding)

    return res.status(201).json({
      success: true,
      message: 'Building created successfully',
      data: {
        building: newBuilding
      }
    })
  } catch (error) {
    console.error('Building creation error:', error)
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
}


