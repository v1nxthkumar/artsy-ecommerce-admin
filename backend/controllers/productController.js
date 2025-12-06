import { v2 as cloudinary } from 'cloudinary'
import productModel from '../models/productModel.js'

// function for add product
const addProduct = async (req, res) => {
    try {

        const { name, description, price, category, subCategory, sizes, bestseller } = req.body;

        const image1 = req.files.image1 && req.files.image1[0]
        const image2 = req.files.image2 && req.files.image2[0]
        const image3 = req.files.image3 && req.files.image3[0]
        const image4 = req.files.image4 && req.files.image4[0]

        const images = [image1, image2, image3, image4].filter((item) => item !== undefined)

        let imagesUrl = await Promise.all(
            images.map(async (item) => {
                let result = await cloudinary.uploader.upload(item.path, { resource_type: 'image' });
                return result.secure_url
            })
        )


        const productData = {
            name,
            description,
            category,
            price: Number(price),
            subCategory,
            bestseller: bestseller === "true" ? true : false,
            sizes: JSON.parse(sizes),
            image: imagesUrl,
            date: Date.now()
        }

        console.log(productData);

        const product = new productModel(productData);
        await product.save()

        res.json({ success: true, message: "Product added" })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }
}

// function for list req.files.image &&
const listProduct = async (req, res) => {
    try {

        const products = await productModel.find({})
        res.json({ success: true, products })

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }
}

// function for removr product
const removeProduct = async (req, res) => {
    try {

        await productModel.findByIdAndDelete(req.body.id)
        res.json({ success: true, message: "Product removed" })

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }
}

// function for single product info
const singleProduct = async (req, res) => {
    try {

        const { productId } = req.body
        const product = await productModel.findById(productId)
        res.json({ success: true, product })

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }
}

// Update product
const updateProduct = async (req, res) => {
  try {
    const { id, name, description, price, category, subCategory, sizes, bestseller } = req.body;

    const product = await productModel.findById(id);
    if (!product) return res.json({ success: false, message: 'Product not found' });

    // Clone the current image array (make sure it's at least 4 elements long)
    const updatedImages = [...(product.image || [])];
    
    // List of image fields to check
    const imageFields = ['image1', 'image2', 'image3', 'image4'];

    for (let i = 0; i < imageFields.length; i++) {
      const file = req.files?.[imageFields[i]]?.[0];
      if (file) {
        const uploaded = await cloudinary.uploader.upload(file.path, {
          resource_type: 'image',
        });
        updatedImages[i] = uploaded.secure_url; // Replace only the specific index
      }
    }

    product.image = updatedImages;

    // Update other fields
    product.name = name || product.name;
    product.description = description || product.description;
    product.price = price !== undefined ? Number(price) : product.price;
    product.category = category || product.category;
    product.subCategory = subCategory || product.subCategory;
    product.bestseller = bestseller === 'true';
    product.sizes = sizes ? JSON.parse(sizes) : product.sizes;

    await product.save();
    res.json({ success: true, message: 'Product updated successfully' });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
}


export { listProduct, addProduct, removeProduct, singleProduct, updateProduct }