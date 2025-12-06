import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext.jsx';
import Title from '../components/Title.jsx';
import ProductItem from '../components/ProductItem.jsx';
import { Funnel, X, ChevronDown, ChevronUp } from 'lucide-react';
import { motion } from 'framer-motion';
import Spinner from '../components/Spinner.jsx';

const Collection = () => {
  const { products, search } = useContext(ShopContext);
  const [showFilter, setShowFilter] = useState(false);
  const [category, setCategory] = useState([]);
  const [subCategory, setSubCategory] = useState([]);
  const [showBestSeller, setShowBestSeller] = useState(false);
  const [sortType, setSortType] = useState('relevant');
  const [priceRange, setPriceRange] = useState([599, 9999]);
  const [isPriceFilterActive, setIsPriceFilterActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [expandedFilters, setExpandedFilters] = useState({
    sort: true,
    price: true,
    gender: true,
    kids: true,
    types: true,
    featured: true
  });
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [displayedProducts, setDisplayedProducts] = useState([]);

  const MIN = 599;
  const MAX = 9999;

  // Toggle sections
  const toggleFilterSection = (section) => {
    setExpandedFilters(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Toggle category/subcategory
  const toggleCategory = (e) => {
    const value = e.target.value;
    setCategory(prev => prev.includes(value) ? prev.filter(item => item !== value) : [...prev, value]);
  };
  const toggleSubCategory = (e) => {
    const value = e.target.value;
    setSubCategory(prev => prev.includes(value) ? prev.filter(item => item !== value) : [...prev, value]);
  };
  const toggleBestSeller = () => setShowBestSeller(prev => !prev);

  // Remove filters
  const removeFilter = (type, value) => {
    if (type === 'category') setCategory(prev => prev.filter(item => item !== value));
    if (type === 'subCategory') setSubCategory(prev => prev.filter(item => item !== value));
  };

  // Apply filters
  const applyFilters = () => {
    let result = [...products];

    if (search.trim() !== '') {
      result = result.filter(item => item.name.toLowerCase().includes(search.toLowerCase()));
    }
    if (category.length > 0) result = result.filter(item => category.includes(item.category));
    if (subCategory.length > 0) result = result.filter(item => subCategory.includes(item.subCategory));
    if (showBestSeller) result = result.filter(item => item.bestseller === true);
    if (isPriceFilterActive) result = result.filter(item => item.price >= priceRange[0] && item.price <= priceRange[1]);

    setFilteredProducts(result);
    setDisplayedProducts(result);
  };

  const sortProducts = () => {
    let sorted = [...filteredProducts];
    switch (sortType) {
      case 'low-high':
        sorted.sort((a, b) => a.price - b.price);
        break;
      case 'high-low':
        sorted.sort((a, b) => b.price - a.price);
        break;
      case 'bestseller': // Popularity
        sorted.sort((a, b) => (b.bestseller === true ? 1 : 0) - (a.bestseller === true ? 1 : 0));
        break;
      case 'latest': // Latest Collection
        sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      default:
        sorted = [...filteredProducts].sort(() => Math.random() - 0.5);
    }
    setDisplayedProducts(sorted);
  };


  // Effects
  useEffect(() => { applyFilters(); }, [category, subCategory, showBestSeller, priceRange, products, search]);
  useEffect(() => { sortProducts(); }, [filteredProducts, sortType]);
  useEffect(() => {
    const handleLoad = () => setLoading(false);
    if (document.readyState === 'complete') handleLoad();
    else window.addEventListener('load', handleLoad);
    return () => window.removeEventListener('load', handleLoad);
  }, []);
  useEffect(() => {
    const isMobile = window.innerWidth < 1024;
    document.body.style.overflow = showFilter && isMobile ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [showFilter]);

  if (loading) return <div className="flex items-center justify-center h-screen bg-white"><Spinner /></div>;

  return (
    <div className="flex flex-col lg:flex-row gap-6 px-4 sm:px-6 lg:px-8 min-h-screen relative z-0">

      {/* Mobile Backdrop */}
      {showFilter && <div className="fixed inset-0 bg-black bg-opacity-30 z-30 lg:hidden" onClick={() => setShowFilter(false)} />}

      {/* Filter Sidebar */}
      <div className={`
        fixed inset-0 z-40 bg-white p-5 transform transition-transform duration-300 ease-in-out
        ${showFilter ? 'translate-x-0' : 'translate-x-full'}
        lg:fixed lg:top-20 lg:left-8 lg:h-[calc(100vh-5rem)] lg:w-72 lg:overflow-y-auto
        ${!showFilter && 'hidden lg:block lg:hidden'}
      `}>

        {/* Sort Section */}
        <div className="mb-6">
          <div className="flex justify-between items-center cursor-pointer mb-3" onClick={() => toggleFilterSection('sort')}>
            <h3 className="text-sm font-semibold text-gray-800">Sort By</h3>
            {expandedFilters.sort ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>
          {expandedFilters.sort && (
            <div className="space-y-2">
              {[
                { label: 'Relevance', value: 'relevant' },
                { label: 'Low to High', value: 'low-high' },
                { label: 'High to Low', value: 'high-low' },
                { label: 'Popularity', value: 'bestseller' }, // Best seller
                { label: 'Latest Collection', value: 'latest' } // Latest
              ].map(option => (
                <label key={option.value} className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative">
                    <input
                      type="radio"
                      name="sort"
                      value={option.value}
                      checked={sortType === option.value}
                      onChange={() => setSortType(option.value)}
                      className="sr-only"
                    />
                    <div className={`w-4 h-4 border-2 flex items-center justify-center transition-all
              ${sortType === option.value ? 'bg-black border-black' : 'border-gray-300 group-hover:border-gray-400'}`}>
                      {sortType === option.value && (
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <span className="text-sm text-gray-700 group-hover:text-gray-900">{option.label}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Featured Section */}
        <div className="mb-6">
          <div className="flex justify-between items-center cursor-pointer mb-3" onClick={() => toggleFilterSection('featured')}>
            <h3 className="text-sm font-semibold text-gray-800">Featured</h3>
            {expandedFilters.featured ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>
          {expandedFilters.featured && (
            <div className="space-y-2">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative">
                  <input type="checkbox" onChange={toggleBestSeller} checked={showBestSeller} className="sr-only" />
                  <div className={`w-4 h-4 border-2 flex items-center justify-center transition-all ${showBestSeller ? 'bg-black border-black' : 'border-gray-300 group-hover:border-gray-400'}`}>
                    {showBestSeller && (
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="text-sm text-gray-700 group-hover:text-gray-900">Best Sellers</span>
              </label>
            </div>
          )}
        </div>

        {/* Gender Section */}
        <div className="mb-6">
          <div className="flex justify-between items-center cursor-pointer mb-3" onClick={() => toggleFilterSection('gender')}>
            <h3 className="text-sm font-semibold text-gray-800">Gender</h3>
            {expandedFilters.gender ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>
          {expandedFilters.gender && (
            <div className="space-y-2">
              {['Men', 'Women'].map(item => (
                <label key={item} className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative">
                    <input type="checkbox" value={item} onChange={toggleCategory} checked={category.includes(item)} className="sr-only" />
                    <div className={`w-4 h-4 border-2 flex items-center justify-center transition-all ${category.includes(item) ? 'bg-black border-black' : 'border-gray-300 group-hover:border-gray-400'}`}>
                      {category.includes(item) && (
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <span className="text-sm text-gray-700 group-hover:text-gray-900">{item}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Kids Section */}
        <div className="mb-6">
          <div className="flex justify-between items-center cursor-pointer mb-3" onClick={() => toggleFilterSection('kids')}>
            <h3 className="text-sm font-semibold text-gray-800">Kids</h3>
            {expandedFilters.kids ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>
          {expandedFilters.kids && (
            <div className="space-y-2">
              {['Boys', 'Girls'].map(item => (
                <label key={item} className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative">
                    <input type="checkbox" value={item} onChange={toggleCategory} checked={category.includes(item)} className="sr-only" />
                    <div className={`w-4 h-4 border-2 flex items-center justify-center transition-all ${category.includes(item) ? 'bg-black border-black' : 'border-gray-300 group-hover:border-gray-400'}`}>
                      {category.includes(item) && (
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <span className="text-sm text-gray-700 group-hover:text-gray-900">{item}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Types Section */}
        <div className="mb-6">
          <div className="flex justify-between items-center cursor-pointer mb-3" onClick={() => toggleFilterSection('types')}>
            <h3 className="text-sm font-semibold text-gray-800">Types</h3>
            {expandedFilters.types ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>
          {expandedFilters.types && (
            <div className="space-y-2">
              {['Top Wear', 'Bottom Wear', 'Winter Wear', 'Sports Wear', 'Western Wear'].map(item => (
                <label key={item} className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative">
                    <input type="checkbox" value={item} onChange={toggleSubCategory} checked={subCategory.includes(item)} className="sr-only" />
                    <div className={`w-4 h-4 border-2 flex items-center justify-center transition-all ${subCategory.includes(item) ? 'bg-black border-black' : 'border-gray-300 group-hover:border-gray-400'}`}>
                      {subCategory.includes(item) && (
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <span className="text-sm text-gray-700 group-hover:text-gray-900">{item}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Price Range */}
        <div className="mb-6">
          <div className="flex justify-between items-center cursor-pointer mb-3" onClick={() => toggleFilterSection('price')}>
            <h3 className="text-sm font-semibold text-gray-800">Price</h3>
            {expandedFilters.price ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>
          {expandedFilters.price && (
            <div className="space-y-2">
              {[
                { label: '₹599 - ₹1999', value: [599, 1999] },
                { label: '₹2000 - ₹3999', value: [2000, 3999] },
                { label: '₹4000 - ₹5999', value: [4000, 5999] },
                { label: '₹6000 - ₹7999', value: [6000, 7999] },
                { label: '₹8000 - ₹9999', value: [8000, 9999] },
              ].map((range, idx) => (
                <label key={idx} className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative">
                    <input
                      type="radio"
                      name="price"
                      value={range.label}
                      checked={priceRange[0] === range.value[0] && priceRange[1] === range.value[1]}
                      onChange={() => {
                        setPriceRange(range.value);
                        setIsPriceFilterActive(range.value[0] !== MIN || range.value[1] !== MAX);
                      }}
                      className="sr-only"
                    />
                    <div className={`w-4 h-4 border-2 flex items-center justify-center transition-all
              ${priceRange[0] === range.value[0] && priceRange[1] === range.value[1] ? 'bg-black border-black' : 'border-gray-300 group-hover:border-gray-400'}`}>
                      {priceRange[0] === range.value[0] && priceRange[1] === range.value[1] && (
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <span className="text-sm text-gray-700 group-hover:text-gray-900">{range.label}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Mobile Close Button */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white p-4">
          <button onClick={() => setShowFilter(false)} className="w-full py-2 bg-black text-white text-sm font-medium">Close Filters</button>
        </div>
      </div>

      {/* Main Content */}
      <div className={`flex-1 lg:transition-all lg:duration-300 ${showFilter ? 'lg:ml-80' : 'lg:ml-0'}`}>
        <Title lead="Discover More" headline="Explore Collections" subline="Curated Picks for Every Style" />

        {/* Active Filters */}
        {(category.length > 0 || subCategory.length > 0 || showBestSeller || sortType !== 'relevant' || isPriceFilterActive) && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-4 flex flex-wrap gap-2">

            {/* Categories */}
            {category.map(cat => (
              <motion.span key={cat} className="bg-gray-800 text-white px-3 py-1 text-xs flex items-center gap-2">
                {cat}
                <button onClick={() => removeFilter('category', cat)}><X size={14} /></button>
              </motion.span>
            ))}

            {/* Types / Subcategories */}
            {subCategory.map(sub => (
              <motion.span key={sub} className="bg-gray-800 text-white px-3 py-1 text-xs flex items-center gap-2">
                {sub}
                <button onClick={() => removeFilter('subCategory', sub)}><X size={14} /></button>
              </motion.span>
            ))}

            {/* Best Sellers */}
            {showBestSeller && (
              <motion.span className="bg-gray-800 text-white px-3 py-1 text-xs flex items-center gap-2">
                Best Sellers
                <button onClick={() => setShowBestSeller(false)}><X size={14} /></button>
              </motion.span>
            )}

            {sortType !== 'relevant' && (
              <motion.span className="bg-gray-800 text-white px-3 py-1 text-xs flex items-center gap-2">
                {(() => {
                  switch (sortType) {
                    case 'low-high': return 'Low to High';
                    case 'high-low': return 'High to Low';
                    case 'bestseller': return 'Popularity';
                    case 'latest': return 'Latest Collection';
                    default: return 'Relevance';
                  }
                })()}
                <button onClick={() => setSortType('relevant')}><X size={14} /></button>
              </motion.span>
            )}

            {isPriceFilterActive && (
              <motion.span className="bg-gray-800 text-white px-3 py-1 text-xs flex items-center gap-2">
                ₹{priceRange[0]} - ₹{priceRange[1]}
                <button onClick={() => { setPriceRange([MIN, MAX]); setIsPriceFilterActive(false); }}><X size={14} /></button>
              </motion.span>
            )}

            {/* Clear All Button */}
            <button
              onClick={() => {
                setCategory([]);
                setSubCategory([]);
                setShowBestSeller(false);
                setSortType('relevant');
                setPriceRange([MIN, MAX]);
                setIsPriceFilterActive(false);
              }}
              className="text-xs text-gray-600 hover:text-black"
            >
              Clear all
            </button>
          </motion.div>
        )}

        {/* Filter Button */}
        <div className="mb-5 flex justify-end">
          <button onClick={() => setShowFilter(!showFilter)} className="flex justify-center items-center gap-2 text-sm bg-white border border-gray-200 px-8 py-2 hover:bg-gray-50">
            <Funnel size={16} />
            <span>{showFilter ? 'Close Filters' : 'Filters'}</span>
          </button>
        </div>

        {/* Product Grid */}
        {displayedProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-24 h-24 bg-gray-100 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">Nothing found</h3>
            <p className="text-sm text-gray-500">Try changing your filters</p>
            <button onClick={() => { setCategory([]); setSubCategory([]); setShowBestSeller(false); }} className="mt-4 text-sm text-black underline hover:no-underline">Reset all filters</button>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-4">
            {displayedProducts.map(item => (
              <motion.div key={item._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className='hover:scale-[1.02] transition-transform duration-300'>
                <ProductItem
                  id={item._id}
                  name={item.name}
                  image={item.image}
                  price={item.price}
                  isBestSeller={item.bestseller}
                  category={item.category}
                  subCategory={item.subCategory}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Collection;
