import Transaction from '../models/Transaction.js';
import Product from '../models/Product.js';
import Contact from '../models/Contact.js';
import { transactionSchema } from '../validation/schemas.js';


export const getTransactions = async (req, res) => {
    try {
      const { 
        type, 
        startDate, 
        endDate, 
        customerId, 
        vendorId, 
        page = 1, 
        limit = 10 
      } = req.query;
      
      const query = { businessId: req.user._id };
      
      if (type && ['sale', 'purchase'].includes(type)) {
        query.type = type;
      }
      
      if (customerId) {
        query.customerId = customerId;
      }
      
      if (vendorId) {
        query.vendorId = vendorId;
      }
      
      if (startDate || endDate) {
        query.date = {};
        if (startDate) query.date.$gte = new Date(startDate);
        if (endDate) query.date.$lte = new Date(endDate);
      }
  
      const transactions = await Transaction.find(query)
        .populate('customerId', 'name')
        .populate('vendorId', 'name')
        .populate('products.productId', 'name')
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({ date: -1 });
  
      const total = await Transaction.countDocuments(query);
  
      res.json({
        transactions,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
      });
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  }



  export const createTransaction = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
  
    try {
      const validatedData = transactionSchema.parse(req.body);
      
      let contactId;
      if (validatedData.type === 'sale') {
        const customer = await Contact.findOne({
          _id: validatedData.customerId,
          businessId: req.user._id,
          type: 'customer'
        });
        if (!customer) {
          await session.abortTransaction();
          return res.status(400).json({ error: 'Customer not found' });
        }
        contactId = validatedData.customerId;
      } else {
        const vendor = await Contact.findOne({
          _id: validatedData.vendorId,
          businessId: req.user._id,
          type: 'vendor'
        });
        if (!vendor) {
          await session.abortTransaction();
          return res.status(400).json({ error: 'Vendor not found' });
        }
        contactId = validatedData.vendorId;
      }

      let totalAmount = 0;
      const productUpdates = [];
  
      for (const item of validatedData.products) {
        const product = await Product.findOne({
          _id: item.productId,
          businessId: req.user._id
        }).session(session);
  
        if (!product) {
          await session.abortTransaction();
          return res.status(400).json({ 
            error: `Product ${item.productId} not found` 
          });
        }

        if (validatedData.type === 'sale' && product.stock < item.quantity) {
          await session.abortTransaction();
          return res.status(400).json({ 
            error: `Insufficient stock for product ${product.name}` 
          });
        }
  
        totalAmount += item.quantity * item.price;

        if (validatedData.type === 'sale') {
          productUpdates.push({
            productId: product._id,
            newStock: product.stock - item.quantity
          });
        } else {
          productUpdates.push({
            productId: product._id,
            newStock: product.stock + item.quantity
          });
        }
      }

      const transactionData = {
        ...validatedData,
        totalAmount,
        businessId: req.user._id
      };
  
      const transaction = new Transaction(transactionData);
      await transaction.save({ session });
  
      // Update product stocks
      for (const update of productUpdates) {
        await Product.findByIdAndUpdate(
          update.productId,
          { stock: update.newStock },
          { session }
        );
      }
  
      await session.commitTransaction();

      const populatedTransaction = await Transaction.findById(transaction._id)
        .populate('customerId', 'name')
        .populate('vendorId', 'name')
        .populate('products.productId', 'name');
  
      res.status(201).json(populatedTransaction);
    } catch (error) {
      await session.abortTransaction();
      
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: 'Server error' });
    } finally {
      session.endSession();
    }
  }