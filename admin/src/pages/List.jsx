import axios from 'axios';
import React, { useEffect, useState, useMemo } from 'react';
import { backendUrl, currency } from '../App.jsx';
import { toast } from 'react-toastify';
import {
  Trash2,
  Star,
  RefreshCw,
  X,
  Check,
  Package,
  Tag,
  Ruler,
  Pencil,
  ShoppingBag,
  ChevronRight,
  Clock,
  Layers,
  Info,
  Maximize2,
  Image,
  Shield,
  Sliders,
  Filter,
  Search,
  Activity,
  Percent,
  TrendingUp,
  ArrowUpDown,
} from 'lucide-react';
import { assets } from '../assets/assets.js';

const List = ({ token }) => {
  const [list, setList] = useState([]);
  const [currentSlide, setCurrentSlide] = useState({});
  const [editingProduct, setEditingProduct] = useState(null);
  const [editData, setEditData] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Advanced search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [sortCriteria, setSortCriteria] = useState('name');
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedSubCategories, setSelectedSubCategories] = useState([]);

  // Fetch products
  const fetchList = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/product/list`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        setList(res.data.products);
        // Initialize price range based on actual product prices
        const prices = res.data.products.map(p => p.price);
        setPriceRange([Math.min(...prices), Math.max(...prices)]);
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || `Fetch error: ${err.message}`);
    }
  };

  useEffect(() => {
    fetchList();
  }, [token]);

  // Generate category statistics
  const categoryStats = useMemo(() => {
    const stats = {};
    list.forEach(product => {
      if (!stats[product.category]) {
        stats[product.category] = {
          count: 0,
          totalPrice: 0,
          subcategories: {}
        };
      }
      stats[product.category].count++;
      stats[product.category].totalPrice += product.price;

      if (!stats[product.category].subcategories[product.subCategory]) {
        stats[product.category].subcategories[product.subCategory] = 0;
      }
      stats[product.category].subcategories[product.subCategory]++;
    });
    return stats;
  }, [list]);

  // Available categories and subcategories for filters
  const availableCategories = useMemo(() => {
    return [...new Set(list.map(item => item.category))];
  }, [list]);

  const availableSubCategories = useMemo(() => {
    return [...new Set(list.map(item => item.subCategory))];
  }, [list]);

  // Filter and sort products
  const filteredList = useMemo(() => {
    return list.filter(item => {
      const matchesSearch = searchQuery === '' ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesPrice = item.price >= priceRange[0] && item.price <= priceRange[1];

      const matchesCategory = selectedCategories.length === 0 ||
        selectedCategories.includes(item.category);

      const matchesSubCategory = selectedSubCategories.length === 0 ||
        selectedSubCategories.includes(item.subCategory);

      return matchesSearch && matchesPrice && matchesCategory && matchesSubCategory;
    });
  }, [list, searchQuery, priceRange, selectedCategories, selectedSubCategories]);

  const sortedList = useMemo(() => {
    return [...filteredList].sort((a, b) => {
      switch (sortCriteria) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'bestseller':
          return (b.bestseller ? 1 : 0) - (a.bestseller ? 1 : 0);
        default:
          return a.name.localeCompare(b.name);
      }
    });
  }, [filteredList, sortCriteria]);

  // Statistics calculations
  const stats = useMemo(() => {
    if (sortedList.length === 0) return {};

    const prices = sortedList.map(item => item.price);
    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const bestsellerCount = sortedList.filter(item => item.bestseller).length;

    return {
      total: sortedList.length,
      avgPrice,
      minPrice,
      maxPrice,
      bestsellerCount,
      bestsellerPercentage: (bestsellerCount / sortedList.length * 100).toFixed(1)
    };
  }, [sortedList]);

  // Product management functions... (removeProduct, handleMouseEnter/Leave, etc.)
  const removeProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      const res = await axios.post(
        `${backendUrl}/api/product/remove`,
        { id },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data.success) {
        toast.success(res.data.message);
        fetchList();
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || `Delete error: ${err.message}`);
    }
  };

  const handleMouseEnter = (id) => {
    let index = 0;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => ({ ...prev, [id]: index }));
      index++;
    }, 1000);
    setCurrentSlide((prev) => ({ ...prev, [`${id}_interval`]: interval }));
  };

  const handleMouseLeave = (id) => {
    clearInterval(currentSlide[`${id}_interval`]);
    setCurrentSlide((prev) => {
      const newState = { ...prev };
      delete newState[`${id}_interval`];
      newState[id] = 0;
      return newState;
    });
  };

  const closeEditModal = () => {
    setEditingProduct(null);
    setEditData(null);
  };

  const handleUpdateProduct = async () => {
    try {
      setIsUpdating(true);
      const formData = new FormData();

      formData.append('id', editingProduct._id);
      formData.append('name', editData.name);
      formData.append('description', editData.description);
      formData.append('price', editData.price);
      formData.append('category', editData.category);
      formData.append('subCategory', editData.subCategory);
      formData.append('sizes', JSON.stringify(editData.sizes));
      formData.append('bestseller', editData.bestseller);

      ['image1', 'image2', 'image3', 'image4'].forEach((key) => {
        if (editData[key]) {
          formData.append(key, editData[key]);
        }
      });

      const res = await axios.post(`${backendUrl}/api/product/update`, formData, {
        headers: {
          Authorization: `Bearer ${token}`
        },
      });

      if (res.data.success) {
        toast.success(res.data.message);
        closeEditModal();
        fetchList();
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || `Update error: ${err.message}`);
    } finally {
      setIsUpdating(false);
    }
  }
  return (
    <div className="bg-gray-50 min-h-screen p-6 md:p-10">
      <div>
        <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight">Products Inventory</h2>
        <p className="text-gray-500 mt-1 mb-8">Manage and track your products</p>
      </div>
      {/* Advanced Search and Filter Header */}
      <div className="mb-6 bg-white p-4 shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search products by name, description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 hover:bg-gray-50 transition"
            >
              <Filter size={16} />
              <span>Filters</span>
              {(selectedCategories.length > 0 || selectedSubCategories.length > 0) && (
                <span className="inline-flex items-center justify-center w-5 h-5 text-xs bg-indigo-600 text-white">
                  {selectedCategories.length + selectedSubCategories.length}
                </span>
              )}
            </button>

            <div className="relative">
              <select
                value={sortCriteria}
                onChange={(e) => setSortCriteria(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2 border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
              >
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
                <option value="price-asc">Price (Low to High)</option>
                <option value="price-desc">Price (High to Low)</option>
                <option value="bestseller">Bestseller First</option>
              </select>
              <ArrowUpDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
            </div>
          </div>
        </div>

        {/* Advanced Filters Panel */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Price Range Filter */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Tag size={16} /> Price Range
              </h3>
              <div className="px-2 space-y-2">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>{currency}{priceRange[0].toFixed(2)}</span>
                  <span>{currency}{priceRange[1].toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={Math.ceil(priceRange[1] * 1.1)}
                  step="1"
                  value={priceRange[0]}
                  onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                  className="w-full h-2 bg-gray-200 appearance-none cursor-pointer"
                />
                <input
                  type="range"
                  min="0"
                  max={Math.ceil(priceRange[1] * 1.1)}
                  step="1"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                  className="w-full h-2 bg-gray-200 appearance-none cursor-pointer"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Package size={16} /> Categories
              </h3>
              <div className="space-y-2">
                {availableCategories.map(category => (
                  <label key={category} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category)}
                      onChange={() => {
                        if (selectedCategories.includes(category)) {
                          setSelectedCategories(selectedCategories.filter(c => c !== category));
                        } else {
                          setSelectedCategories([...selectedCategories, category]);
                        }
                      }}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-700">{category}</span>
                    <span className="text-xs text-gray-500">({categoryStats[category]?.count || 0})</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Subcategory Filter */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Layers size={16} /> Subcategories
              </h3>
              <div className="space-y-2">
                {availableSubCategories.map(subCategory => (
                  <label key={subCategory} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={selectedSubCategories.includes(subCategory)}
                      onChange={() => {
                        if (selectedSubCategories.includes(subCategory)) {
                          setSelectedSubCategories(selectedSubCategories.filter(sc => sc !== subCategory));
                        } else {
                          setSelectedSubCategories([...selectedSubCategories, subCategory]);
                        }
                      }}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-700">{subCategory}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Statistics Dashboard */}
      <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 text-indigo-600">
              <Activity size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-500">Total Products</p>
              <p className="text-lg font-semibold">{stats.total || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-50 text-green-600">
              <Tag size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-500">Avg. Price</p>
              <p className="text-lg font-semibold">{currency}{(stats.avgPrice || 0).toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-50 text-amber-600">
              <Star size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-500">Bestsellers</p>
              <p className="text-lg font-semibold">{stats.bestsellerCount || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-50 text-purple-600">
              <Percent size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-500">Bestseller %</p>
              <p className="text-lg font-semibold">{stats.bestsellerPercentage || 0}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Category Performance */}
      <div className="mb-6 bg-white p-4 border border-gray-200 shadow-sm">
        <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
          <TrendingUp className='text-green-600' size={16} /> Category Performance
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {availableCategories.map(category => (
            <div key={category} className="p-3 border border-gray-200">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">{category}</span>
                <span className="text-xs font-medium bg-gray-100 px-2 py-1">
                  {categoryStats[category]?.count || 0} items
                </span>
              </div>
              <div className="text-xs text-gray-500 mb-1">
                Avg. Price: {currency}{(categoryStats[category]?.totalPrice / (categoryStats[category]?.count || 1)).toFixed(2)}
              </div>
              <div className="space-y-1 mt-2">
                {categoryStats[category]?.subcategories &&
                  Object.entries(categoryStats[category].subcategories)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 3)
                    .map(([sub, count]) => (
                      <div key={sub} className="flex justify-between text-xs">
                        <span>{sub}</span>
                        <span>{count}</span>
                      </div>
                    ))
                }
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {sortedList.map((item) => {
          const slideIndex = currentSlide[item._id] || 0;
          return (
            <div
              key={item._id}
              onMouseEnter={() => handleMouseEnter(item._id)}
              onMouseLeave={() => handleMouseLeave(item._id)}
              className="bg-white text-gray-800 hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 overflow-hidden border border-gray-200 relative group"
            >
              <div className="relative w-full h-72 xl:h-80 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent z-10 pointer-events-none"></div>
                <img
                  src={item.image?.[slideIndex % item.image.length] || assets.upload_area}
                  alt={item.name}
                  className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                  draggable={false}
                />

                <div className="absolute top-0 left-0 w-full flex justify-between p-4 z-20">
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-900/90 text-white text-xs font-semibold tracking-widest">
                    <Tag className="w-3 h-3" /> {currency}{item.price.toLocaleString()}
                  </span>
                  {item.bestseller && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-900/90 text-white text-xs font-semibold tracking-widest">
                      <Star className="w-3 h-3" />
                    </span>
                  )}
                </div>

                <div className="absolute bottom-0 left-0 w-full p-4 z-20">
                  <div className="flex flex-wrap gap-1 justify-center">
                    {item.sizes?.map((sz) => (
                      <span
                        key={sz}
                        className="text-xs font-medium px-2 py-1 bg-white/90 backdrop-blur-sm text-gray-700 shadow-sm flex items-center gap-1"
                      >
                        <Ruler className="w-3 h-3" /> {sz}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-5 md:p-6 border-t border-gray-100">
                <div className="flex justify-between items-start gap-3">
                  <div>
                    <h3 className="text-base md:text-md font-semibold text-gray-900 line-clamp-1">{item.name}</h3>
                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                      <Package className="w-3 h-3 min-w-[12px]" />
                      <span className="line-clamp-1">{item.category}</span>
                      <ChevronRight className="w-3 h-3" />
                      <span className="line-clamp-1">{item.subCategory}</span>
                    </div>
                  </div>
                </div>

                <p className="mt-3 text-gray-600 text-xs md:text-sm line-clamp-2">{item.description}</p>

                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => {
                      setEditingProduct(item);
                      setEditData({
                        name: item.name,
                        description: item.description,
                        category: item.category,
                        subCategory: item.subCategory,
                        price: item.price,
                        bestseller: item.bestseller,
                        sizes: item.sizes || [],
                        image1: null,
                        image2: null,
                        image3: null,
                        image4: null,
                      });
                    }}
                    className="flex-1 flex items-center justify-center gap-2 py-2 md:py-2.5 bg-gradient-to-br from-gray-900 to-gray-800 text-white hover:from-gray-800 hover:to-gray-700 transition-all font-medium text-xs md:text-sm shadow-sm"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => removeProduct(item._id)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 md:py-2.5 bg-gradient-to-br from-gray-900 to-gray-800 text-white hover:from-gray-800 hover:to-gray-700 transition-all font-medium text-xs md:text-sm shadow-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {editingProduct && editData && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 md:p-6 overflow-auto">
          <div className="bg-white max-w-4xl w-full max-h-[90vh] overflow-y-auto p-8 shadow-2xl border border-gray-100 font-sans">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-3">
                  <Pencil className="w-7 h-7 text-indigo-600" /> Product Refinement Suite
                </h2>
                <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                  <span className="px-2 py-1 bg-indigo-50 text-indigo-600">Editing mode</span>
                  <span className="flex items-center gap-1">
                    <Info className="w-3 h-3" /> All changes are version-controlled
                  </span>
                </div>
              </div>
              <button
                onClick={closeEditModal}
                className="p-1 hover:bg-gray-50 transition border border-gray-200"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="mb-8 bg-gradient-to-br from-indigo-50 to-purple-50 p-6 border border-indigo-100">
              <p className="font-semibold mb-4 uppercase tracking-wider text-xs flex items-center gap-2">
                <Image className="w-4 h-4" /> VISUAL ASSETS EDITOR
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[0, 1, 2, 3].map((idx) => {
                  const imgKey = `image${idx + 1}`;
                  const fileObj = editData[imgKey];
                  const existingUrl = editingProduct.image?.[idx];
                  return (
                    <div key={idx} className="relative group">
                      <label
                        htmlFor={`img-${imgKey}`}
                        className="block w-full h-45 md:h-50 cursor-pointer overflow-hidden relative hover:shadow-md transition-all"
                      >
                        <input
                          type="file"
                          hidden
                          id={`img-${imgKey}`}
                          onChange={(e) =>
                            setEditData((prev) => ({
                              ...prev,
                              [imgKey]: e.target.files[0],
                            }))
                          }
                        />
                        <img
                          src={fileObj ? URL.createObjectURL(fileObj) : existingUrl || assets.upload_area}
                          alt={`Product view ${idx + 1}`}
                          className="object-cover object-top w-full h-full"
                        />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="text-white text-center px-3 py-1 bg-black/80 text-xs flex items-center gap-1">
                            <Maximize2 className="w-3 h-3" /> Preview
                          </div>
                        </div>
                      </label>
                      <div className="absolute top-2 right-2 bg-white text-xs px-2 py-1 shadow-sm">
                        {idx === 0 ? 'Main' : idx + 1}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="mb-2 font-medium uppercase text-xs tracking-wider text-gray-500 flex items-center gap-2">
                    <Tag className="w-4 h-4" /> PRODUCT NAME
                  </label>
                  <input
                    id="name"
                    value={editData.name}
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition bg-white"
                  />
                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                    <Info className="w-3 h-3" /> Preferably under 60 characters
                  </p>
                </div>

                <div>
                  <label htmlFor="price" className="mb-2 font-medium uppercase text-xs tracking-wider text-gray-500 flex items-center gap-2">
                    <Tag className="w-4 h-4" /> PRICE POSITIONING
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">{currency}</span>
                    <input
                      id="price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={editData.price}
                      onChange={(e) => setEditData({ ...editData, price: e.target.value })}
                      className="w-full px-4 py-3 pl-8 border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition bg-white"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                    <Star className="w-3 h-3" /> Competitive pricing boosts conversion
                  </p>
                </div>
              </div>

              <div>
                <label htmlFor="description" className="mb-2 font-medium uppercase text-xs tracking-wider text-gray-500 flex items-center gap-2">
                  <Pencil className="w-4 h-4" /> PRODUCT STORYTELLING
                </label>
                <textarea
                  id="description"
                  value={editData.description}
                  onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition bg-white"
                  placeholder="Highlight craftsmanship, materials, and unique features..."
                />
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                  <Layers className="w-3 h-3" /> Rich descriptions increase engagement by 42%
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="category" className="mb-2 font-medium uppercase text-xs tracking-wider text-gray-500 flex items-center gap-2">
                    <Package className="w-4 h-4" /> CATEGORY
                  </label>
                  <select
                    id="category"
                    value={editData.category}
                    onChange={(e) => setEditData({ ...editData, category: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition bg-white appearance-none"
                  >
                    {['Men', 'Women', 'Boys', 'Girls'].map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>

                <div>
                  <label htmlFor="subcategory" className="mb-2 font-medium uppercase text-xs tracking-wider text-gray-500 flex items-center gap-2">
                    <Package className="w-4 h-4" /> SUBCATEGORY
                  </label>
                  <select
                    id="subcategory"
                    value={editData.subCategory}
                    onChange={(e) => setEditData({ ...editData, subCategory: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition bg-white appearance-none"
                  >
                    {['Top Wear', 'Bottom Wear', 'Winter Wear', 'Sports Wear', 'Western Wear', 'Swim Wear', 'Knit Wear', 'Jumpsuit'].map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>

              <div>
                <label className=" mb-3 font-medium uppercase text-xs tracking-wider text-gray-500 flex items-center gap-2">
                  <Ruler className="w-4 h-4" /> INVENTORY ARCHITECTURE
                </label>
                <div className="flex flex-wrap gap-2">
                  {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() =>
                        setEditData((prev) => ({
                          ...prev,
                          sizes: prev.sizes.includes(sz)
                            ? prev.sizes.filter((s) => s !== sz)
                            : [...prev.sizes, sz],
                        }))
                      }
                      className={`px-3 py-1.5 border font-medium select-none text-xs transition-all flex items-center gap-1 ${editData.sizes.includes(sz)
                        ? 'bg-black text-white border-black shadow-sm'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                        }`}
                    >
                      {editData.sizes.includes(sz) && <Check className="w-3 h-3" />}
                      {sz}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                  <Info className="w-3 h-3" /> Selected sizes show availability in 3-5 business days
                </p>
              </div>

              <div className="pt-4 flex items-center justify-between">

                <label htmlFor="bestseller" className="relative flex items-center cursor-pointer gap-3">
                  <input
                    id="bestseller"
                    type="checkbox"
                    checked={editData.bestseller}
                    onChange={() => setEditData((prev) => ({
                      ...prev,
                      bestseller: !prev.bestseller
                    }))}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-5 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-amber-500 peer-checked:to-amber-600"></div>
                  <div className="ml-1">
                    <span className="text-sm font-medium text-gray-700 flex items-center gap-1">
                      <Star className="w-4 h-4" /> BestSeller
                    </span>
                    <span className="text-xs text-gray-500">
                      {editData.bestseller ? 'Featured collection' : 'Standard listing'}
                    </span>
                  </div>
                </label>

                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Clock className="w-3 h-3" /> Last updated: {new Date().toLocaleDateString()}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-3 mt-10 pt-6 border-t border-gray-100">
                <button
                  onClick={closeEditModal}
                  className="px-5 py-2.5 border border-gray-200 font-medium hover:bg-gray-50 transition flex items-center gap-2 text-sm"
                >
                  <X className="w-4 h-4" /> Discard Draft
                </button>
                <button
                  type="button"
                  onClick={handleUpdateProduct}
                  disabled={isUpdating}
                  className={`px-5 py-2.5 font-medium text-white transition flex items-center gap-2 text-sm ${isUpdating ? 'bg-gray-400 cursor-not-allowed' :
                    'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-sm'
                    }`}
                >
                  {isUpdating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Processing...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" /> Publish Refinements
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default List;