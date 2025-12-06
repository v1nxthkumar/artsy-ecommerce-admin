import React, { useContext, useEffect, useState, useRef } from 'react';
import { ShopContext } from '../context/ShopContext.jsx';
import Title from './Title.jsx';
import ProductItem from './ProductItem.jsx';

const BestSeller = () => {
  const { products } = useContext(ShopContext);
  const [bestSeller, setBestSeller] = useState([]);
  const [centerIndex, setCenterIndex] = useState(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const bestProduct = products.filter(item => item.bestseller);
    setBestSeller(bestProduct.slice(0, 8)); // show up to 8 like LatestCollection
  }, [products]);

  // Detect which product is centered
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
    handleScroll();

    return () => container.removeEventListener('scroll', handleScroll);
  }, [bestSeller]);

  return (
    <section className="px-4 md:px-10">
      {/* Header */}
      <div className="text-center text-3xl">
        <Title
          lead="Highly Coveted"
          headline="Best Sellers"
          subline="Flying Off the Shelves"
        />
      </div>

      {/* Desktop grid */}
      <div className="hidden md:grid grid-cols-4 gap-3 sm:gap-4 md:gap-4">
        {bestSeller.map((item, index) => (
          <div
            key={index}
            className="hover:scale-[1.02] transition-transform duration-300"
          >
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

      {/* Mobile slider with center highlight */}
      <div
        ref={containerRef}
        className="md:hidden flex overflow-x-auto scroll-smooth snap-x snap-mandatory px-6 space-x-4"
      >
        {bestSeller.map((item, index) => {
          const isCenter = index === centerIndex;
          return (
            <div
              key={index}
              className={`flex-shrink-0 w-[80%] snap-center transition-transform duration-300 ease-in-out ${
                isCenter ? 'scale-100 opacity-100' : 'scale-90 opacity-70'
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

export default BestSeller;
