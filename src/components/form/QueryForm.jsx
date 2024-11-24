import React from 'react';

const QueryForm = ({ query, setQuery, loading, courseData, handleSubmit }) => {
  return (
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
  );
};

export default QueryForm;