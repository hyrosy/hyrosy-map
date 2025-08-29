// src/components/CategorySidebar.js
'use client';

import React from 'react';
import styles from './CategorySidebar.module.css';

const CategorySidebar = ({ categories, selectedCategory, onSelectCategory }) => {
  return (
    <aside className={styles.sidebar}>
      <h2 className={styles.title}>Categories</h2>
      <ul className={styles.categoryList}>
        <li 
          className={!selectedCategory ? styles.active : ''}
          onClick={() => onSelectCategory(null)}
        >
          All Products
        </li>
        {categories.map((category) => (
          <li
            key={category.id}
            className={selectedCategory === category.id ? styles.active : ''}
            onClick={() => onSelectCategory(category.id)}
          >
            {category.name}
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default CategorySidebar;