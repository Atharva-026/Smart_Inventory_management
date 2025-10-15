import express from 'express';
import Item from '../models/Item.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// Helper function to generate QR code value
const generateQRCode = (itemId) => {
  return `ITEM_${itemId}_${Date.now()}`;
};

// Get all items (Public)
router.get('/', async (req, res) => {
  try {
    const items = await Item.find();
    res.json(items);
  } catch (error) {
    console.error('Get items error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get item by ID (Public)
router.get('/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
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
router.get('/qr/:qrCode', protect, async (req, res) => {
  try {
    const item = await Item.findOne({ qrCode: req.params.qrCode });
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.json(item);
  } catch (error) {
    console.error('Get item by QR error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create item (Admin only)
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const { itemId, name, category, description, status, quantity } = req.body;

    // Validate required fields
    if (!itemId || !name || !category) {
      return res.status(400).json({ 
        message: 'Item ID, Name, and Category are required' 
      });
    }

    // Check if itemId already exists
    const existingItem = await Item.findOne({ itemId });
    if (existingItem) {
      return res.status(400).json({ message: 'Item ID already exists' });
    }

    // Generate QR code automatically
    const qrCode = generateQRCode(itemId);

    // Create item
    const item = new Item({
      itemId,
      name,
      category,
      description: description || '',
      status: status || 'available',
      quantity: quantity || 1,
      qrCode  // ← Auto-generated
    });

    await item.save();

    res.status(201).json({
      message: 'Item created successfully',
      item
    });
  } catch (error) {
    console.error('Create item error:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ 
        message: `${field} already exists` 
      });
    }

    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update item (Admin only)
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const { itemId, name, category, description, status, quantity } = req.body;

    // Don't allow updating itemId or qrCode
    const updateData = {
      name,
      category,
      description,
      status,
      quantity
    };

    // Remove undefined fields
    Object.keys(updateData).forEach(key => 
      updateData[key] === undefined && delete updateData[key]
    );

    const item = await Item.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    res.json({
      message: 'Item updated successfully',
      item
    });
  } catch (error) {
    console.error('Update item error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete item (Admin only)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const item = await Item.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Delete item error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get QR code for item (Admin)
router.get('/:id/qr', protect, adminOnly, async (req, res) => {
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