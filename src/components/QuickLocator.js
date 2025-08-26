import React from 'react';
import styles from './QuickLocator.module.css';

const QuickLocator = ({ cities, onCitySelect, onResetView }) => {
  return (
    <div className={styles.locatorPanel}>
      <h3 className={styles.locatorTitle}>Quick Locator</h3>
      <ul className={styles.cityList}>
        <li onClick={onResetView} className={styles.resetView}>
            🇲🇦 View All Morocco
        </li>
        {Object.entries(cities).map(([key, city]) => (
          <li key={key} onClick={() => onCitySelect(key)}>
            {city.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default QuickLocator;