/**
 * Test Individual Documents Creation
 * This script demonstrates how individual documents are created for each type
 */

// Mock the validateAndTransformData function
const validateAndTransformData = (data, fileName) => {
  const prices = {}
  const typeCounts = {}

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
    const object = item['Project Name'] || objectTypeFromFile
    const count = parseInt(item['Antal']) || 1
    const price = 0

    if (!type || !object) {
      console.warn('Skipping item with missing required fields:', item)
      continue
    }

    // Use only type as the key to aggregate by type
    const key = type

    if (prices[key]) {
      // If same type exists, increase count and sum Antal
      prices[key].count += count
      prices[key].totalPrice = prices[key].price * prices[key].count
      typeCounts[type] = (typeCounts[type] || 0) + count
    } else {
      // Create new entry for this type
      prices[key] = {
        type,
        object,
        count,
        price,
        totalPrice: price * count
      }
      typeCounts[type] = (typeCounts[type] || 0) + count
    }
  }

  return { prices, typeCounts }
}

// Test data (similar to your actual data)
const testData = [
  { 'Typ': '11x13 Fast', 'Project Name': 'NORRGÅRDENSFÖRSKOLA', 'Antal': '5' },
  { 'Typ': '11x13 Fast', 'Project Name': 'NORRGÅRDENSFÖRSKOLA', 'Antal': '6' },
  { 'Typ': '23 x13 Fast', 'Project Name': 'NORRGÅRDENSFÖRSKOLA', 'Antal': '2' },
  { 'Typ': '17x13 Fast', 'Project Name': 'NORRGÅRDENSFÖRSKOLA', 'Antal': '2' },
  { 'Typ': '12x13 Fast', 'Project Name': 'NORRGÅRDENSFÖRSKOLA', 'Antal': '22' },
  { 'Typ': '25 x13 Fast', 'Project Name': 'NORRGÅRDENSFÖRSKOLA', 'Antal': '1' },
  { 'Typ': '6x6 Fast', 'Project Name': 'NORRGÅRDENSFÖRSKOLA', 'Antal': '5' },
  { 'Typ': '11x 4 Fast', 'Project Name': 'NORRGÅRDENSFÖRSKOLA', 'Antal': '2' },
  { 'Typ': '515 x 130 fast', 'Project Name': 'NORRGÅRDENSFÖRSKOLA', 'Antal': '5' }
]

console.log('🧪 Testing Individual Documents Creation')
console.log('========================================\n')

// Process the data
const { prices, typeCounts } = validateAndTransformData(testData, 'Windowschedule.csv')

console.log('📋 Processed Data:')
console.log(JSON.stringify(prices, null, 2))
console.log('')

// Simulate creating individual documents
console.log('📄 Individual Documents to be Created:')
console.log('=====================================')

const pricelistId = '689fb337-566d-4610-899e-a75b394722d6'

for (const [typeKey, priceData] of Object.entries(prices)) {
  // Skip the header row
  if (typeKey === 'Typ') {
    continue
  }

  const document = {
    id: `doc-${Math.random().toString(36).substr(2, 9)}`,
    type: 'price_list',
    name: 'Window Schedule Pricelist',
    isGlobal: false,
    isActive: true,
    effectiveFrom: new Date().toISOString(),
    createdBy: 'user-id',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    buildingId: 'building-id',
    pricelistId: pricelistId,
    prices: {
      [priceData.type]: {
        type: 'window', // Extracted from file name
        object: priceData.type, // The actual type like "11x13 Fast"
        count: priceData.count,
        price: priceData.price,
        totalPrice: priceData.totalPrice
      }
    }
  }

  console.log(`📄 Document ${document.id}:`)
  console.log(`   Type: ${document.prices[priceData.type].type}`)
  console.log(`   Object: ${document.prices[priceData.type].object}`)
  console.log(`   Count: ${document.prices[priceData.type].count}`)
  console.log(`   Price: ${document.prices[priceData.type].price}`)
  console.log('')
}

console.log('✅ Summary:')
console.log(`- Created ${Object.keys(prices).length - 1} individual documents`)
console.log(`- Each document contains one type with its count`)
console.log(`- All documents share the same pricelistId: ${pricelistId}`)
console.log(`- Object type extracted from file name: window`) 