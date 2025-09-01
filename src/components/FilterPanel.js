'use client';

import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const FilterPanel = ({ isOpen, onClose, filterData, onFilter, onReset }) => {
  const [activeMainCategory, setActiveMainCategory] = useState("Adventures");
  const [selectedSubCategories, setSelectedSubCategories] = useState(new Set());

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

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle>Filter Experiences</SheetTitle>
        </SheetHeader>
        
        <div className="flex flex-1 overflow-y-auto">
          {/* Main Categories */}
          <div className="w-1/3 border-r pr-2 space-y-1">
            {Object.keys(filterData).map(category => (
              <button key={category} 
                className={`w-full p-2 text-left rounded-md text-sm ${activeMainCategory === category ? 'bg-gray-100 font-semibold' : ''}`}
                onClick={() => setActiveMainCategory(category)}>
                {category}
              </button>
            ))}
                    </div>
                    {/* Sub Categories */}
                    <div className="w-2/3 pl-4 space-y-1">
                      {filterData[activeMainCategory] && filterData[activeMainCategory].map(subCategory => (
                        <button
                          key={subCategory}
                          className={`w-full p-2 text-left rounded-md text-sm ${selectedSubCategories.has(subCategory) ? 'bg-blue-100 font-semibold' : ''}`}
                          onClick={() => handleSubCategoryClick(subCategory)}
                        >
                          {subCategory}
                        </button>
                      ))}
                    </div>
                  </div>
                  <SheetFooter className="mt-4 flex justify-between">
                    <Button variant="outline" onClick={handleFullReset}>Reset</Button>
                    <Button onClick={handleApplyFilter}>Apply</Button>
                  </SheetFooter>
                </SheetContent>
              </Sheet>
            );
          };
          
          export default FilterPanel;