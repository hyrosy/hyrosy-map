'use client';

import React from 'react';
import styles from '@/app/page.module.css';

const ProductDetail = ({ product, onBack, onAddToCart }) => {
  if (!product) return null;

  return (
    <div>
      <div className={styles.popupContentContainer}>
        {/* In a real app, you would use product.images[0].src here */}
        <div style={{height: '120px', background: '#ccc', borderRadius: '4px', marginBottom: '10px'}}></div>
        <div className={styles.popupTitle}>{product.name}</div>
        <div 
          className={styles.popupCategory} 
          dangerouslySetInnerHTML={{ __html: product.short_description }} 
        />
        <div className={styles.popupTitle} style={{textAlign: 'right'}}>{product.price} €</div>
      </div>
      <div className={styles.popupFooter}>
        <button onClick={onBack} className={`${styles.popupButton} ${styles.btnSecondary}`}>⬅️ Back</button>
        <button onClick={() => onAddToCart(product)} className={`${styles.popupButton} ${styles.btnPrimary}`}>🛒 Add to Cart</button>
      </div>
    </div>
  );
};

export default ProductDetail;