import { Request, Response, NextFunction } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { Property, CreatePropertyRequest, PropertyWithBuildingCount } from '../types'
import {
  findPropertyById,
  findPropertyByCode,
  findPropertyByCodeExcludingId,
  getAllProperties,
  getPropertiesByAdminId,
  getPropertiesByClientId,
  createProperty,
  updateProperty,
  deleteProperty,
  searchProperties,
  getPropertiesWithFilters,
  calculatePropertyStatistics,
  addBuildingCountsToProperties,
  getPropertiesWithFiltersAndStats,
  // getEmptyPropertiesResponse,
  // getFilteredStatistics
} from '../entities/property.entity'
import { CustomError } from '../middleware/errorHandler';

// Get all properties (Admin only) or properties by client ID
// export const getAllPropertiesController = async (req: Request, res: Response) => {
//   try {
//     const authenticatedUser = (req as any).user
//     const { 
//       search, 
//       adminId, 
//       clientId, 
//     // Default to include statistics
//     } = req.query

//     let properties: Property[]
//     let statistics: any = null

//     // Build filters object
//     const filters: any = {}
//     if (adminId && typeof adminId === 'string') filters.adminId = adminId
//     if (clientId && typeof clientId === 'string') filters.clientId = clientId
//     if (search && typeof search === 'string') filters.search = search

//     // If clientId is provided, allow access without admin role
//     if (clientId && typeof clientId === 'string') {
//       // Get properties with all filters including clientId
//       properties = await getPropertiesWithFilters(filters)
      
//       // Calculate statistics for client properties if requested
//       statistics = await calculatePropertyStatistics(filters)
      
//       return res.json({
//         success: true,
//         message: 'Properties retrieved successfully for client',
//         data: {
//           properties,
//           count: properties.length,
//           clientId,
//           ...(statistics && { statistics })
//         }
//       })
//     }

//     // If no clientId, require admin access
//     if (!authenticatedUser || authenticatedUser.role !== 'admin') {
//       return res.status(403).json({
//         success: false,
//         error: 'Admin access required to view all properties'
//       })
//     }

//     // Get properties with filters (admin access)
//     if (Object.keys(filters).length > 0) {
//       properties = await getPropertiesWithFilters(filters)
//     } else {
//       properties = await getAllProperties()
//     }

//     // Calculate statistics if requested
//     statistics = await calculatePropertyStatistics(Object.keys(filters).length > 0 ? filters : undefined)

//     return res.json({
//       success: true,
//       message: 'Properties retrieved successfully',
//       data: {
//         properties,
//         count: properties.length,
//         ...(statistics && { statistics })
//       }
//     })
//   } catch (error) {
//     console.error('Get properties error:', error)
//     return res.status(500).json({
//       success: false,
//       error: 'Internal server error'
//     })
//   }
// }

export const getAllPropertiesController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authenticatedUser = (req as any).user;
    const { 
      search, 
      adminId, 
      clientId,
      page = '1',
      limit = '10'
    } = req.query;
   
    // Pagination values - ensure they are positive integers
    const currentPage = Math.max(1, parseInt(page as string, 10) || 1);
    const itemsPerPage = Math.max(1, Math.min(100, parseInt(limit as string, 10) || 10));

    // Build filters object
    const filters: any = {};
    if (adminId && typeof adminId === 'string') filters.adminId = adminId;
    if (clientId && typeof clientId === 'string') filters.clientId = clientId;
    if (search && typeof search === 'string') filters.search = search;

    // If clientId is provided, allow access without admin role
    if (clientId && typeof clientId === 'string') {
      // Get properties with all filters including clientId
      const result = await getPropertiesWithFiltersAndStats(filters, currentPage, itemsPerPage);
      
       res.status(200).json({
        success: true,
        message: 'Properties retrieved successfully for client',
        data: {
          ...result,
          clientId
        }
      });
    }

    // If no clientId, require admin access
    if (!authenticatedUser || authenticatedUser.role !== 'admin') {
       throw new CustomError('Admin access required to view all properties', 403)
     
    }

    // Get properties with filters and statistics (admin access)
    const result = await getPropertiesWithFiltersAndStats(filters, currentPage, itemsPerPage);

    // Return response
    res.status(200).json({
      success: true,
      message: 'Properties retrieved successfully',
      data: result
    });
  } catch (error) {
    next(error)
  }
};


