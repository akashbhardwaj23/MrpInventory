import mongoose from "mongoose";



const transactionSchema = new mongoose.Schema({
    type: {
      type: String,
      enum: ['sale', 'purchase'],
      required: true
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Contact'
    },
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Contact'
    },
    products: [{
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
      },
      quantity: {
        type: Number,
        required: true,
        min: 1
      },
      price: {
        type: Number,
        required: true,
        min: 0
      }
    }],
    totalAmount: {
      type: Number,
      required: true,
      min: 0
    },
    date: {
      type: Date,
      default: Date.now
    },
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  }, {
    timestamps: true
  })


  transactionSchema.index({ businessId: 1, date: -1 });
transactionSchema.index({ businessId: 1, type: 1 });


const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction;