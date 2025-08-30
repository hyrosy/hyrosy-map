'use client';

import React from 'react';

// The old CSS module is no longer needed.

const QuickLocator = ({ cities, onCitySelect, onResetView }) => {
  return (
    // We now use Tailwind classes for a modern, centered modal-like panel
    <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur-sm rounded-lg shadow-xl z-50 w-full max-w-xs border">
      <div className="p-4 border-b">
        <h3 className="font-semibold text-gray-800">Quick Locator</h3>
      </div>
      <ul className="p-2">
        <li className="mb-2">
          <button
            onClick={onResetView}
            className="w-full text-left px-3 py-2 rounded-md text-sm font-semibold text-blue-600 hover:bg-gray-100 transition-colors"
          >
            🇲🇦 View All Morocco
          </button>
        </li>
        {Object.entries(cities).map(([key, city]) => (
          <li key={key}>
            <button
              onClick={() => onCitySelect(key)}
              className="w-full text-left px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            >
              {city.name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default QuickLocator;