import { Request, Response } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { Property, CreatePropertyRequest } from '../types'
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
  calculatePropertyStatistics
} from '../entities/property.entity'

// Get all properties (Admin only) or properties by client ID
export const getAllPropertiesController = async (req: Request, res: Response) => {
  try {
    const authenticatedUser = (req as any).user
    const { 
      search, 
      adminId, 
      clientId, 
    // Default to include statistics
    } = req.query

    let properties: Property[]
    let statistics: any = null

    // Build filters object
    const filters: any = {}
    if (adminId && typeof adminId === 'string') filters.adminId = adminId
    if (clientId && typeof clientId === 'string') filters.clientId = clientId
    if (search && typeof search === 'string') filters.search = search

    // If clientId is provided, allow access without admin role
    if (clientId && typeof clientId === 'string') {
      // Get properties with all filters including clientId
      properties = await getPropertiesWithFilters(filters)
      
      // Calculate statistics for client properties if requested
      statistics = await calculatePropertyStatistics(filters)
      
      return res.json({
        success: true,
        message: 'Properties retrieved successfully for client',
        data: {
          properties,
          count: properties.length,
          clientId,
          ...(statistics && { statistics })
        }
      })
    }

    // If no clientId, require admin access
    if (!authenticatedUser || authenticatedUser.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Admin access required to view all properties'
      })
    }

    // Get properties with filters (admin access)
    if (Object.keys(filters).length > 0) {
      properties = await getPropertiesWithFilters(filters)
    } else {
      properties = await getAllProperties()
    }

    // Calculate statistics if requested
    statistics = await calculatePropertyStatistics(Object.keys(filters).length > 0 ? filters : undefined)

    return res.json({
      success: true,
      message: 'Properties retrieved successfully',
      data: {
        properties,
        count: properties.length,
        ...(statistics && { statistics })
      }
    })
  } catch (error) {
    console.error('Get properties error:', error)
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
}

// export const getAllPropertiesController = async (req: Request, res: Response) => {
//   try {
//     const authenticatedUser = (req as any).user;
//     const { 
//       search, 
//       adminId, 
//       clientId,
//       page = '1',
//       limit = '10'
//     } = req.query;

//     let properties: Property[] = [];
//     let statistics: any = null;

//     // Pagination values
//     const currentPage = Math.max(1, parseInt(page as string, 10));
//     const itemsPerPage = Math.max(1, parseInt(limit as string, 10));
//     const startIndex = (currentPage - 1) * itemsPerPage;
//     const endIndex = startIndex + itemsPerPage;

//     // Build filters object
//     const filters: any = {};
//     if (adminId && typeof adminId === 'string') filters.adminId = adminId;
//     if (clientId && typeof clientId === 'string') filters.clientId = clientId;
//     if (search && typeof search === 'string') filters.search = search;

//     // If clientId is provided, allow access without admin role
//     if (clientId && typeof clientId === 'string') {
//       const allProperties = await getPropertiesWithFilters(filters);
//       properties = allProperties.slice(startIndex, endIndex);
//       statistics = await calculatePropertyStatistics(filters);

//       return res.json({
//         success: true,
//         message: 'Properties retrieved successfully for client',
//         data: {
//           properties,
//           count: allProperties.length,
//           clientId,
//           pagination: {
//             currentPage,
//             itemsPerPage,
//             totalItems: allProperties.length,
//             totalPages: Math.ceil(allProperties.length / itemsPerPage),
//             hasNextPage: endIndex < allProperties.length,
//             hasPreviousPage: startIndex > 0
//           },
//           ...(statistics && { statistics })
//         }
//       });
//     }

//     // If no clientId, require admin access
//     if (!authenticatedUser || authenticatedUser.role !== 'admin') {
//       return res.status(403).json({
//         success: false,
//         error: 'Admin access required to view all properties'
//       });
//     }

//     const allProperties = Object.keys(filters).length > 0
//       ? await getPropertiesWithFilters(filters)
//       : await getAllProperties();

//     properties = allProperties.slice(startIndex, endIndex);
//     statistics = await calculatePropertyStatistics(Object.keys(filters).length > 0 ? filters : undefined);

//     return res.json({
//       success: true,
//       message: 'Properties retrieved successfully',
//       data: {
//         properties,
//         count: allProperties.length,
//         pagination: {
//           currentPage,
//           itemsPerPage,
//           totalItems: allProperties.length,
//           totalPages: Math.ceil(allProperties.length / itemsPerPage),
//           hasNextPage: endIndex < allProperties.length,
//           hasPreviousPage: startIndex > 0
//         },
//         ...(statistics && { statistics })
//       }
//     });
//   } catch (error) {
//     console.error('Get properties error:', error);
//     return res.status(500).json({
//       success: false,
//       error: 'Internal server error'
//     });
//   }
// };




// Get property by ID (Admin only)
export const getPropertyById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const property = await findPropertyById(id)
    if (!property) {
      return res.status(404).json({
        success: false,
        error: 'Property not found'
      })
    }

    return res.json({
      success: true,
      message: 'Property retrieved successfully',
      data: {
        property
      }
    })
  } catch (error) {
    console.error('Get property by ID error:', error)
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
}

// Create new property (Admin only)
export const createPropertyController = async (req: Request, res: Response) => {
  try {
    const authenticatedUser = (req as any).user
    const propertyData: CreatePropertyRequest = req.body

    // Check if property with same code already exists
    const existingProperty = await findPropertyByCode(propertyData.propertyCode)
    if (existingProperty) {
      return res.status(409).json({
        success: false,
        error: 'Property with this code already exists'
      })
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
      role: propertyData.role,
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

    return res.status(201).json({
      success: true,
      message: 'Property created successfully',
      data: {
        property: newProperty
      }
    })
  } catch (error) {
    console.error('Property creation error:', error)
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
}

// Update property (Admin only)
export const updatePropertyController = async (req: Request, res: Response) => {
  try {
    const authenticatedUser = (req as any).user
    const { id } = req.params
    const updateData: Partial<CreatePropertyRequest> = req.body

    // Check if property exists
    const existingProperty = await findPropertyById(id)
    if (!existingProperty) {
      return res.status(404).json({
        success: false,
        error: 'Property not found'
      })
    }

    // Check if property code is being updated and if it already exists
    if (updateData.propertyCode && updateData.propertyCode !== existingProperty.propertyCode) {
      const propertyWithSameCode = await findPropertyByCodeExcludingId(updateData.propertyCode, id)
      if (propertyWithSameCode) {
        return res.status(409).json({
          success: false,
          error: 'Property with this code already exists'
        })
      }
    }

    // Update property
    const updatedProperty = await updateProperty(id, {
      ...updateData,
      updatedAt: new Date()
    })

    return res.json({
      success: true,
      message: 'Property updated successfully',
      data: {
        property: updatedProperty
      }
    })
  } catch (error) {
    console.error('Property update error:', error)
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
}

// Delete property (Admin only)
export const deletePropertyController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    // Check if property exists
    const existingProperty = await findPropertyById(id)
    if (!existingProperty) {
      return res.status(404).json({
        success: false,
        error: 'Property not found'
      })
    }

    // Delete property
    await deleteProperty(id)

    return res.json({
      success: true,
      message: 'Property deleted successfully'
    })
  } catch (error) {
    console.error('Property deletion error:', error)
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
} 