// Get property by ID (Admin only)
export const getPropertyById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params

    const property = await findPropertyById(id)
    if (!property) {
      throw new CustomError('Property not found', 404)
    }

    // Add building count to the property
    const propertyWithBuildingCount = await addBuildingCountsToProperties([property]);
    const propertyWithCount = propertyWithBuildingCount[0];

    res.status(200).json({
      success: true,
      message: 'Property retrieved successfully',
      data: {
        property: propertyWithCount
      }
    })
  } catch (error) {
    next(error)
  }
}

// Create new property (Admin only)
export const createPropertyController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authenticatedUser = (req as any).user
    const propertyData: CreatePropertyRequest = req.body
    console.log(propertyData)
    // Check if property with same code already exists
    const existingProperty = await findPropertyByCode(propertyData.propertyCode)
    if (existingProperty) {
      throw new CustomError('Property with this code already exists', 409)
    }

    // Create new property
    const newProperty: Property = {
      id: uuidv4(),
      propertyName: propertyData.propertyName,
      propertyCode: propertyData.propertyCode,
      propertyType: propertyData.propertyType,
      address: propertyData.address,
      city: propertyData.city,
      primaryContactName: propertyData.primaryContactName,
      email: propertyData.email,
      // role: propertyData.role,
      phone: propertyData.phone,
      description: propertyData.description || '',
      inactive: propertyData.inactive || false,
      createdAt: new Date(),
      updatedAt: new Date(),
      adminId: authenticatedUser.id,
      clientId: propertyData.clientId,
      metadata: propertyData.metadata || {}
    }

    // Save property to database
    await createProperty(newProperty)

    res.status(201).json({
      success: true,
      message: 'Property created successfully',
      data: {
        property: newProperty
      }
    })
  } catch (error) {
    next(error)
  }
}

//? Update property (Admin only) future update
export const updatePropertyController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authenticatedUser = (req as any).user
    const { id } = req.params
    const updateData: Partial<CreatePropertyRequest> = req.body

    // Check if property exists
    const existingProperty = await findPropertyById(id)
    if (!existingProperty) {
      throw new CustomError('Property not found', 404)
    }

    // Check if property code is being updated and if it already exists
    if (updateData.propertyCode && updateData.propertyCode !== existingProperty.propertyCode) {
      const propertyWithSameCode = await findPropertyByCodeExcludingId(updateData.propertyCode, id)
      if (propertyWithSameCode) {
        throw new CustomError('Property with this code already exists', 409)
      }
    }

    // Update property
    const updatedProperty = await updateProperty(id, {
      ...updateData,
      updatedAt: new Date()
    })

    res.status(200).json({
      success: true,
      message: 'Property updated successfully',
      data: {
        property: updatedProperty
      }
    })
  } catch (error) {
    next(error)
  }
}

// ?Delete property (Admin only) future update
export const deletePropertyController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params

    // Check if property exists
    const existingProperty = await findPropertyById(id)
    if (!existingProperty) {
      throw new CustomError('Property not found', 404)
    }

    // Delete property
    await deleteProperty(id)

    res.status(200).json({
      success: true,
      message: 'Property deleted successfully'
    })
  } catch (error) {
    next(error)
  }
} 


// export const getPropertyStatisticsController = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const authenticatedUser = (req as any).user;
//     const { 
//       search, 
//       adminId, 
//       clientId
//     } = req.query;

//     // Build filters object
//     const filters: any = {};
//     if (adminId && typeof adminId === 'string') filters.adminId = adminId;
//     if (clientId && typeof clientId === 'string') filters.clientId = clientId;
//     if (search && typeof search === 'string') filters.search = search;

//     // If clientId is provided, allow access without admin role
//     if (clientId && typeof clientId === 'string') {
//       const statistics = await getFilteredStatistics(filters);
      
//       return res.json({
//         success: true,
//         message: 'Property statistics retrieved successfully for client',
//         data: {
//           statistics,
//           clientId
//         }
//       });
//     }

//     // If no clientId, require admin access
//     if (!authenticatedUser || authenticatedUser.role !== 'admin') {
//       return res.status(403).json({
//         success: false,
//         error: 'Admin access required to view property statistics'
//       });
//     }

//     // Get statistics based on filters (admin access)
//     const statistics = await getFilteredStatistics(filters);

//     // Return response
//     res.status(200).json({
//       success: true,
//       message: 'Property statistics retrieved successfully',
//       data: {
//         statistics
//       }
//     });
//   } catch (error) {
//     console.error('Get property statistics error:', error);
//     next(error);
//   }
// }; 