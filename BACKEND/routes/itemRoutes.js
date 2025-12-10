import express from 'express';
import Item from '../models/item.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// Middleware to check if user is admin or faculty
const adminOrFaculty = (req, res, next) => {
  if (req.user.role === 'admin' || req.user.role === 'faculty') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Admin or Faculty only.' });
  }
};

// Helper function to generate QR code value
const generateQRCode = (itemId) => {
  return `ITEM_${itemId}_${Date.now()}`;
};

// Get all items (Public)
router.get('/', async (req, res) => {
  try {
    const items = await Item.find().populate('addedBy', 'name email');
    res.json(items);
  } catch (error) {
    console.error('Get items error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get items added by me (Faculty)
router.get('/my-items', protect, async (req, res) => {
  try {
    if (req.user.role !== 'faculty' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const items = req.user.role === 'admin' 
      ? await Item.find().populate('addedBy', 'name email')
      : await Item.find({ addedBy: req.user.userId }).populate('addedBy', 'name email');

    res.json(items);
  } catch (error) {
    console.error('Get my items error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get item by ID (Public)
router.get('/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).populate('addedBy', 'name email');
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.json(item);
  } catch (error) {
    console.error('Get item error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get item by QR code (Protected)
router.get('/qr/:code', protect, async (req, res) => {
  try {
    const code = req.params.code;
    // try to find by qrCode first, then by itemId
    let item = await Item.findOne({ qrCode: code });
    if (!item) {
      item = await Item.findOne({ itemId: code });
    }
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.json(item);
  } catch (error) {
    console.error('Get item by QR error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create item (Admin or Faculty)
router.post('/', protect, adminOrFaculty, async (req, res) => {
  try {
    const { itemId, name, category, description, status, quantity, department } = req.body;

    if (!itemId || !name || !category) {
      return res.status(400).json({ 
        message: 'Item ID, Name, and Category are required' 
      });
    }

    const existingItem = await Item.findOne({ itemId });
    if (existingItem) {
      return res.status(400).json({ message: 'Item ID already exists' });
    }

    const qrCode = generateQRCode(itemId);

    const item = new Item({
      itemId,
      name,
      category,
      description: description || '',
      status: status || 'available',
      quantity: quantity || 1,
      qrCode,
      addedBy: req.user.userId,
      department: department || null
    });

    await item.save();

    const populatedItem = await Item.findById(item._id).populate('addedBy', 'name email');

    res.status(201).json({
      message: 'Item created successfully',
      item: populatedItem
    });
  } catch (error) {
    console.error('Create item error:', error);
    
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ 
        message: `${field} already exists` 
      });
    }

    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update item (Admin or Faculty who added it)
router.put('/:id', protect, adminOrFaculty, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Check ownership (Faculty can only edit their own items)
    if (req.user.role === 'faculty' && item.addedBy.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'You can only edit items you added' });
    }

    const { name, category, description, status, quantity, department } = req.body;

    const updateData = {
      name,
      category,
      description,
      status,
      quantity,
      department
    };

    Object.keys(updateData).forEach(key => 
      updateData[key] === undefined && delete updateData[key]
    );

    const updatedItem = await Item.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('addedBy', 'name email');

    res.json({
      message: 'Item updated successfully',
      item: updatedItem
    });
  } catch (error) {
    console.error('Update item error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete item (Admin or Faculty who added it)
router.delete('/:id', protect, adminOrFaculty, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Check ownership
    if (req.user.role === 'faculty' && item.addedBy.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'You can only delete items you added' });
    }

    await item.deleteOne();

    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Delete item error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get QR code for item (Admin or Faculty)
router.get('/:id/qr', protect, adminOrFaculty, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    res.json({
      itemId: item.itemId,
      name: item.name,
      qrCode: item.qrCode
    });
  } catch (error) {
    console.error('Get QR code error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;