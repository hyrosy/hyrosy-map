// app/components/LocationPopup.js
'use client'; // This is a client component since it uses state
import { useState } from 'react';
import './LocationPopup.css'; // We'll create this CSS file next

export default function LocationPopup({ location, products }) {
  const [selectedProduct, setSelectedProduct] = useState(null);

  // If a product is selected, show the product detail view
  if (selectedProduct) {
    return (
      <div className="custom-popup">
        <div className="popup-content">
          <button className="back-button" onClick={() => setSelectedProduct(null)}>
            &larr; Back to {location.title.rendered}
          </button>
          <img src={selectedProduct.images[0]?.src} alt={selectedProduct.name} className="popup-image" />
          <h4 className="product-title">{selectedProduct.name}</h4>
          <div className="product-description" dangerouslySetInnerHTML={{ __html: selectedProduct.description }} />
          <p className="product-price">{selectedProduct.price} $</p>
          <button className="add-to-cart-button">Add to Cart</button>
        </div>
      </div>
    );
  }

  // Otherwise, show the main location view
  return (
    <div className="custom-popup">
      <img src={location.fimg_url} alt={location.title.rendered} className="popup-image" />
      <div className="popup-content">
        <h3 className="popup-title">{location.title.rendered}</h3>
        <div className="popup-description" dangerouslySetInnerHTML={{ __html: location.content.rendered }} />
        
        <div className="products-section">
          <h4>Products</h4>
          <ul className="products-list">
            {products.map((product) => (
              <li key={product.id} onClick={() => setSelectedProduct(product)}>
                <span>{product.name}</span>
                <span>{product.price} $</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}