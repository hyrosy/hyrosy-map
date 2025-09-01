'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import ProductDetail from './ProductDetail';


const PinDetailsModal = ({ pin, onClose, onAddToCart }) => {
  const [viewedProduct, setViewedProduct] = useState(null);
  const [modalProducts, setModalProducts] = useState({ status: 'idle', data: [] });

  useEffect(() => {
    // Reset when the pin changes
    setViewedProduct(null);

    if (pin && (pin.acf.category_connector_id || pin.acf.connector_id)) {
      const fetchProducts = async () => {
        setModalProducts({ status: 'loading', data: [] });
        const wooApiUrl = pin.acf.category_connector_id
          ? `https://www.hyrosy.com/wp-json/wc/v3/products?category=${pin.acf.category_connector_id}`
          : `https://www.hyrosy.com/wp-json/wc/v3/products/${pin.acf.connector_id}`;
        const authString = btoa(`${process.env.NEXT_PUBLIC_WOOCOMMERCE_KEY}:${process.env.NEXT_PUBLIC_WOOCOMMERCE_SECRET}`);
        try {
          const response = await fetch(wooApiUrl, { headers: { 'Authorization': `Basic ${authString}` } });
          let products = await response.json();
          setModalProducts({ status: 'success', data: Array.isArray(products) ? products : [products] });
        } catch (error) {
          console.error("Failed to fetch WooCommerce products:", error);
          setModalProducts({ status: 'error', data: [] });
        }
      };
      fetchProducts();
    } else {
      setModalProducts({ status: 'idle', data: [] });
    }
  }, [pin]);

  if (!pin) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-40 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold">{viewedProduct ? viewedProduct.name : pin.title.rendered}</h2>
          <button className="text-2xl text-gray-500 hover:text-gray-800" onClick={onClose}>&times;</button>
        </div>
        <div className="p-6 flex-1 overflow-y-auto">
          {viewedProduct ? (
            <ProductDetail 
              product={viewedProduct}
              onAddToCart={onAddToCart}
              onBack={() => setViewedProduct(null)}
            />
          ) : (
            <div>
              {pin.acf.featured_image?.url && (
                <Image src={pin.acf.featured_image.url} alt={pin.title.rendered} width={450} height={200} className="w-full h-48 object-cover rounded-md mb-4" />
              )}
              <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: pin.content.rendered }} />
              <div className="mt-4 pt-4 border-t">
                {/* Product loading and listing logic */}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PinDetailsModal;