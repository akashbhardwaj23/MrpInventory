import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { auth } from "./middlewares/auth";

const app = express();
dotenv.config();

app.use(cors());
app.use(express.json());


mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/inventory_management', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });


  mongoose.connection.on('connected', () => {
    console.log('Connected to MongoDB');
  });
  
  mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
  });
  
const PORT = process.env.PORT || 3000;

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/contacts', contactRoutes);
app.use('/api/v1/transactions', transactionRoutes);
app.use('/api/v1/reports', reportRoutes);


// health check endpoint
app.get('/', (req, res) => {
    res.json({ message: 'Inventory & Billing Management API is running!' });
  });

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});