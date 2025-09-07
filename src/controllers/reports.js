import Transaction from '../models/Transaction.js';
import Product from '../models/Product.js';
import Contact from '../models/Contact.js';


export const getInventoryReport = async (req, res) => {
    try {
      const { lowStock } = req.query;
      const query = { businessId: req.user._id };
      
      if (lowStock) {
        query.stock = { $lte: parseInt(lowStock) };
      }
  
      const products = await Product.find(query)
        .select('name category price stock')
        .sort({ stock: 1 });
  
      const totalProducts = await Product.countDocuments({ businessId: req.user._id });
      const lowStockCount = await Product.countDocuments({
        businessId: req.user._id,
        stock: { $lte: 10 }
      });
  
      const totalValue = await Product.aggregate([
        { $match: { businessId: req.user._id } },
        { $group: { 
            _id: null, 
            total: { $sum: { $multiply: ['$price', '$stock'] } }
          }
        }
      ]);
  
      res.json({
        products,
        summary: {
          totalProducts,
          lowStockCount,
          totalInventoryValue: totalValue[0]?.total || 0
        }
      });
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  }



  export const getTransactionReport = async (req, res) => {
    try {
      const { 
        type, 
        startDate, 
        endDate, 
        groupBy = 'day' 
      } = req.query;
      
      const matchQuery = { businessId: req.user._id };
      
      if (type && ['sale', 'purchase'].includes(type)) {
        matchQuery.type = type;
      }
      
      if (startDate || endDate) {
        matchQuery.date = {};
        if (startDate) matchQuery.date.$gte = new Date(startDate);
        if (endDate) matchQuery.date.$lte = new Date(endDate);
      }

      const summary = await Transaction.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: '$type',
            total: { $sum: '$totalAmount' },
            count: { $sum: 1 }
          }
        }
      ]);
  
      let groupByFormat;
      switch (groupBy) {
        case 'month':
          groupByFormat = { $dateToString: { format: '%Y-%m', date: '$date' } };
          break;
        case 'week':
          groupByFormat = { $dateToString: { format: '%Y-W%U', date: '$date' } };
          break;
        case 'day':
        default:
          groupByFormat = { $dateToString: { format: '%Y-%m-%d', date: '$date' } };
          break;
      }
  
      const timeSeriesData = await Transaction.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: {
              period: groupByFormat,
              type: '$type'
            },
            total: { $sum: '$totalAmount' },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.period': 1 } }
      ]);
  
      const recentTransactions = await Transaction.find(matchQuery)
        .populate('customerId', 'name')
        .populate('vendorId', 'name')
        .sort({ date: -1 })
        .limit(10);
  
      res.json({
        summary: {
          sales: summary.find(s => s._id === 'sale') || { total: 0, count: 0 },
          purchases: summary.find(s => s._id === 'purchase') || { total: 0, count: 0 }
        },
        timeSeriesData,
        recentTransactions
      });
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  }





export const getContactHistoryById = async (req, res) => {
    try {
      const { contactId } = req.params;
      const { startDate, endDate } = req.query;
  
      const contact = await Contact.findOne({
        _id: contactId,
        businessId: req.user._id
      });
  
      if (!contact) {
        return res.status(404).json({ error: 'Contact not found' });
      }
  
      const query = { 
        businessId: req.user._id,
        [contact.type === 'customer' ? 'customerId' : 'vendorId']: contactId
      };
  
      if (startDate || endDate) {
        query.date = {};
        if (startDate) query.date.$gte = new Date(startDate);
        if (endDate) query.date.$lte = new Date(endDate);
      }
  
      const transactions = await Transaction.find(query)
        .populate('products.productId', 'name')
        .sort({ date: -1 });
  
      const summary = await Transaction.aggregate([
        { $match: query },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: '$totalAmount' },
            transactionCount: { $sum: 1 }
          }
        }
      ]);
  
      res.json({
        contact,
        transactions,
        summary: summary[0] || { totalAmount: 0, transactionCount: 0 }
      });
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  }




  export const getProductPerformace = async (req, res) => {
    try {
      const { startDate, endDate, limit = 10 } = req.query;
      
      const matchQuery = { 
        businessId: req.user._id,
        type: 'sale' 
      };
      
      if (startDate || endDate) {
        matchQuery.date = {};
        if (startDate) matchQuery.date.$gte = new Date(startDate);
        if (endDate) matchQuery.date.$lte = new Date(endDate);
      }
  
      const productPerformance = await Transaction.aggregate([
        { $match: matchQuery },
        { $unwind: '$products' },
        {
          $group: {
            _id: '$products.productId',
            totalQuantitySold: { $sum: '$products.quantity' },
            totalRevenue: { $sum: { $multiply: ['$products.quantity', '$products.price'] } },
            transactionCount: { $sum: 1 },
            averagePrice: { $avg: '$products.price' }
          }
        },
        {
          $lookup: {
            from: 'products',
            localField: '_id',
            foreignField: '_id',
            as: 'product'
          }
        },
        { $unwind: '$product' },
        {
          $project: {
            productName: '$product.name',
            category: '$product.category',
            currentStock: '$product.stock',
            totalQuantitySold: 1,
            totalRevenue: 1,
            transactionCount: 1,
            averagePrice: 1
          }
        },
        { $sort: { totalRevenue: -1 } },
        { $limit: parseInt(limit) }
      ]);
  
      res.json({
        topPerformingProducts: productPerformance
      });
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  }






  export const getDashBoardData = async (req, res) => {
    try {
      const businessId = req.user._id;
      const today = new Date();
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());

      
      const todayStats = await Transaction.aggregate([
        {
          $match: {
            businessId,
            date: { $gte: startOfDay }
          }
        },
        {
          $group: {
            _id: '$type',
            total: { $sum: '$totalAmount' },
            count: { $sum: 1 }
          }
        }
      ]);


      const monthStats = await Transaction.aggregate([
        {
          $match: {
            businessId,
            date: { $gte: startOfMonth }
          }
        },
        {
          $group: {
            _id: '$type',
            total: { $sum: '$totalAmount' },
            count: { $sum: 1 }
          }
        }
      ]);


    
      const inventorySummary = await Product.aggregate([
        { $match: { businessId } },
        {
          $group: {
            _id: null,
            totalProducts: { $sum: 1 },
            lowStockProducts: {
              $sum: { $cond: [{ $lte: ['$stock', 10] }, 1, 0] }
            },
            totalValue: { $sum: { $multiply: ['$price', '$stock'] } }
          }
        }
      ]);


      const recentTransactions = await Transaction.find({ businessId })
        .populate('customerId', 'name')
        .populate('vendorId', 'name')
        .sort({ date: -1 })
        .limit(5);
  
      const totalCustomers = await Contact.countDocuments({
        businessId,
        type: 'customer'
      });
  
      const totalVendors = await Contact.countDocuments({
        businessId,
        type: 'vendor'
      });
  
      res.json({
        today: {
          sales: todayStats.find(s => s._id === 'sale') || { total: 0, count: 0 },
          purchases: todayStats.find(s => s._id === 'purchase') || { total: 0, count: 0 }
        },
        thisMonth: {
          sales: monthStats.find(s => s._id === 'sale') || { total: 0, count: 0 },
          purchases: monthStats.find(s => s._id === 'purchase') || { total: 0, count: 0 }
        },
        inventory: inventorySummary[0] || { 
          totalProducts: 0, 
          lowStockProducts: 0, 
          totalValue: 0 
        },
        contacts: {
          totalCustomers,
          totalVendors
        },
        recentTransactions
      });
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  }