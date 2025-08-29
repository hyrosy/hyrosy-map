'use client';

import React from 'react';
import { cn } from "@/lib/utils"; // cn is a utility from shadcn for merging class names

const CategorySidebar = ({ categories, selectedCategory, onSelectCategory }) => {
  const baseItemClasses = "w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors";
  const activeItemClasses = "bg-gray-100 text-gray-900";
  const inactiveItemClasses = "text-gray-600 hover:bg-gray-50 hover:text-gray-900";

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-800 px-3">Categories</h2>
      <ul className="space-y-1">
        <li>
          <button
            onClick={() => onSelectCategory(null)}
            className={cn(baseItemClasses, !selectedCategory ? activeItemClasses : inactiveItemClasses)}
          >
            All Products
          </button>
        </li>
        {categories.map((category) => (
          <li key={category.id}>
            <button
              onClick={() => onSelectCategory(category.id)}
              className={cn(baseItemClasses, selectedCategory === category.id ? activeItemClasses : inactiveItemClasses)}
            >
              {category.name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CategorySidebar;