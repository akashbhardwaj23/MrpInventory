import User from "../models/User";
import jwt from "jsonwebtoken";
import { userRegistrationSchema, loginSchema } from '../validation/schemas.js';
import { JWT_SECRET } from "../config/config";

const JWT_SECRET = process.env.JWT_SECRET || 'secret';


export const register = async (req, res) => {
    try {
      const validatedData = userRegistrationSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await User.findOne({
        $or: [
          { email: validatedData.email },
          { username: validatedData.username }
        ]
      });
  
      if (existingUser) {
        return res.status(400).json({ error: 'User already exists' });
      }
  
      // Create new user
      const user = new User(validatedData);
      await user.save();
  
      // Generate JWT token
      const token = jwt.sign(
        { userId: user._id },
        JWT_SECRET,
        { expiresIn: '7d' }
      );
  
      res.status(201).json({
        message: 'User registered successfully',
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          businessName: user.businessName
        }
      });
    } catch (error) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: 'Server error' });
    }
  }


  export const login = async (req, res) => {
    try {
      const { login, password } = loginSchema.parse(req.body);
      
     
      const user = await User.findOne({
        $or: [
          { email: login },
          { username: login }
        ]
      });
  
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
  
     
      const isValidPassword = await user.comparePassword(password);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
  
      const token = jwt.sign(
        { userId: user._id },
        JWT_SECRET,
        { expiresIn: '7d' }
      );
  
      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          businessName: user.businessName
        }
      });
    } catch (error) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: 'Server error' });
    }
  }


  export const logout = (req, res) => {
    res.json({ message: 'Logout successful' });
  }

  export const getMe = (req, res) => {
    res.json({
      user: {
        id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        businessName: req.user.businessName
      }
    });
  }