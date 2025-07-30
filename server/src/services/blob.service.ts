import { 
  ContainerClient, 
} from '@azure/storage-blob';
import { Readable } from 'stream';

// Environment variables
const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING || '';
const AZURE_STORAGE_CONTAINER_NAME = process.env.AZURE_STORAGE_CONTAINER_NAME || 'planorobjectfiles';
const AZURE_STORAGE_SAS_URL = process.env.AZURE_STORAGE_SAS_URL || 'https://planorappfiles.blob.core.windows.net/planorobjectfiles?sp=rl&st=2025-07-30T10:30:01Z&se=2025-07-30T18:45:01Z&spr=https&sv=2024-11-04&sr=c&sig=WU9TJfgaycwR1Ggn%2FGRWSwP%2FvtF40vPPnnyw2pjTSuU%3D';

// Lazy initialization of container client
let containerClient: ContainerClient | null = null;

/**
 * Get the Azure Storage container client
 * @returns ContainerClient instance
 */
const getContainerClient = (): ContainerClient => {
  if (!containerClient) {
    if (!AZURE_STORAGE_SAS_URL) {
      throw new Error('Azure Storage SAS URL is required');
    }
    containerClient = new ContainerClient(AZURE_STORAGE_SAS_URL);
  }
  return containerClient;
};

/**
 * Check if Azure Storage is configured
 * @returns boolean indicating if Azure Storage is configured
 */
export const isAzureStorageConfigured = (): boolean => {
  return !!(AZURE_STORAGE_SAS_URL || AZURE_STORAGE_CONNECTION_STRING);
};

// Blob Storage Types
export interface BlobFile {
  name: string;
  size: number;
  lastModified: Date;
  contentType?: string;
  url: string;
}

export interface UploadResult {
  success: boolean;
  blobName?: string;
  url?: string;
  error?: string;
}

export interface DownloadResult {
  success: boolean;
  content?: string | Buffer;
  contentType?: string;
  error?: string;
}

export interface ListBlobsResult {
  success: boolean;
  files?: BlobFile[];
  error?: string;
}

/**
 * List all blobs in the container
 * @returns Promise<ListBlobsResult>
 */
export const listBlobs = async (): Promise<ListBlobsResult> => {
  try {
    const containerClient = getContainerClient();
    const files: BlobFile[] = [];

    console.log(`📁 Listing blobs in container: ${containerClient.containerName}`);

    for await (const blob of containerClient.listBlobsFlat()) {
      const blobClient = containerClient.getBlobClient(blob.name);
      
      files.push({
        name: blob.name,
        size: blob.properties.contentLength || 0,
        lastModified: blob.properties.lastModified || new Date(),
        contentType: blob.properties.contentType,
        url: blobClient.url
      });
    }

    console.log(`✅ Found ${files.length} blobs in container`);
    return { success: true, files };
  } catch (error) {
    console.error('❌ Error listing blobs:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
};

/**
 * Console log all files in the container (simple version)
 * @returns Promise<void>
 */
export const consoleFiles = async (): Promise<void> => {
  try {
    const containerClient = getContainerClient();
    
    console.log(`📁 Files in container: ${containerClient.containerName}`);
    console.log('─'.repeat(50));

    for await (const blob of containerClient.listBlobsFlat()) {
      console.log(`📦 ${blob.name}`);
      console.log(`   Size: ${blob.properties.contentLength || 0} bytes`);
      console.log(`   Type: ${blob.properties.contentType || 'unknown'}`);
      console.log(`   Modified: ${blob.properties.lastModified || 'unknown'}`);
      console.log('─'.repeat(30));
    }

    console.log('✅ File listing completed');
  } catch (error) {
    console.error('❌ Error listing files:', error);
  }
};
/**
 * Test the Azure Blob Storage connection
 * @returns Promise<{ success: boolean; message: string }>
 */
export const testAzureConnection = async (): Promise<{ success: boolean; message: string }> => {
  try {
    if (!isAzureStorageConfigured()) {
      return { success: false, message: 'Azure Storage is not configured' };
    }

    const containerClient = getContainerClient();
    console.log(`🔗 Testing connection to container: ${containerClient.containerName}`);

    // Try to list blobs to test connection
    const result = await listBlobs();
    
    if (result.success) {
      return { 
        success: true, 
        message: `Successfully connected to Azure Blob Storage. Found ${result.files?.length || 0} files.` 
      };
    } else {
      return { success: false, message: result.error || 'Failed to connect to Azure Blob Storage' };
    }
  } catch (error) {
    console.error('❌ Error testing Azure connection:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
};


