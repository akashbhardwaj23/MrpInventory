import { z } from "zod";

export const userRegistrationSchema = z.object({
    username: z.string().min(3, 'Username must be at least 3 characters'),
    email: z.email('Invalid email format'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    businessName: z.string().min(1, 'Business name is required'),
  });
  
  export const loginSchema = z.object({
    login: z.string().min(1, 'Username or email is required'),
    password: z.string().min(1, 'Password is required'),
  });
  
  export const productSchema = z.object({
    name: z.string().min(1, 'Product name is required'),
    description: z.string().optional(),
    price: z.number().positive('Price must be positive'),
    stock: z.number().int().min(0, 'Stock cannot be negative'),
    category: z.string().min(1, 'Category is required'),
  });
  
  export const contactSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    phone: z.string().optional(),
    email: z.string().email('Invalid email format').optional().or(z.literal('')),
    address: z.string().optional(),
    type: z.enum(['customer', 'vendor'], {
      required_error: 'Type must be either customer or vendor'
    }),
  });
  
  export const transactionSchema = z.object({
    type: z.enum(['sale', 'purchase']),
    customerId: z.string().optional(),
    vendorId: z.string().optional(),
    products: z.array(z.object({
      productId: z.string(),
      quantity: z.number().int().positive('Quantity must be positive'),
      price: z.number().positive('Price must be positive'),
    })).min(1, 'At least one product is required'),
  }).refine(data => {
    if (data.type === 'sale' && !data.customerId) {
      return false;
    }
    if (data.type === 'purchase' && !data.vendorId) {
      return false;
    }
    return true;
  }, {
    message: 'Customer ID required for sales, Vendor ID required for purchases'
  });