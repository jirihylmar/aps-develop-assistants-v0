// src/components/QueryWorker.jsx
import React, { useState, useEffect } from 'react';
import DebugPanel from './debug/DebugPanel';
import ResponseHandler from './form/ResponseHandler';
import { MODEL_SELECTION, createMockApi } from '../utils/modelUtils';

  const CONFIG = {
  DEVELOPMENT: false,
  API_ENDPOINT: 'http://localhost:3001/api/query',
  DEFAULT_MODEL: MODEL_SELECTION.OPUS.id,
  REQUEST_TIMEOUT: 60000,
  FILES: [
    '/data/test_context/course_about__en.json',
    '/data/test_context/course_modules__en.json'
  ]
};

const QueryWorker = () => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedModel, setSelectedModel] = useState(CONFIG.DEFAULT_MODEL);
  const [courseData, setCourseData] = useState(null);
  const [debugInfo, setDebugInfo] = useState({
    status: 'Initializing...',
    courseDataLoaded: { status: false, filename: '' },
    lastUpdate: null,
    apiStats: {
      mode: CONFIG.DEVELOPMENT ? 'MOCK' : 'API',
      processingTime: 'N/A',
      model: CONFIG.DEFAULT_MODEL,
      promptTokens: 'N/A',
      completionTokens: 'N/A',
      totalTokens: 'N/A',
      estimatedCost: 'N/A',
      timestamp: new Date().toISOString()
    }
  });

  const mockApi = React.useMemo(() => createMockApi(selectedModel), [selectedModel]);

  useEffect(() => {
    const loadKnowledgeBase = async () => {
      setDebugInfo(prev => ({ ...prev, status: 'Loading knowledge base...' }));
      
      try {
        const knowledgeBase = {};
        
        // Load each JSON file
        for (const filePath of CONFIG.FILES) {
          try {
            console.log(`Loading file: ${filePath}`);
            const response = await fetch(filePath);
            
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const content = await response.json();
            const fileName = filePath.split('/').pop();
            knowledgeBase[fileName] = content;
            console.log(`Successfully loaded: ${fileName}`);
            
          } catch (err) {
            console.error(`Error loading ${filePath}:`, err);
            throw new Error(`Failed to load ${filePath}: ${err.message}`);
          }
        }
        
        if (Object.keys(knowledgeBase).length === 0) {
          throw new Error('No knowledge base files could be loaded');
        }

        console.log('Successfully loaded knowledge base:', knowledgeBase);
        setCourseData(knowledgeBase);
        
        setDebugInfo(prev => ({
          ...prev,
          status: 'Knowledge base loaded successfully',
          courseDataLoaded: { 
            status: true, 
            filename: `${Object.keys(knowledgeBase).length} files loaded: ${
              Object.keys(knowledgeBase)
                .join(', ')
            }`
          },
          lastUpdate: new Date().toISOString()
        }));
      } catch (err) {
        console.error('Error loading knowledge base:', err);
        setError(`Failed to load knowledge base: ${err.message}`);
        setDebugInfo(prev => ({
          ...prev,
          status: `Error: ${err.message}`,
          lastUpdate: new Date().toISOString()
        }));
      }
    };

    loadKnowledgeBase();
  }, []);

  const processApiResponse = (data, startTime, queryTimestamp) => {
    const endTime = Date.now();
    const processingTime = endTime - startTime;

    let payload;
    try {
      // Handle different response formats
      if (data.content?.[0]?.text) {
        payload = typeof data.content[0].text === 'string' 
          ? JSON.parse(data.content[0].text) 
          : data.content[0].text;
      } else if (data.payload) {
        payload = data.payload;
      } else {
        payload = data;
      }
    } catch (err) {
      console.error('Error parsing response:', err);
      payload = data;
    }

    return {
      timestamp: queryTimestamp,
      project: "contextual_translation",
      payload: payload,
      system: {
        model: selectedModel,
        processingTime: `${processingTime.toFixed(2)}ms`,
        totalTokens: data.usage?.total_tokens || data.system?.totalTokens || 'N/A',
        promptTokens: data.usage?.input_tokens || data.system?.promptTokens || 'N/A',
        completionTokens: data.usage?.output_tokens || data.system?.completionTokens || 'N/A',
        estimatedCost: `$${((data.usage?.input_tokens || 0) * 0.00025 + (data.usage?.output_tokens || 0) * 0.00125).toFixed(4)}`,
        mode: CONFIG.DEVELOPMENT ? 'MOCK' : 'API'
      }
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!courseData) {
      setError('Knowledge base not loaded');
      return;
    }

    setLoading(true);
    setError('');
    setResponse(null);
    
    const startTime = Date.now();
    const queryTimestamp = new Date(startTime).toISOString();
    
    setDebugInfo(prev => ({
      ...prev,
      status: `Processing query using ${CONFIG.DEVELOPMENT ? 'MOCK' : 'API'}...`,
      lastUpdate: queryTimestamp
    }));

    try {
      let data;

      if (CONFIG.DEVELOPMENT) {
        data = await mockApi.query({
          query,
          courseData,
          model: selectedModel,
          timestamp: queryTimestamp
        });
      } else {
        const response = await fetch(CONFIG.API_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query,
            courseData,
            model: selectedModel,
          }),
          signal: AbortSignal.timeout(CONFIG.REQUEST_TIMEOUT)
        });

        if (!response.ok) {
          const errorData = await response.text();
          throw new Error(`API Error: ${errorData}`);
        }

        data = await response.json();
      }

      const formattedResponse = processApiResponse(data, startTime, queryTimestamp);
      
      setResponse(formattedResponse);
      setDebugInfo(prev => ({
        ...prev,
        status: `Query processed successfully using ${CONFIG.DEVELOPMENT ? 'MOCK' : 'API'}`,
        apiStats: {
          ...formattedResponse.system,
          timestamp: queryTimestamp
        },
        lastUpdate: queryTimestamp
      }));
    } catch (err) {
      console.error('Error processing query:', err);
      const errorMessage = err.name === 'AbortError' 
        ? 'Request timed out. Please try again.' 
        : !navigator.onLine 
          ? 'No internet connection. Please check your network.'
          : err.message;
      
      setError(errorMessage);
      setDebugInfo(prev => ({
        ...prev,
        status: `Error in ${CONFIG.DEVELOPMENT ? 'MOCK' : 'API'}: ${errorMessage}`,
        lastUpdate: queryTimestamp
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-5">
      <div className="space-y-6">
        <DebugPanel 
          debugInfo={debugInfo}
          selectedModel={selectedModel}
          onModelChange={setSelectedModel}
          isDevelopment={true} // Always show debug panel
        />
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <form onSubmit={handleSubmit} className="p-4">
            <div className="mb-4">
              <label htmlFor="query" className="block text-sm font-medium text-gray-700 mb-2">
                Enter your query
              </label>
              <textarea
                id="query"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Type your query here..."
              />
            </div>
            <button 
              type="submit" 
              disabled={loading || !query.trim() || !courseData}
              className={`w-full py-2 px-4 rounded-md text-white font-medium
                ${loading || !query.trim() || !courseData 
                  ? 'bg-gray-300 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                }`}
            >
              {loading ? 'Processing...' : 'Submit Query'}
            </button>
          </form>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        )}

        {response && <ResponseHandler response={response} debugInfo={debugInfo} />}
      </div>
    </div>
  );
};

export default QueryWorker;