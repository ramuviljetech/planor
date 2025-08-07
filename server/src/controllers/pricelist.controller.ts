import { Request, Response } from 'express'
import { ApiResponse, PriceList, PriceItem, AuthenticatedRequest } from '../types'
import { 
  createPriceItem,
  checkExistingPriceItem,
  findPricelistById, 
  updatePricelist, 
  deletePricelist,
  getPricelistsWithFilters,
 
} from '../entities/pricelist.entity'
import { v4 as uuidv4 } from 'uuid'
import { 
  isAzureStorageConfigured, 
  getAzureStorageConfig, 
  testAzureStorageConnection 
} from '../config/azure-storage'

/**
 * Pricelist Controller
 * 
 * This controller handles pricelist operations including:
 * - Creating pricelists from Azure blob storage files (JSON/CSV)
 * - Supporting both public and private blob access via SAS tokens
 * - CRUD operations for pricelist management
 * 
 * Azure Storage Blob SDK Usage:
 * - For public blobs: Use blobUrl directly
 * - For private blobs: Include sasToken in request body
 * - SAS token format: sv=2020-08-04&st=...&se=...&sp=r&sig=...
 * - Uses official Azure Storage Blob SDK for robust blob access
 */

// Helper function to extract data from Azure blob URL using Azure Storage Blob SDK
const extractDataFromBlobUrl = async (blobUrl: string, sasToken?: string, fileName?: string): Promise<any[]> => {
  try {
    // Check if Azure Storage is configured
    if (!isAzureStorageConfigured()) {
      throw new Error('Azure Storage is not configured. Please check your environment variables.')
    }
    
    // Parse the blob URL to extract container and blob name
    const url = new URL(blobUrl)
    const pathParts = url.pathname.split('/').filter(part => part.length > 0)
    
    if (pathParts.length < 2) {
      throw new Error('Invalid blob URL format. Expected: https://account.blob.core.windows.net/container/blob-path')
    }
    
    const containerName = pathParts[0]
    const blobName = pathParts.slice(1).join('/') // Handle nested paths like "Files/Areaschedule.csv"
    
    console.log(`Extracting data from container: ${containerName}, blob: ${blobName}`)
    
    // Get Azure Storage configuration
    const config = getAzureStorageConfig()
    
    // Create blob service client
    const { createBlobServiceClient } = await import('../config/azure-storage')
    const blobServiceClient = createBlobServiceClient()
    
    // Get container client
    const containerClient = blobServiceClient.getContainerClient(containerName)
    
    // Get blob client
    const blobClient = containerClient.getBlobClient(blobName)
    
    // Download the blob content
    const downloadResponse = await blobClient.download()
    
    if (!downloadResponse.readableStreamBody) {
      throw new Error('Failed to download blob content')
    }

    // Convert stream to text using a more robust approach
    const chunks: Uint8Array[] = []
    const stream = downloadResponse.readableStreamBody as any
    
    if (stream && typeof stream.getReader === 'function') {
      const reader = stream.getReader()
      
      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          if (value) chunks.push(value)
        }
      } finally {
        reader.releaseLock()
      }
    } else {
      // Fallback: try to read as buffer directly
      const buffer = await streamToBuffer(stream)
      chunks.push(buffer)
    }
    
    const content = new TextDecoder().decode(Buffer.concat(chunks))
    const contentType = downloadResponse.contentType || ''

    let data: any[]

    if (contentType.includes('application/json')) {
      // Handle JSON files
      data = JSON.parse(content) as any[]
    } else if (contentType.includes('text/csv') || contentType.includes('text/plain')) {
      // Handle CSV files
      data = parseCSV(content)
    } else {
      // Try to detect format from content
      if (content.trim().startsWith('[') && content.trim().endsWith(']')) {
        // Likely JSON array
        data = JSON.parse(content) as any[]
      } else if (content.includes(',') && content.includes('\n')) {
        // Likely CSV
        data = parseCSV(content)
        console.log('Parsed data:', data)
      } else {
        throw new Error('Unsupported file format. Please provide JSON or CSV file.')
      }
    }

    return data
  } catch (error) {
    console.error('Error extracting data from blob URL:', error)
    throw error
  }
}

// Helper function to convert stream to buffer
const streamToBuffer = async (stream: any): Promise<Uint8Array> => {
  return new Promise((resolve, reject) => {
    const chunks: Uint8Array[] = []
    
    stream.on('data', (chunk: Uint8Array) => {
      chunks.push(chunk)
    })
    
    stream.on('end', () => {
      resolve(Buffer.concat(chunks))
    })
    
    stream.on('error', (error: any) => {
      reject(error)
    })
  })
}

