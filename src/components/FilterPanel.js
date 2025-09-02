'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import clsx from 'clsx';

const FilterPanel = ({ isOpen, onClose, filterData, onFilter, onReset }) => {
  const [activeMainCategory, setActiveMainCategory] = useState("Adventures");
  const [selectedSubCategories, setSelectedSubCategories] = useState(new Set());

  // Reset the active category when the panel is closed and reopened
  useEffect(() => {
    if (isOpen) {
      setActiveMainCategory("Adventures");
    }
  }, [isOpen]);

  const handleSubCategoryClick = (subCategory) => {
    const newSet = new Set(selectedSubCategories);
    newSet.has(subCategory) ? newSet.delete(subCategory) : newSet.add(subCategory);
    setSelectedSubCategories(newSet);
  };

  const handleApplyFilter = () => {
    onFilter(Array.from(selectedSubCategories));
    onClose();
  };

  const handleFullReset = () => {
    setSelectedSubCategories(new Set());
    onReset();
  };
  
  const panelClasses = clsx(
    'fixed top-0 left-0 w-96 h-full bg-black/80 backdrop-blur-md text-white shadow-2xl z-[1001] flex flex-col transition-transform duration-500 ease-in-out',
    isOpen ? 'translate-x-0' : '-translate-x-full'
  );

  return (
    <div className={panelClasses}>
      {/* Panel Header */}
      <div className="flex justify-between items-center p-4 bg-black/30 border-b border-gray-700">
        <h2 className="text-xl font-bold">Filter Experiences</h2>
        <button onClick={onClose} className="text-3xl">&times;</button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        {/* Main Categories */}
        <div className="p-4 border-b border-gray-700">
            <div className="grid grid-cols-2 gap-2">
                {Object.keys(filterData).map(category => (
                    <button 
                        key={category}
                        className={clsx('p-3 text-center rounded-lg text-sm transition-colors flex items-center justify-center gap-2', {
                            'bg-blue-500/20 font-semibold text-white': activeMainCategory === category,
                            'bg-white/5 hover:bg-white/10': activeMainCategory !== category
                        })}
                        onClick={() => setActiveMainCategory(category)}
                    >
                        { { "Adventures": "🛍️", "Workshops": "✨", "Food": "🍽️", "Monuments": "🏛️" }[category] || '📍' }
                        {category}
                    </button>
                ))}
            </div>
        </div>
        
        {/* Sub Categories */}
        <div className="flex-1 p-4 space-y-2 overflow-y-auto">
            {(filterData[activeMainCategory] || []).map(subCategory => (
                <div key={subCategory} 
                    className={clsx('p-3 rounded-md cursor-pointer flex items-center justify-between transition-colors', {
                        'bg-blue-500/20 text-cyan-300 font-semibold': selectedSubCategories.has(subCategory),
                        'hover:bg-white/10': !selectedSubCategories.has(subCategory)
                    })}
                    onClick={() => handleSubCategoryClick(subCategory)}>
                    <span>{subCategory}</span>
                    {selectedSubCategories.has(subCategory) && <span className="text-cyan-300">✓</span>}
                </div>
            ))}
        </div>
      </div>

      {/* Panel Footer */}
      <div className="p-4 bg-black/30 border-t border-gray-700 flex justify-end gap-3">
        <button 
            className="px-4 py-2 text-sm border border-gray-500 rounded-md hover:bg-gray-700 transition-colors"
            onClick={handleFullReset}
        >
            Reset
        </button>
        <button 
            className="px-4 py-2 text-sm bg-blue-600 rounded-md hover:bg-blue-500 transition-colors"
            onClick={handleApplyFilter}
        >
            Apply Filters
        </button>
      </div>
    </div>
  );
};

export default FilterPanel;