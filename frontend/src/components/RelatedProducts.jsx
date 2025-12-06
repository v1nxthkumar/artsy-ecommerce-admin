import React, { useContext, useEffect, useState, useRef } from 'react';
import { ShopContext } from '../context/ShopContext.jsx';
import Title from './Title.jsx';
import ProductItem from './ProductItem.jsx';

const RelatedProducts = ({ category, subCategory }) => {
  const { products } = useContext(ShopContext);
  const [related, setRelated] = useState([]);
  const [centerIndex, setCenterIndex] = useState(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!products.length) return;

    const filtered = products.filter((item) => {
      const sameCategory = item.category === category;
      const sameSubCategory = subCategory
        ? item.subCategory === subCategory
        : true;
      return sameCategory && sameSubCategory;
    });

    setRelated(filtered.slice(0, 8)); // allow up to 8 for scrolling
  }, [products, category, subCategory]);

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
  }, [related]);

  if (!products.length) {
    return (
      <section className="my-20 px-4 md:px-8 text-center">
        <p className="text-gray-500">Loading related products…</p>
      </section>
    );
  }

  if (!related.length) {
    return (
      <section className="px-4 md:px-8 text-center">
        <Title
          lead="You May Also Like"
          headline="Related Products"
          subline="Handpicked Just for You"
        />
        <p className="text-gray-500 mt-4">No similar products found.</p>
      </section>
    );
  }

  return (
    <section className="px-4 md:px-8">
      {/* Header */}
      <div className="text-center text-3xl">
        <Title
          lead="You May Also Like"
          headline="Related Products"
          subline="Handpicked Just for You"
        />
      </div>

      {/* Desktop grid */}
      <div className="hidden md:grid grid-cols-4 gap-3 sm:gap-4 md:gap-4">
        {related.map((item) => (
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
        {related.map((item, index) => {
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
                slug={item.slug}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default RelatedProducts;
