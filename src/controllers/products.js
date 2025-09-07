import Product from '../models/Product.js';
import { productSchema } from '../validation/schemas.js';



export const getProducts = async (req, res) => {
    try {
      const { search, category, page = 1, limit = 10 } = req.query;
      const query = { businessId: req.user._id };
      
      if (search) {
        query.$text = { $search: search };
      }
      
      if (category) {
        query.category = new RegExp(category, 'i');
      }
  
      const products = await Product.find(query)
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({ createdAt: -1 });
  
      const total = await Product.countDocuments(query);
  
      res.json({
        products,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
      });
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  }


export const getProductById = async (req, res) => {
    try {
      const product = await Product.findOne({
        _id: req.params.id,
        businessId: req.user._id
      });
  
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
  
      res.json(product);
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  }



export const createProducts = async (req, res) => {
    try {
      const validatedData = productSchema.parse(req.body);
      
      const product = new Product({
        ...validatedData,
        businessId: req.user._id
      });
  
      await product.save();
      res.status(201).json(product);
    } catch (error) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: 'Server error' });
    }
  }

export const updateProduct = async (req, res) => {
    try {
      const validatedData = productSchema.parse(req.body);
      
      const product = await Product.findOneAndUpdate(
        { _id: req.params.id, businessId: req.user._id },
        validatedData,
        { new: true, runValidators: true }
      );
  
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
  
      res.json(product);
    } catch (error) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: 'Server error' });
    }
  }

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({
      _id: req.params.id,
      businessId: req.user._id
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
}