// Parse CSV data
const parseCSV = (csvText: string, fileName?: string): any[] => {
    console.log('Raw CSV text:', csvText.substring(0, 500) + '...') // Debug: show first 500 chars
    const lines = csvText.trim().split('\n').map(line => line.trim())
  
    const data: any[] = []
    
    // Determine file type from fileName
    let fileType = 'unknown'
    if (fileName) {
      const fileNameLower = fileName.toLowerCase()
      if (fileNameLower.includes('window')) { fileType = 'window' }
      else if (fileNameLower.includes('door')) { fileType = 'door' }
      else if (fileNameLower.includes('floor')) { fileType = 'floor' }
      else if (fileNameLower.includes('wall')) { fileType = 'wall' }
      else if (fileNameLower.includes('roof')) { fileType = 'roof' }
      else if (fileNameLower.includes('area')) { fileType = 'area' }
    }
  
    for (let i = 0; i < lines.length; i++) {
      const entries = Object.entries({ [lines[i]]: lines[i] })
      if (entries.length === 0) continue
  
      // Extract the single key and value from each object (bad CSV parse result)
      const rawLine = entries[0][1]
  
            if (!rawLine) continue

      // Handle both tab and semicolon separators
      let fields: string[]
      if (rawLine.includes('\t')) {
        fields = rawLine.split('\t').map(f => f.trim())
      } else if (rawLine.includes(';')) {
        fields = rawLine.split(';').map(f => f.trim())
      } else {
        continue // Skip lines without proper separators
      }
  
            // Skip if it's a header or empty line
      if (fields.length < 3 || fields.every(f => f === '')) continue

      console.log('Processing fields:', fields) // Debug: show fields being processed
      let item: any = {}
      
      if (fileType === 'floor' || fileType === 'wall' || fileType === 'area') {
        // Floor/Wall/Area structure: Typ;Project Name;Antal;Area;Element ID
        if (fields.length >= 5) {
          const [type, object, count, area, elementId] = fields
          item = {
            Typ: type,
            'Project Name': object,
            Antal: count || '1',
            Level: '', // No level field in this structure
            'Element ID': elementId,
            Area: area || '0'  // Area is in 4th position
          }
        }
      } else if (fileType === 'window' || fileType === 'door') {
        // Window/Door structure: Typ;Project Name;Antal;Level;Element ID (or similar)
        if (fields.length >= 4) {
          const [type, object, count, level, elementId] = fields
          item = {
            Typ: type,
            'Project Name': object,
            Antal: count || '1',
            Level: level,
            'Element ID': elementId,
            Area: '0' // Windows/doors typically don't have area
          }
        }
      } else {
        // Generic structure - try to detect
        if (fields.length >= 4) {
          const [type, object, thirdField, fourthField, elementId] = fields
          // Check if third field is a number (count) or has m² (area)
          const isThirdFieldCount = !isNaN(parseFloat(thirdField))
          const isThirdFieldArea = thirdField.includes('m²')
          const isFourthFieldArea = fourthField && fourthField.includes('m²')
          
          if (isThirdFieldArea) {
            // Area structure: Typ;Project Name;Area;Level;Element ID
            item = {
              Typ: type,
              'Project Name': object,
              Antal: '1',
              Level: fourthField || '',
              'Element ID': elementId,
              Area: thirdField || '0'
            }
          } else if (isFourthFieldArea) {
            // Count + Area structure: Typ;Project Name;Antal;Area;Element ID
            item = {
              Typ: type,
              'Project Name': object,
              Antal: thirdField || '1',
              Level: '',
              'Element ID': elementId,
              Area: fourthField || '0'
            }
          } else if (isThirdFieldCount) {
            // Count structure: Typ;Project Name;Antal;Level;Element ID
            item = {
              Typ: type,
              'Project Name': object,
              Antal: thirdField,
              Level: fourthField || '',
              'Element ID': elementId,
              Area: '0'
            }
          }
        }
      }
      
      if (Object.keys(item).length > 0) {
        console.log('Parsed item:', item) // Debug: show each parsed item
        data.push(item)
      } else {
        console.log('Skipped line - no valid item created:', rawLine)
      }
    }
  
    return data
  }
  
