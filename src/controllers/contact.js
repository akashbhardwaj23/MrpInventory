import Contact from '../models/Contact.js';
import { contactSchema } from '../validation/schemas.js';


export const getContacts = async (req, res) => {
    try {
      const { type, search, page = 1, limit = 10 } = req.query;
      const query = { businessId: req.user._id };
      
      if (type && ['customer', 'vendor'].includes(type)) {
        query.type = type;
      }
      
      if (search) {
        query.$text = { $search: search };
      }
  
      const contacts = await Contact.find(query)
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({ createdAt: -1 });
  
      const total = await Contact.countDocuments(query);
  
      res.json({
        contacts,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
      });
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  }


  export const getContactById = async (req, res) => {
    try {
      const contact = await Contact.findOne({
        _id: req.params.id,
        businessId: req.user._id
      });
  
      if (!contact) {
        return res.status(404).json({ error: 'Contact not found' });
      }
  
      res.json(contact);
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  }

  export const createContact = async (req, res) => {
    try {
      const validatedData = contactSchema.parse(req.body);
      
      const contact = new Contact({
        ...validatedData,
        businessId: req.user._id
      });
  
      await contact.save();
      res.status(201).json(contact);
    } catch (error) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: 'Server error' });
    }
  }

  export const updateContact = async (req, res) => {
    try {
      const validatedData = contactSchema.parse(req.body);
      
      const contact = await Contact.findOneAndUpdate(
        { _id: req.params.id, businessId: req.user._id },
        validatedData,
        { new: true, runValidators: true }
      );
  
      if (!contact) {
        return res.status(404).json({ error: 'Contact not found' });
      }
  
      res.json(contact);
    } catch (error) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: 'Server error' });
    }
  }


  export const deleteContact = async (req, res) => {
    try {
      const contact = await Contact.findOneAndDelete({
        _id: req.params.id,
        businessId: req.user._id
      });
  
      if (!contact) {
        return res.status(404).json({ error: 'Contact not found' });
      }
  
      res.json({ message: 'Contact deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  }