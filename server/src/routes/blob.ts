import express from 'express';
import { authMiddleware, requireAdmin } from '../middleware/auth';
import { 
  consoleFiles,
  listBlobs,
  testAzureConnection
} from '../services/blob.service';
import { ApiResponse } from '../types';

const router = express.Router();

/**
 * GET /api/blob/test - Test Azure Blob Storage connection
 */
router.get('/test', authMiddleware, async (req, res) => {
  try {
    const result = await testAzureConnection();
    
    const response: ApiResponse = {
      success: result.success,
      message: result.message,
      statusCode: result.success ? 200 : 500
    };
    
    res.status(response.statusCode || 200).json(response);
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      statusCode: 500
    };
    res.status(500).json(response);
  }
});

/**
 * GET /api/blob/list - List all files in the container
 */
router.get('/list', authMiddleware, async (req, res) => {
  try {
    const result = await listBlobs();
    
    const response: ApiResponse = {
      success: result.success,
      data: result.files,
      message: result.success ? `Found ${result.files?.length || 0} files` : result.error,
      statusCode: result.success ? 200 : 500
    };
    
    res.status(response.statusCode || 200).json(response);
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      statusCode: 500
    };
    res.status(500).json(response);
  }
});

/**
 * GET /api/blob/console - Console log all files (for debugging)
 */
router.get('/console', authMiddleware, requireAdmin, async (req, res) => {
  try {
    await consoleFiles();
    
    const response: ApiResponse = {
      success: true,
      message: 'Files logged to console successfully',
      statusCode: 200
    };
    
    res.status(200).json(response);
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      statusCode: 500
    };
    res.status(500).json(response);
  }
});



export { router as blobRoutes }; 