// Validate and transform data
const validateAndTransformData = (data: any[], fileName?: string): { prices: { [key: string]: any }; typeCounts: { [key: string]: number }; typeAreas: { [key: number]: number } } => {
  const prices: { [key: string]: any } = {}
  const typeCounts: { [key: string]: number } = {}
  const typeAreas: { [key: string]: number } = {}

  console.log("data", data);
  console.log("fileName", fileName);
  
  // Extract object type from file name (e.g., "Windowschedule.csv" -> "window")
  let objectTypeFromFile = 'unknown'
  if (fileName) {
    const fileNameLower = fileName.toLowerCase()
    if (fileNameLower.includes('window')) {
      objectTypeFromFile = 'window'
    } else if (fileNameLower.includes('door')) {
      objectTypeFromFile = 'door'
    } else if (fileNameLower.includes('floor')) {
      objectTypeFromFile = 'floor'
    } else if (fileNameLower.includes('wall')) {
      objectTypeFromFile = 'wall'
    } else if (fileNameLower.includes('roof')) {
      objectTypeFromFile = 'roof'
    } else if (fileNameLower.includes('area')) {
      objectTypeFromFile = 'area'
    }
  }
  
  for (const item of data) {
    const type = item['Typ']
    const object = item['Project Name'] || objectTypeFromFile // Use file name object type as fallback
    const count = parseInt(item['Antal']) || 1
    // Handle area values with "m²" suffix like "355,8 m²" or "15,8 m²"
    const areaString = item['Area'] || '0'
    // Remove m² suffix and convert Swedish comma to decimal point
    const cleanAreaString = areaString.replace(/ m²/g, '').replace(',', '.')
    const area = parseFloat(cleanAreaString) || 0
    
    // Debug logging for area parsing
    if (areaString !== '0') {
      console.log(`Area parsing: "${areaString}" -> "${cleanAreaString}" -> ${area}`)
    }
    const price = 0  // Default price is 0

    if (!type || !object) {
      console.warn('Skipping item with missing required fields:', item)
      continue
    }

    // Use only type as the key to aggregate by type
    const key = type

    if (prices[key]) {
      // If same type exists, increase count and sum Antal
      prices[key].count += count
      prices[key].area += area
      prices[key].totalPrice = prices[key].price * prices[key].count
      typeCounts[type] = (typeCounts[type] || 0) + count
      typeAreas[type] = (typeAreas[type] || 0) + area
    } else {
      // Create new entry for this type
      prices[key] = {
        type,
        object,
        count,
        area,
        price,
        totalPrice: price * count
      }
      typeCounts[type] = (typeCounts[type] || 0) + count
      typeAreas[type] = (typeAreas[type] || 0) + area
    }
  }

  return { prices, typeCounts, typeAreas }
}
  

