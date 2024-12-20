// PageLayout.jsx

import React from 'react';
import Header from './Header';
import Footer from './Footer';
import QueryWorker from '../QueryWorker';

const PageLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white rounded-lg shadow">
            <div className="px-4 py-5 sm:p-6">
              <QueryWorker />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PageLayout;
