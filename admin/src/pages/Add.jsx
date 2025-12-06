import React, { useState } from 'react'
import axios from 'axios'
import { assets } from '../assets/assets'
import { backendUrl } from '../App.jsx'
import { toast } from 'react-toastify'

const ImageUploadBox = ({ idx, file, onChange, onClear }) => (
  <div className="relative group">
    <label className="block cursor-pointer">
      <div
        className={`w-full aspect-square border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 hover:scale-[1.02] transition-transform duration-200 ease-in-out overflow-hidden ${
          file ? 'border-solid border-gray-200 shadow-sm' : ''
        }`}
      >
        <input
          type="file"
          hidden
          accept="image/*"
          onChange={(e) => onChange(idx, e.target.files?.[0] || null)}
          aria-label={`Upload image ${idx + 1}`}
        />
        {file ? (
          <img
            src={URL.createObjectURL(file)}
            alt={`Preview ${idx + 1}`}
            className="object-cover object-top w-full h-full"
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-4 text-gray-400">
            <img src={assets.upload_area} alt="Upload placeholder" className="w-12 opacity-60 mb-2" />
            <span className="text-sm">Click or drag to upload</span>
            <span className="text-xs mt-1">PNG, JPG, WEBP</span>
          </div>
        )}
      </div>
    </label>
    {file && (
      <button
        type="button"
        aria-label="Remove image"
        onClick={() => onClear(idx)}
        className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition hover:scale-110 shadow-sm"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    )}
  </div>
)

const SizeSelector = ({ sizes, toggleSize }) => {
  const allSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
  return (
    <div className="flex flex-wrap gap-3">
      {allSizes.map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => toggleSize(s)}
          className={`px-5 py-2 border font-medium flex items-center justify-center transition-all duration-200 ease-in-out ${
            sizes.includes(s)
              ? 'bg-black text-white border-black shadow-md'
              : 'bg-white text-gray-700 border-gray-300 hover:border-black hover:shadow-sm'
          }`}
        >
          {s}
          {sizes.includes(s) && (
            <span className="ml-2 h-4 w-4 inline-flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20" className="w-3 h-3">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
          )}
        </button>
      ))}
    </div>
  )
}

const Add = ({ token }) => {
  const [images, setImages] = useState([null, null, null, null])
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState('Men')
  const [subCategory, setSubCategory] = useState('Top Wear')
  const [bestseller, setBestseller] = useState(false)
  const [sizes, setSizes] = useState([])
  const [loading, setLoading] = useState(false)

  const handleImageChange = (idx, file) => {
    const arr = [...images]
    arr[idx] = file
    setImages(arr)
  }

  const clearImage = (idx) => {
    const arr = [...images]
    arr[idx] = null
    setImages(arr)
  }

  const toggleSize = (s) => {
    setSizes((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]))
  }

  const resetForm = () => {
    setName('')
    setDescription('')
    setPrice('')
    setImages([null, null, null, null])
    setSizes([])
    setBestseller(false)
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    // Basic validation example
    if (!name.trim() || !description.trim() || !price) {
      toast.error('Please fill in all required fields!')
      setLoading(false)
      return
    }

    const form = new FormData()
    form.append('name', name)
    form.append('description', description)
    form.append('price', price)
    form.append('category', category)
    form.append('subCategory', subCategory)
    form.append('bestseller', bestseller)
    form.append('sizes', JSON.stringify(sizes))

    images.forEach((img, i) => img && form.append(`image${i + 1}`, img))

    try {
      const res = await axios.post(`${backendUrl}/api/product/add`, form, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.data.success) {
        toast.success(res.data.message)
        resetForm()
      } else {
        toast.error(res.data.message)
      }
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen p-6 md:p-10 bg-gray-50">
      <div>
        <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight">Launch Your Products</h2>
        <p className="text-gray-500 mt-1 mb-8">Every great product starts with a spark make yours</p>
      </div>
      <form onSubmit={onSubmit} className="mx-auto bg-white p-6 sm:p-10 shadow-xl border border-gray-200">
        <h2 className="text-center text-4xl font-bold mb-12 text-gray-800 font-display tracking-tight">Add Product</h2>

        {/* Images */}
        <section className="mb-10">
          <p className="text-sm uppercase tracking-wider font-semibold mb-4 text-gray-500">
            Product Images <span className="text-gray-400">(max 4)</span>
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {images.map((img, idx) => (
              <ImageUploadBox
                key={idx}
                idx={idx}
                file={img}
                onChange={handleImageChange}
                onClear={clearImage}
              />
            ))}
          </div>
        </section>

        {/* Info */}
        <section className="mb-8 space-y-6">
          <label className="block text-sm uppercase tracking-wider font-semibold mb-3 text-gray-500">
            Product Information
          </label>
          <div className="space-y-6">
            <div>
              <label className="block mb-2 font-medium text-gray-700">Product Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-300 transition text-gray-800 placeholder:text-gray-400"
                placeholder="Enter product name"
                required
              />
            </div>
            <div>
              <label className="block mb-2 font-medium text-gray-700">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-300 min-h-[120px] text-gray-800 placeholder:text-gray-400"
                placeholder="Write a detailed description..."
                required
              />
            </div>
          </div>
        </section>

        {/* Details */}
        <section className="mb-8">
          <label className="block text-sm uppercase tracking-wider font-semibold mb-3 text-gray-500">
            Product Details
          </label>
          <div className="grid sm:grid-cols-3 gap-5">
            {/* Category */}
            <div>
              <label className="block mb-2 font-medium text-gray-700">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-300 bg-white appearance-none transition"
              >
                <option>Men</option>
                <option>Women</option>
                <option>Boys</option>
                <option>Girls</option>
              </select>
            </div>

            {/* SubCategory */}
            <div>
              <label className="block mb-2 font-medium text-gray-700">Sub Category</label>
              <select
                value={subCategory}
                onChange={(e) => setSubCategory(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-300 bg-white appearance-none transition"
              >
                <option>Top Wear</option>
                <option>Bottom Wear</option>
                <option>Winter Wear</option>
                <option>Sports Wear</option>
                <option>Western Wear</option>
                <option>Swim Wear</option>
                <option>Knit Wear</option>
                <option>Jumpsuit</option>
              </select>
            </div>

            {/* Price */}
            <div>
              <label className="block mb-2 font-medium text-gray-700">Price</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-600">₹</span>
                </div>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full pl-8 px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-300 transition"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>
          </div>
        </section>

        {/* Sizes */}
        <section className="mb-8">
          <label className="block text-sm uppercase tracking-wider font-semibold mb-3 text-gray-500">
            Available Sizes
          </label>
          <SizeSelector sizes={sizes} toggleSize={toggleSize} />
        </section>

        {/* Bestseller */}
        <section className="mb-8">
          <label className="block text-sm uppercase tracking-wider font-semibold mb-3 text-gray-500">
            Product Status
          </label>
          <div className="flex items-center gap-3 p-3 rounded-lg">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                id="bestseller"
                checked={bestseller}
                onChange={() => setBestseller((prev) => !prev)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
              <span className="ml-3 font-medium text-gray-700">Bestseller</span>
            </label>
          </div>
        </section>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className={`px-8 py-3 font-semibold tracking-wide text-sm transition-all duration-150 ease-in-out ${
              loading
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-black text-white hover:bg-black/90 active:scale-95 shadow-md hover:shadow-lg'
            }`}
          >
            {loading ? (
              <span className="flex items-center animate-pulse">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Processing...
              </span>
            ) : (
              'Add Product'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default Add
