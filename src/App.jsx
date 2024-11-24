import React from 'react';
import QueryWorker from './components/QueryWorker';
import './styles/index.css';

function App() {
  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Translate Contextual
          </h1>
          <QueryWorker />
        </div>
      </div>
    </div>
  );
}

export default App;