//* POST /api/pricelist - Create a new pricelist from Azure blob URL for a building
export const createPricelistFromBlob = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { buildingId, fileUrl, isActive = true } = req.body

    // Validate required fields
    if (!buildingId || !fileUrl) {
      const response: ApiResponse = {
        success: false,
        error: 'buildingId and fileUrl are required',
        statusCode: 400
      }
      return res.status(400).json(response)
    }

    // Import building entity to check if building exists
    const { findBuildingById, updateBuilding } = await import('../entities/building.entity')

    // Check if building exists
    const building = await findBuildingById(buildingId)
    if (!building) {
      const response: ApiResponse = {
        success: false,
        error: 'Building not found',
        statusCode: 404
      }
      return res.status(404).json(response)
    }

    // Extract data from the blob URL with optional SAS token
    // Extract fileName from fileUrl for parsing context
    const url = new URL(fileUrl)
    const pathParts = url.pathname.split('/').filter(part => part.length > 0)
    const fileName = pathParts.length >= 2 ? pathParts[pathParts.length - 1] : undefined
    
    const extractedData = await extractDataFromBlobUrl(fileUrl, fileName)
    
    if (!extractedData || extractedData.length === 0) {
      const response: ApiResponse = {
        success: false,
        error: 'No valid data found in the blob file',
        statusCode: 400
      }
      return res.status(400).json(response)
    }



    // Validate and transform the extracted data
    const { prices, typeCounts, typeAreas } = validateAndTransformData(extractedData, fileName)

    if (Object.keys(prices).length === 0) {
      const response: ApiResponse = {
        success: false,
        error: 'No valid price data found in the file. Required fields: type, object, count, price',
        statusCode: 400
      }
      return res.status(400).json(response)
    }

    // Create individual documents for each type
    const createdDocuments = []
    const documentDataForMetadata: Array<{document: any, originalData: any, isAreaType: boolean}> = []
    
          // We'll use the created price item's ID as the pricelistId

    // Extract object type from file name
    let objectTypeFromFile = 'unknown'
    if (fileName) {
      const fileNameLower = fileName.toLowerCase()
      if (fileNameLower.includes('window')) {
        objectTypeFromFile = 'window'
      } else if (fileNameLower.includes('door')) {
        objectTypeFromFile = 'door'
      } else if (fileNameLower.includes('floor')) {
        objectTypeFromFile = 'floor'
      } else if (fileNameLower.includes('wall')) {
        objectTypeFromFile = 'wall'
      } else if (fileNameLower.includes('roof')) {
        objectTypeFromFile = 'roof'
      } else if (fileNameLower.includes('area')) {
        objectTypeFromFile = 'area'
      }
    }

    for (const [typeKey, priceData] of Object.entries(prices)) {
      // Skip the header row (Typ, Project Name, etc.)
      if (typeKey === 'Typ') {
        continue
      }

      const typedPriceData = priceData as any
      
      // Determine if this is a floor/wall type that should use area instead of count
      const isAreaType = objectTypeFromFile === 'floor' || objectTypeFromFile === 'wall' || objectTypeFromFile === 'area'|| objectTypeFromFile === 'roof'
      
      // Check if a record with the same type and object already exists in the pricelist container
      const existingRecord = await checkExistingPriceItem(buildingId, objectTypeFromFile, typedPriceData.type)
      
      if (existingRecord) {
        console.log(`Found existing record: ${objectTypeFromFile} - ${typedPriceData.type}, will update building metadata`)
        // Use the existing record's ID as the pricelistId (same type and object)
        existingRecord.pricelistId = existingRecord.id
        // Add existing record to createdDocuments for building metadata update
        createdDocuments.push(existingRecord)
        documentDataForMetadata.push({
          document: existingRecord,
          originalData: typedPriceData,
          isAreaType
        })
        continue // Skip creating new record in pricelist container
      }
      
      const documentData: PriceItem = {
        id: uuidv4(),
        type: objectTypeFromFile, // window, door, floor, etc.
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        // buildingId,
        object: typedPriceData.type, // The actual type like "11x13 Fast"
        price: typedPriceData.price
        // pricelistId will be set to the created document's ID after creation
      }

      // Save individual document to database
      const createdDocument = await createPriceItem(documentData)
      createdDocuments.push(createdDocument)
      documentDataForMetadata.push({
        document: createdDocument,
        originalData: typedPriceData,
        isAreaType
      })
    }

          // Update building metadata with individual price item data
      const buildingMetadata = building.metadata || {}
      let existingPricelistMetadata = building.buildingObjects || {}
      
      // Handle transition from array format to object format
      if (Array.isArray(existingPricelistMetadata)) {
        // Convert old array format to new object format
        const newFormat: Record<string, any[]> = {}
        for (const item of existingPricelistMetadata) {
          const objectTypeKey = `${item.type}s` // e.g., "windows", "doors", "floors"
          if (!newFormat[objectTypeKey]) {
            newFormat[objectTypeKey] = []
          }
          newFormat[objectTypeKey].push(item)
        }
        existingPricelistMetadata = newFormat
      }
      
      // Ensure it's an object with proper typing
      const typedPricelistMetadata = existingPricelistMetadata as Record<string, any[]>
      
      // Initialize objects structure if it doesn't exist
      if (!typedPricelistMetadata[`${objectTypeFromFile}s`]) {
        typedPricelistMetadata[`${objectTypeFromFile}s`] = []
      }
      
      // Add or update pricelist metadata for each document
      for (const { document: createdDocument, originalData, isAreaType } of documentDataForMetadata) {
        const objectTypeKey = `${createdDocument.type}s` // e.g., "windows", "doors", "floors"
        
        // Initialize the array for this object type if it doesn't exist
        if (!typedPricelistMetadata[objectTypeKey]) {
          typedPricelistMetadata[objectTypeKey] = []
        }
        
        const existingIndex = typedPricelistMetadata[objectTypeKey].findIndex((item: any) => 
          item.object === createdDocument.object
        )
        
        if (existingIndex >= 0) {
          // Update existing item - increase count or area
          if (isAreaType) {
            // For area types (floor, wall, roof, area), sum both areas and counts
            const currentArea = Number(typedPricelistMetadata[objectTypeKey][existingIndex].area) || 0
            const newArea = Number(originalData.area || 0)
            typedPricelistMetadata[objectTypeKey][existingIndex].area = currentArea + newArea
            
            const currentCount = Number(typedPricelistMetadata[objectTypeKey][existingIndex].count) || 0
            const newCount = Number(originalData.count || 1)
            typedPricelistMetadata[objectTypeKey][existingIndex].count = currentCount + newCount
            
            console.log(`Updated area and count for ${createdDocument.type} - ${createdDocument.object}: area=${currentArea} + ${newArea} = ${typedPricelistMetadata[objectTypeKey][existingIndex].area}, count=${currentCount} + ${newCount} = ${typedPricelistMetadata[objectTypeKey][existingIndex].count}`)
          } else {
            // For non-area types (doors, windows), sum the counts only
            const currentCount = Number(typedPricelistMetadata[objectTypeKey][existingIndex].count) || 0
            const newCount = Number(originalData.count) || 0
            typedPricelistMetadata[objectTypeKey][existingIndex].count = currentCount + newCount
            console.log(`Updated count for ${createdDocument.type} - ${createdDocument.object}: ${currentCount} + ${newCount} = ${typedPricelistMetadata[objectTypeKey][existingIndex].count}`)
            // Remove area field for count types
            delete typedPricelistMetadata[objectTypeKey][existingIndex].area
          }
          typedPricelistMetadata[objectTypeKey][existingIndex].id = createdDocument.id // Store individual document ID
          typedPricelistMetadata[objectTypeKey][existingIndex].pricelistId = createdDocument.id // Store the pricelist item ID (same type and object)
        } else {
          // Add new item with complete information
          const newItem: any = {
            id: uuidv4(), // Individual document ID
            type: createdDocument.type, // window, door, floor, etc.
            object: createdDocument.object, // The actual type like "6x6 Fast"
            pricelistId: createdDocument.id // Store the pricelist item ID (same type and object)
          }
          
          if (isAreaType) {
            // For area types (floor, wall, roof, area), store both area and count
            newItem.area = Number(originalData.area || 0)
            newItem.count = Number(originalData.count || 1) // Default count to 1 if not provided
            console.log(`Added new area item with count: ${createdDocument.type} - ${createdDocument.object}: area=${newItem.area}, count=${newItem.count}`)
          } else {
            // For non-area types (doors, windows), store count only
            newItem.count = Number(originalData.count)
            console.log(`Added new count item: ${createdDocument.type} - ${createdDocument.object}: ${newItem.count}`)
          }
          
          typedPricelistMetadata[objectTypeKey].push(newItem)
        }
      }

    // Update building with new metadata
    const updatedBuilding = await updateBuilding(buildingId, {
      metadata: {
        ...buildingMetadata
      },
      buildingObjects: typedPricelistMetadata
    })

    const response: ApiResponse = {
      success: true,
      data: {
        documents: createdDocuments,
        building: updatedBuilding,
        typeCounts: typeCounts
      },
      message: `Created ${createdDocuments.length} individual documents for pricelist }" with ${Object.keys(typeCounts).length} types`,
      statusCode: 201
    }

    return res.status(201).json(response)
  } catch (error) {
    console.error('Error creating pricelist from blob:', error)
    
    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      statusCode: 500
    }
    
   return res.status(500).json(response)
  }
}

