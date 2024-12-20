// server.mjs
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';
import fs from 'fs/promises';

// Get the directory name for ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
dotenv.config();

// At the top of server.mjs
const CONFIG = {
	MODELS: {
	  'claude-3-opus-20240229': {
		maxTokens: 4096,
		version: '2024-02-29'
	  },
	  'claude-3-haiku-20240307': {
		maxTokens: 4096,
		version: '2024-03-07'
	  },
	  'claude-3-sonnet-20241022': {
		maxTokens: 4096,
		version: '2024-10-22'
	  }
	},
	DEFAULT_MODEL: 'claude-3-opus-20240229',
	API_VERSION: '2023-06-01',  // Changed to correct version
	API_ENDPOINT: 'https://api.anthropic.com/v1/messages',
	REQUEST_TIMEOUT: 60000
  };

const app = express();

// CORS configuration with more detailed options
app.use(cors({
  origin: process.env.NODE_ENV === 'development' 
    ? ['http://localhost:3000', 'http://127.0.0.1:3000']
    : process.env.CORS_ORIGIN || 'http://localhost:3000',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400 // 24 hours
}));

app.use(express.json({ limit: '50mb' })); // Increased limit for large requests
app.use(express.static('public'));

// Load instructions at startup
let instructionsText;
try {
  instructionsText = await fs.readFile(path.join(__dirname, 'public', 'instructions.md'), 'utf8');
  console.log('Instructions loaded successfully');
} catch (error) {
  console.error('Error loading instructions:', error);
  instructionsText = ''; // Fallback to empty string if file cannot be loaded
}

// Middleware for API key validation
const validateApiKey = (req, res, next) => {
  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({
      error: 'API key not configured',
      details: process.env.NODE_ENV === 'development' ? 'ANTHROPIC_API_KEY missing in environment' : undefined
    });
  }
  next();
};

// Middleware for request validation
const validateRequest = (req, res, next) => {
  const { query, courseData, model } = req.body;

  if (!query?.trim()) {
    return res.status(400).json({ error: 'Query is required' });
  }

  if (!courseData) {
    return res.status(400).json({ error: 'Course data is required' });
  }

  if (model && !CONFIG.MODELS[model]) {
    return res.status(400).json({ 
      error: 'Invalid model specified',
      validModels: Object.keys(CONFIG.MODELS)
    });
  }

  next();
};

// Test endpoint with enhanced health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    apiKeyConfigured: !!process.env.ANTHROPIC_API_KEY,
    instructionsLoaded: !!instructionsText,
    availableModels: Object.keys(CONFIG.MODELS)
  });
});

// Main query endpoint with error handling and logging
// In server.mjs
// In server.mjs
app.post('/api/query', validateApiKey, validateRequest, async (req, res) => {
	const startTime = Date.now();
	const requestId = Math.random().toString(36).substring(7);
  
	try {
	  const { query, courseData, model = CONFIG.DEFAULT_MODEL } = req.body;
	  
	  // Get model config
	  const modelConfig = CONFIG.MODELS[model];
	  if (!modelConfig) {
		throw new Error(`Invalid model: ${model}`);
	  }
  
	  // Prepare Claude API request
	  const claudeRequest = {
		model: model,
		messages: [{
		  role: 'user',
		  content: `${instructionsText}\n\nQuery: "${query}"\nCourse data: ${JSON.stringify(courseData)}`
		}],
		max_tokens: modelConfig.maxTokens
	  };
  
	  // Log the request for debugging
	  console.log(`[${requestId}] Claude API request:`, JSON.stringify(claudeRequest, null, 2));
	  
	  const response = await fetch(CONFIG.API_ENDPOINT, {
		method: 'POST',
		headers: {
		  'Content-Type': 'application/json',
		  'x-api-key': process.env.ANTHROPIC_API_KEY,  // Changed back to x-api-key
		  'anthropic-version': CONFIG.API_VERSION
		},
		body: JSON.stringify(claudeRequest)
	  });
  
	  // Get error details if present
	  if (!response.ok) {
		const errorData = await response.text();
		console.error(`[${requestId}] Claude API error:`, errorData);
		console.error('Response status:', response.status);
		console.error('Response headers:', response.headers);
		throw new Error(`Claude API call failed with status: ${response.status}. Details: ${errorData}`);
	  }
  
	  const rawClaudeResponse = await response.json();
	  const processingTime = Date.now() - startTime;
  
	  // Log the raw response for debugging
	  console.log(`[${requestId}] Raw Claude Response:`, JSON.stringify(rawClaudeResponse, null, 2));
  
	  // Parse any JSON content from Claude's response
	  let parsedContent;
	  try {
		parsedContent = rawClaudeResponse.content[0]?.text ? 
		  JSON.parse(rawClaudeResponse.content[0].text) : null;
	  } catch (e) {
		console.error('Error parsing Claude content:', e);
		parsedContent = rawClaudeResponse;
	  }
  
	  // Enhanced response including raw Claude response
	  const enhancedResponse = {
		raw: rawClaudeResponse,  // Complete raw response
		processed: {
		  timestamp: new Date().toISOString(),
		  project: "contextual_translation",
		  payload: parsedContent,
		  system: {
			model: model,
			processingTime: `${processingTime.toFixed(2)}ms`,
			totalTokens: rawClaudeResponse.usage?.total_tokens || 'N/A',
			promptTokens: rawClaudeResponse.usage?.input_tokens,
			completionTokens: rawClaudeResponse.usage?.output_tokens,
			mode: process.env.NODE_ENV === 'development' ? 'MOCK' : 'API'
		  }
		}
	  };
  
	  res.json(enhancedResponse);
  
	} catch (error) {
	  console.error(`[${requestId}] Server error:`, error);
	  res.status(500).json({
		error: error.message,
		requestId,
		timestamp: new Date().toISOString()
	  });
	}
  });
// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred',
    timestamp: new Date().toISOString()
  });
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`
Server Configuration:
- Environment: ${process.env.NODE_ENV || 'development'}
- Port: ${PORT}
- API Key present: ${!!process.env.ANTHROPIC_API_KEY}
- Instructions loaded: ${!!instructionsText}
- Available models: ${Object.keys(CONFIG.MODELS).join(', ')}
- CORS origin: ${process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : process.env.CORS_ORIGIN || 'http://localhost:3000'}
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});