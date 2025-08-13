import { Request, Response } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { Building, CreateBuildingRequest } from '../types'
import {
  findBuildingById,
  createBuilding,
  getBuildingsWithPaginationAndFilters,
  updateBuilding,
  getBuildingStatisticsUltraOptimized,
  calculateTotalObjectsUsed
} from '../entities/building.entity'
import { findPropertyById } from '../entities/property.entity'




// *Get all buildings with pagination and search filters  
  //! calculate total objects using count..what about area.?? area does not have count key.
export const getAllBuildingsController = async (req: Request, res: Response) => {
  try {
    const authenticatedUser = (req as any).user
    const { page , limit, propertyId, clientId ,search} = req.query

    // Parse pagination parameters
    const pageNumber = parseInt(page as string) || 1
    const limitNumber = parseInt(limit as string) || 10

    // Parse search filters
    const filters: {
      search?: string;
      propertyId?: string;
      clientId?: string 
} = {}
    if (propertyId && typeof propertyId === 'string') {
      filters.propertyId = propertyId
    }
    if (clientId && typeof clientId === 'string') {
      filters.clientId = clientId
    }
    if (search && typeof search === 'string') {
      filters.search = search
    }
    // Require admin access
    // if (!authenticatedUser || authenticatedUser.role !== 'admin') {
    //   return res.status(403).json({
    //     success: false,
    //     error: 'Admin access required to view all buildings'
    //   })
    // }

    // Get buildings with pagination, filters, and area in one optimized call
    const { buildings, total, totalArea } = await getBuildingsWithPaginationAndFilters(pageNumber, limitNumber, filters)
    
    // Get ultra-optimized statistics with database-level calculations
    const statistics = await getBuildingStatisticsUltraOptimized(filters)

    // Add statistics to each building object
    const buildingsWithStats = buildings.map(building => ({
      ...building,
      total_objects_used: calculateTotalObjectsUsed(building.buildingObjects)
    }))

    return res.json({
      success: true,
      message: 'Buildings retrieved successfully',
      data: {
        buildings: buildingsWithStats,
        count: buildings.length,
        statistics: {
          totalBuildings: statistics.totalBuildings,
          totalArea: statistics.totalArea,
          maintenanceUpdates: statistics.maintenanceUpdates,
          totalMaintenanceCost: statistics.totalMaintenanceCost
        },
        filters: Object.keys(filters).length > 0 ? filters : undefined,
        pagination: {
          page: pageNumber,
          limit: limitNumber,
          total: total,
          totalPages: Math.ceil(total / limitNumber)
        }
      }
    })
  } catch (error) {
    // console.error('Get buildings error:', error)
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

    // Get optimized statistics for this building
    // const statistics = await calculateBuildingStatistics()
    // const { total, totalArea } = await getBuildingsWithPaginationAndFilters(1, 1, {})

    // Add statistics to the building object
    const buildingWithStats = {
      ...building,
      total_objects_used: calculateTotalObjectsUsed(building.buildingObjects)
    }

    return res.json({
      success: true,
      message: 'Building retrieved successfully',
      data: {
        building: buildingWithStats
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


// *Update building maintenance date (Admin only)
export const updateBuildingController = async (req: Request, res: Response) => {
  try {
    const { buildingId, objectIds, maintenanceDate } = req.body;

    if (!buildingId || !objectIds || !maintenanceDate) {
      return res.status(400).json({
        success: false,
        error: 'buildingId, objectIds, and maintenanceDate are required'
      });
    }

    const building = await findBuildingById(buildingId);
    if (!building) {
      return res.status(404).json({ success: false, error: 'Building not found' });
    }

    const idsToUpdate = Array.isArray(objectIds) ? objectIds : [objectIds];
    let updatedCount = 0;

    for (const section of Object.values(building.buildingObjects || {})) {
      for (const obj of section) {
        if (idsToUpdate.includes(obj.id)) {
          obj.maintenanceDate = maintenanceDate;
          updatedCount++;
        }
      }
    }

    if (updatedCount === 0) {
      return res.status(404).json({ success: false, error: 'No matching object(s) found' });
    }

    building.updatedAt = new Date().toISOString();
    await updateBuilding(buildingId, building);

    return res.status(200).json({
      success: true,
      message: `${updatedCount} object(s) updated with maintenance date`
    });

  } catch (error) {
    console.error('Update error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
};