//* GET /api/pricelist - Get all pricelists
export const getAllPricelistsHandler = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { search, isGlobal, isActive, page, limit } = req.query

    // Build filters
    const filters: any = {}
    // Temporarily disable admin filtering since the data doesn't have createdBy field
    // if (req.user?.role === 'admin' && req.user?.id) {
    //   filters.adminId = req.user.id
    // }
    if (search) filters.search = search as string
    if (isActive !== undefined) filters.isActive = isActive === 'true'
    if (isGlobal !== undefined) filters.isGlobal = isGlobal === 'true'
    if (page) filters.page = parseInt(page as string)
    if (limit) filters.limit = parseInt(limit as string)

    // Get all price items without pagination first to group them
    const { pricelists, total } = await getPricelistsWithFilters({
      ...filters,
      page: undefined, // Remove pagination to get all records for grouping
      limit: undefined
    })

    // Group price items by category (windows, doors, etc.)
    const groupedPriceItems: { [key: string]: any[] } = {}
    
    pricelists.forEach((priceItem: any) => {
      // Each item is a PriceItem with a 'type' field
      const category = priceItem.type
      
      if (category) {
        if (!groupedPriceItems[category]) {
          groupedPriceItems[category] = []
        }
        
        // Add the price item to the appropriate category
        groupedPriceItems[category].push({
          id: priceItem.id,
          type: priceItem.type,
          object: priceItem.object,
          price: priceItem.price,
          buildingId: priceItem.buildingId,
          pricelistId: priceItem.pricelistId,
          isGlobal: priceItem.isGlobal,
          createdAt: priceItem.createdAt,
          updatedAt: priceItem.updatedAt
        })
      }
    })
    
    console.log('Debug: Final grouped categories:', Object.keys(groupedPriceItems))
    console.log('Debug: Total records found:', total)
    console.log('Debug: Records processed:', pricelists.length)

    // Apply pagination to the grouped data if page and limit are provided
    let paginatedGroupedData = groupedPriceItems
    
    if (page && limit) {
      const pageNum = parseInt(page as string) || 1
      const limitNum = parseInt(limit as string) || 10
      const startIndex = (pageNum - 1) * limitNum
      const endIndex = startIndex + limitNum

      paginatedGroupedData = {}
      
      Object.keys(groupedPriceItems).forEach(category => {
        const categoryData = groupedPriceItems[category]
        paginatedGroupedData[category] = categoryData.slice(startIndex, endIndex)
      })
    }

    const response: ApiResponse = {
      success: true,
      data: paginatedGroupedData,
      message: `Found ${total} total price items grouped by categories`,
      statusCode: 200
    }

    res.status(200).json(response)
  } catch (error) {
    console.error('Error getting all pricelists:', error)
    
    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      statusCode: 500
    }
    
    res.status(500).json(response)
  }
}

