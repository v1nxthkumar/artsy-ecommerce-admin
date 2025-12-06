import React, { useContext, useEffect, useState, useRef } from 'react';
import { ShopContext } from '../context/ShopContext.jsx';
import Title from './Title.jsx';
import ProductItem from './ProductItem.jsx';

const SpecialForYou = () => {
  const { products, cartItems, wishlistItems } = useContext(ShopContext);
  const [recommended, setRecommended] = useState([]);
  const [centerIndex, setCenterIndex] = useState(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!products.length) return;

    const cartProductIds = Object.keys(cartItems);

    const wishlistProductIds = wishlistItems
      .filter(Boolean)
      .map(item =>
        typeof item === 'string'
          ? item
          : item?._id || item?.productId
      )
      .filter(Boolean);

    const userInterestIds = [...new Set([...cartProductIds, ...wishlistProductIds])];

    const interestPairs = new Set();
    userInterestIds.forEach(id => {
      const product = products.find(p => p._id === id);
      if (product && product.category && product.subCategory) {
        interestPairs.add(`${product.category}|||${product.subCategory}`);
      }
    });

    const recommendations = products.filter(product => {
      if (userInterestIds.includes(product._id)) return false;
      const key = `${product.category}|||${product.subCategory}`;
      return interestPairs.has(key);
    });

    setRecommended(
      recommendations.sort(() => 0.5 - Math.random()).slice(0, 8)
    );
  }, [products, cartItems, wishlistItems]);

  // Detect which product is centered (like LatestCollection)
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
  }, [recommended]);

  if (!recommended.length) return null;

  return (
    <section className="px-4 md:px-8">
      <div className="text-center text-3xl">
        <Title lead="Just In" headline="Signature Picks" subline="Based on Your Style" />
      </div>

      {/* Desktop grid */}
      <div className="hidden md:grid grid-cols-4 gap-3 sm:gap-4 md:gap-4">
        {recommended.map(item => (
          <div
            key={item._id}
            className="hover:scale-[1.02] transition-transform duration-300"
          >
            <ProductItem
              id={item._id}
              name={item.name}
              price={item.price}
              image={item.image}
              subCategory={item.subCategory}
              slug={item.slug}
            />
          </div>
        ))}
      </div>

      {/* Mobile slider with center highlight */}
      <div
        ref={containerRef}
        className="md:hidden flex overflow-x-auto scroll-smooth snap-x snap-mandatory px-6 space-x-4"
      >
        {recommended.map((item, index) => {
          const isCenter = index === centerIndex;
          return (
            <div
              key={item._id}
              className={`flex-shrink-0 w-[80%] snap-center transition-transform duration-300 ease-in-out ${
                isCenter ? 'scale-100 opacity-100' : 'scale-90 opacity-70'
              }`}
            >
              <ProductItem
                id={item._id}
                name={item.name}
                price={item.price}
                image={item.image}
                subCategory={item.subCategory}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default SpecialForYou;
