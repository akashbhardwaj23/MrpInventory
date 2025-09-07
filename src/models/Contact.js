import mongoose from "mongoose";


const contactSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true,
      trim: true
    },
    phone: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      lowercase: true,
      trim: true
    },
    address: {
      type: String,
      trim: true
    },
    type: {
      type: String,
      enum: ['customer', 'vendor'],
      required: true
    },
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  }, {
    timestamps: true
  })

  contactSchema.index({ businessId: 1, type: 1 });
contactSchema.index({ name: 'text' });

const Contact = mongoose.model('Contact', contactSchema);

export default Contact;