//* GET /api/pricelist/:id - Get pricelist by ID
export const getPricelistById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params

    const pricelist = await findPricelistById(id)

    if (!pricelist) {
      const response: ApiResponse = {
        success: false,
        error: 'Pricelist not found',
        statusCode: 404
      }
      return res.status(404).json(response)
    }

    const response: ApiResponse = {
      success: true,
      data: pricelist,
      message: 'Pricelist found successfully',
      statusCode: 200
    }

   return res.status(200).json(response)
  } catch (error) {
    console.error('Error getting pricelist by ID:', error)
    
    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      statusCode: 500
    }
    
   return res.status(500).json(response)
  }
}

//* PUT /api/pricelist/:id - Update pricelist
//!can we update multiple pricelists at once? 
export const updatePricelistHandler = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params
    const updateData = req.body

    const existingPricelist = await findPricelistById(id)

    if (!existingPricelist) {
      const response: ApiResponse = {
        success: false,
        error: 'Pricelist not found',
        statusCode: 404
      }
      return res.status(404).json(response)
    }

    const updatedPricelist = await updatePricelist(id, updateData)

    const response: ApiResponse = {
      success: true,
      data: updatedPricelist,
      message: 'Pricelist updated successfully',
      statusCode: 200
    }

   return res.status(200).json(response)
  } catch (error) {
    console.error('Error updating pricelist:', error)
    
    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      statusCode: 500
    }
    
   return res.status(500).json(response)
  }
}

//? DELETE /api/pricelist/:id - Delete pricelist
export const deletePricelistHandler = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params

    const existingPricelist = await findPricelistById(id)

    if (!existingPricelist) {
      const response: ApiResponse = {
        success: false,
        error: 'Pricelist not found',
        statusCode: 404
      }
      return res.status(404).json(response)
    }

    await deletePricelist(id)

    const response: ApiResponse = {
      success: true,
      message: 'Pricelist deleted successfully',
      statusCode: 200
    }

   return res.status(200).json(response)
  } catch (error) {
    console.error('Error deleting pricelist:', error)
    
    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      statusCode: 500
    }
    
   return res.status(500).json(response)
  }
}

//! GET /api/pricelist/test-azure-storage - Test Azure Storage configuration
export const testAzureStorageHandler = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const result = await testAzureStorageConnection()
    
    const response: ApiResponse = {
      success: result.success,
      message: result.message,
      statusCode: result.success ? 200 : 500
    }
    
    return res.status(result.success ? 200 : 500).json(response)
  } catch (error) {
    console.error('Error testing Azure Storage:', error)
    
    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      statusCode: 500
    }
    
    return res.status(500).json(response)
  }
}




