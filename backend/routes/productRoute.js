import express from 'express'
import { listProduct, addProduct, removeProduct, singleProduct, updateProduct } from '../controllers/productController.js'
import upload from '../middleware/multer.js';
import adminAuth from '../middleware/adminAuth.js';

const productRouter = express.Router();

// using multer to get multiple images
productRouter.post('/add', adminAuth, upload.fields([
    {name:'image1',maxCount:1},
    {name:'image2',maxCount:1},
    {name:'image3',maxCount:1},
    {name:'image4',maxCount:1},
]), addProduct);

productRouter.post('/remove', adminAuth, removeProduct);

productRouter.post('/single', singleProduct);

productRouter.get('/list', listProduct);

// Update product (supports optional image upload)
productRouter.post(
  '/update',
  adminAuth,
  upload.fields([
    { name: 'image1', maxCount: 1 },
    { name: 'image2', maxCount: 1 },
    { name: 'image3', maxCount: 1 },
    { name: 'image4', maxCount: 1 },
  ]),
  updateProduct
)

export default productRouter