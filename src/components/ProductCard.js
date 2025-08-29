// src/components/ProductCard.js
'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './ProductCard.module.css';

const ProductCard = ({ product, onAddToCart }) => {
  // Use a placeholder image if the product doesn't have one
  const imageUrl = product.images?.[0]?.src || '/placeholder.png';

  return (
    <div className={styles.cardWrapper}>
      <Link href={`/product/${product.id}`} className={styles.cardLink}>
        <div className={styles.imageContainer}>
          <Image
            src={imageUrl}
            alt={product.name || 'Product Image'}
            fill
            className={styles.productImage}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
        <div className={styles.productInfo}>
          <h3 className={styles.productName}>{product.name}</h3>
          <p className={styles.productPrice}>{product.price} €</p>
        </div>
      </Link>
      <button onClick={() => onAddToCart(product)} className={styles.addToCartButton}>
        Add to Cart
      </button>
    </div>
  );
};

export default ProductCard;