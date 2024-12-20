// src/utils/modelUtils.js
import { saveAs } from 'file-saver';

export const MODEL_SELECTION = {
  OPUS: {
    id: 'claude-3-opus-20240229',
    input_cost: 0.015,   // $0.015 per 1K input tokens
    output_cost: 0.075,  // $0.075 per 1K output tokens
    name: 'Claude 3 Opus',
    description: 'Recommended for complex tasks and highest accuracy'
  },
  HAIKU: {
    id: 'claude-3-haiku-20240307',
    input_cost: 0.00025, // $0.00025 per 1K input tokens
    output_cost: 0.00125, // $0.00125 per 1K output tokens
    name: 'Claude 3 Haiku',
    description: 'Faster, suitable for simpler tasks'
  }
};

export const calculateCost = (model, inputTokens, outputTokens) => {
  const selectedModel = Object.values(MODEL_SELECTION).find(m => m.id === model);
  if (!selectedModel) {
    throw new Error(`Invalid model selection: ${model}`);
  }

  if (typeof inputTokens !== 'number' || typeof outputTokens !== 'number') {
    throw new Error('Token counts must be numbers');
  }

  const inputCost = (inputTokens / 1000) * selectedModel.input_cost;
  const outputCost = (outputTokens / 1000) * selectedModel.output_cost;
  
  return {
    inputCost,
    outputCost,
    totalCost: inputCost + outputCost,
    model: selectedModel.name,
    details: {
      inputTokens,
      outputTokens,
      totalTokens: inputTokens + outputTokens,
      inputRate: `$${selectedModel.input_cost}/1K tokens`,
      outputRate: `$${selectedModel.output_cost}/1K tokens`
    }
  };
};

export const downloadResponse = (response, debugInfo, timestamp) => {
  try {
    const costs = calculateCost(
      debugInfo.apiStats.model,
      parseInt(debugInfo.apiStats.promptTokens),
      parseInt(debugInfo.apiStats.completionTokens)
    );

    // Create comprehensive response object
    const fullResponse = {
      timestamp,
      response_data: response,
      system_info: {
        model: debugInfo.apiStats.model,
        processing_time: debugInfo.apiStats.processingTime,
        tokens: {
          input: debugInfo.apiStats.promptTokens,
          output: debugInfo.apiStats.completionTokens,
          total: debugInfo.apiStats.totalTokens
        },
        costs: {
          input_cost: costs.inputCost.toFixed(4),
          output_cost: costs.outputCost.toFixed(4),
          total_cost: costs.totalCost.toFixed(4),
          rates: {
            input_rate: costs.details.inputRate,
            output_rate: costs.details.outputRate
          }
        },
        mode: debugInfo.apiStats.mode
      },
      debug: {
        status: debugInfo.status,
        course_data_loaded: debugInfo.courseDataLoaded,
        last_update: debugInfo.lastUpdate
      }
    };

    const filename = `contextual_translations_api__response_${timestamp.replace(/[:\.]/g, '-')}.json`;
    const blob = new Blob([JSON.stringify(fullResponse, null, 2)], { type: 'application/json' });
    saveAs(blob, filename);
    return true;
  } catch (error) {
    console.error('Error downloading response:', error);
    return false;
  }
};

export const createMockApi = (model = MODEL_SELECTION.OPUS.id) => {
  return {
    query: async ({ query, courseData, timestamp }) => {
      // Simulate network delay based on model
      await new Promise(resolve => setTimeout(resolve, model === MODEL_SELECTION.OPUS.id ? 2000 : 1000));
      
      const inputTokens = Math.floor(JSON.stringify(query).length * 1.5);
      const outputTokens = 200;
      
      const mockResponse = {
        system: {
          project_id: "contextual_translation",
          instructions_id: "75113270-5027-4f99-9ba0-f0433498dfdb"
        },
        payload: {
          language: "en",
          name_normed: "product_development_and_quality",
          name_code: "prodevandqua",
          name: "Product Development and Quality",
          learning_objectives: "Sample learning objectives for mock response",
          keywords: "mock, test, development, quality",
          top_skills: "Testing, Quality Assurance, Development",
          estimated_hours: 16,
          complexity_level: "Advanced",
          name_prerequisites_module: "Introduction and Environment Setup",
          symbol_name: "Development Process",
          symbol_link: "https://example.com/mock-image.png"
        }
      };

      return {
        model,
        content: [{
          type: 'text',
          text: JSON.stringify(mockResponse)
        }],
        usage: {
          input_tokens: inputTokens,
          output_tokens: outputTokens,
          total_tokens: inputTokens + outputTokens,
          timestamp: timestamp
        }
      };
    }
  };
};