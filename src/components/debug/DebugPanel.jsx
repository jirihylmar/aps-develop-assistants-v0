import React from 'react';

const DebugPanel = ({ 
  debugInfo = {}, // Provide default empty object
  selectedModel = '', 
  onModelChange = () => {}, 
  isDevelopment = true 
}) => {
  if (!isDevelopment) return null;

  // Destructure with default values to prevent undefined errors
  const {
    status = 'Initializing...',
    courseDataLoaded = { status: false, filename: '' },
    apiStats = {
      mode: 'MOCK'
    },
    lastUpdate = ''
  } = debugInfo;

  return (
    <div className="bg-gray-50 rounded-lg p-4 mb-4 text-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-900">Debug Information</h3>
        <span className={`px-2 py-1 text-xs rounded ${apiStats.mode === 'MOCK' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
          {apiStats.mode} MODE
        </span>
      </div>

      <div className="space-y-4">
        {/* Model Selection */}
        <div className="border-b border-gray-200 pb-4">
          <h4 className="font-medium text-gray-700 mb-2">Model Selection</h4>
          <select
            value={selectedModel}
            onChange={(e) => onModelChange(e.target.value)}
            className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="claude-3-haiku-20240307">Claude 3 Haiku - Faster, for simpler tasks</option>
            <option value="claude-3-opus-20240229">Claude 3 Opus - Recommended for complex tasks</option>

          </select>
        </div>

        {/* Status Information */}
        <div>
          <strong>Status:</strong> 
          <span className={`ml-2 ${status.includes('Error') ? 'text-red-600' : 'text-gray-600'}`}>
            {status}
          </span>
        </div>

        {/* Data Loading Status */}
        <div>
          <strong>Data Loaded:</strong>
          <ul className="ml-4 mt-1 space-y-1">
            <li className="flex items-center">
              <span className={`mr-2 ${courseDataLoaded.status ? 'text-green-600' : 'text-red-600'}`}>
                {courseDataLoaded.status ? '✓' : '×'}
              </span>
              Course Data: {courseDataLoaded.filename}
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DebugPanel;