import React, { useState } from 'react';
import { saveAs } from 'file-saver';

const MODEL_COSTS = {
  'claude-3-opus-20240229': {
    input: 0.015,
    output: 0.075
  },
  'claude-3-haiku-20240307': {
    input: 0.00025,
    output: 0.00125
  },
  'claude-3-sonnet-20241022': {
    input: 0.003,
    output: 0.015
  }
};

const ResponseHandler = ({ response, debugInfo }) => {
  const [downloadStatus, setDownloadStatus] = useState('');

  const calculateCost = () => {
    if (!response?.payload?.raw?.usage) return '$0.0000';
    
    const { model } = response.payload.raw;
    const { input_tokens, output_tokens } = response.payload.raw.usage;
    
    if (!model || !input_tokens || !output_tokens) return '$0.0000';

    try {
      const modelCosts = MODEL_COSTS[model];
      if (!modelCosts) return '$0.0000';

      const inputCost = (input_tokens / 1000) * modelCosts.input;
      const outputCost = (output_tokens / 1000) * modelCosts.output;
      const totalCost = inputCost + outputCost;

      return `$${totalCost.toFixed(4)}`;

    } catch (error) {
      console.error('Error calculating cost:', error);
      return '$0.0000';
    }
  };

  const handleDownload = () => {
    try {
      const downloadResponse = {
        timestamp: response.timestamp,
        project: "contextual_translation",
        payload: {
          project_id: response.payload.processed.payload.project_id,
          instructions_id: response.payload.processed.payload.instructions_id,
          content: response.payload.processed.payload.content
        },
        system: {
          model: response.payload.raw.model,
          processingTime: response.payload.processed.system.processingTime,
          totalTokens: response.payload.raw.usage.input_tokens + response.payload.raw.usage.output_tokens,
          promptTokens: response.payload.raw.usage.input_tokens,
          completionTokens: response.payload.raw.usage.output_tokens,
          estimatedCost: calculateCost(),
          mode: response.payload.processed.system.mode
        }
      };

      const filename = `response_${response.timestamp.replace(/[:\.]/g, '-')}.json`;
      const blob = new Blob([JSON.stringify(downloadResponse, null, 2)], { type: 'application/json' });
      saveAs(blob, filename);
      setDownloadStatus('Downloaded successfully');
    } catch (error) {
      console.error('Error handling download:', error);
      setDownloadStatus(`Error: ${error.message}`);
    }
  };

  if (!response) return null;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">

      {/* Query Stats */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-sm font-semibold mb-4">Last Query Stats</h3>
        <div className="space-y-2 text-sm">
          <p>Processing Time: {response.payload.processed.system.processingTime}</p>
          <p>Model: {response.payload.raw.model}</p>
          <p>Input Tokens: {response.payload.raw.usage.input_tokens}</p>
          <p>Output Tokens: {response.payload.raw.usage.output_tokens}</p>
          <p>Total Tokens: {response.payload.raw.usage.input_tokens + response.payload.raw.usage.output_tokens}</p>
          <p>Estimated Cost: {calculateCost()}</p>
          <p>Timestamp: {response.timestamp}</p>
        </div>
      </div>

      {/* Download Button */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleDownload}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
          Download Response
        </button>
        {downloadStatus && (
          <span className={`text-sm ${downloadStatus.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>
            {downloadStatus}
          </span>
        )}
      </div>

      {/* Processed Response */}
      <div className="bg-gray-50 p-6 rounded-lg overflow-auto">
        <h3 className="text-sm font-semibold mb-4">Processed Response</h3>
        <pre className="whitespace-pre-wrap font-mono text-sm">
          {JSON.stringify(response.payload.processed, null, 2)}
        </pre>
      </div>

      {/* Complete Claude Response */}
      <div className="bg-gray-100 p-6 rounded-lg overflow-auto border border-gray-200">
        <h3 className="text-sm font-semibold mb-4">Complete Claude API Response</h3>
        <pre className="whitespace-pre-wrap font-mono text-sm">
          {JSON.stringify(response.payload.raw, null, 2)}
        </pre>
      </div>

    </div>
  );
};

export default ResponseHandler;