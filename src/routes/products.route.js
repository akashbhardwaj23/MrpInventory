import { Router } from "express";
import { auth } from "../middlewares/auth";
import { createProducts, deleteProduct, getProductById, getProducts, updateProduct } from "../controllers/products";

const router = Router();

router.use(auth);




router.get("/products", getProducts);



router.get("/products/:id", getProductById);

router.post("/products", createProducts);

router.put("/products/:id", updateProduct);

router.delete("/products/:id", deleteProduct);


router.patch('/:id/stock', async (req, res) => {
    try {
      const { quantity, operation } = req.body;
      
      if (!quantity || !operation || !['increase', 'decrease'].includes(operation)) {
        return res.status(400).json({ error: 'Invalid stock operation' });
      }
  
      const product = await Product.findOne({
        _id: req.params.id,
        businessId: req.user._id
      });
  
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
  
      if (operation === 'increase') {
        product.stock += quantity;
      } else {
        if (product.stock < quantity) {
          return res.status(400).json({ error: 'Insufficient stock' });
        }
        product.stock -= quantity;
      }
  
      await product.save();
      res.json(product);
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  });
  


export default router;