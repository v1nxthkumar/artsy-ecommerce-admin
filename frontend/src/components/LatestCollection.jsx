import React, { useContext, useEffect, useState, useRef } from 'react';
import { ShopContext } from '../context/ShopContext.jsx';
import Title from './Title.jsx';
import ProductItem from './ProductItem.jsx';

const LatestCollection = () => {
  const { products } = useContext(ShopContext);
  const [latestProducts, setLatestProducts] = useState([]);
  const [centerIndex, setCenterIndex] = useState(null);
  const containerRef = useRef(null);

  useEffect(() => {
    setLatestProducts(products.slice(0, 8));
  }, [products]);

  // Detect which product is at center (for mobile slider)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const children = Array.from(container.children);
      const containerRect = container.getBoundingClientRect();
      const containerCenterX = containerRect.left + containerRect.width / 2;

      let closestIdx = null;
      let minDistance = Infinity;

      children.forEach((child, idx) => {
        const rect = child.getBoundingClientRect();
        const childCenterX = rect.left + rect.width / 2;
        const dist = Math.abs(childCenterX - containerCenterX);
        if (dist < minDistance) {
          minDistance = dist;
          closestIdx = idx;
        }
      });

      setCenterIndex(closestIdx);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // run once on mount

    return () => container.removeEventListener('scroll', handleScroll);
  }, [latestProducts]);

  return (
    <section className="px-4 md:px-8">
      {/* Header */}
      <div className="text-center text-3xl">
        <Title
          lead="New Arrivals"
          headline="Latest Collection"
          subline="Your Signature Look Starts Here"
        />
      </div>

      {/* Products Grid for Desktop */}
      <div className="hidden md:grid grid-cols-4 gap-3 sm:gap-4 md:gap-4">
        {latestProducts.map((item, index) => (
          <div key={index} className="hover:scale-[1.02] transition-transform duration-300">
            <ProductItem
              id={item._id}
              name={item.name}
              image={item.image}
              price={item.price}
              subCategory={item.subCategory}
            />
          </div>
        ))}
      </div>

      {/* Products Slider for Mobile */}
      <div
        ref={containerRef}
        className="md:hidden flex overflow-x-auto scroll-smooth snap-x snap-mandatory px-6 space-x-4"
      >
        {latestProducts.map((item, index) => {
          const isCenter = index === centerIndex;
          return (
            <div
              key={index}
              className={`flex-shrink-0 w-[80%] snap-center transition-transform duration-300 ease-in-out ${isCenter ? 'scale-100 opacity-100' : 'scale-90 opacity-70'
                }`}
            >
              <ProductItem
                id={item._id}
                name={item.name}
                image={item.image}
                price={item.price}
                subCategory={item.subCategory}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default LatestCollection;
