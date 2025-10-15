import express from "express";
import Transaction from "../models/Transaction.js";
import Item from "../models/Item.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// ⚠️ IMPORTANT: Specific routes MUST come before parameterized routes like /:id

// Get user's transactions (Protected) - MOVED BEFORE GET /
router.get('/my-transactions', protect, async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user.userId })
      .populate('item', 'name itemId category')
      .sort({ borrowDate: -1 });

    res.json(transactions);
  } catch (error) {
    console.error('Get my transactions error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get active borrowings (Protected) - MOVED BEFORE GET /
router.get('/active', protect, async (req, res) => {
  try {
    const query = req.user.role === 'admin' 
      ? { status: 'active' }
      : { user: req.user.userId, status: 'active' };

    const transactions = await Transaction.find(query)
      .populate('user', 'name email')
      .populate('item', 'name itemId category')
      .sort({ borrowDate: -1 });

    res.json(transactions);
  } catch (error) {
    console.error('Get active transactions error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get overdue transactions (Admin only) - MOVED BEFORE GET /
router.get('/overdue', protect, adminOnly, async (req, res) => {
  try {
    const transactions = await Transaction.find({
      status: 'active',
      dueDate: { $lt: new Date() }
    })
      .populate('user', 'name email')
      .populate('item', 'name itemId category')
      .sort({ dueDate: 1 });

    res.json(transactions);
  } catch (error) {
    console.error('Get overdue transactions error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all transactions (Admin only) - Root path
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .populate('user', 'name email')
      .populate('item', 'name itemId category')
      .sort({ borrowDate: -1 });

    res.json(transactions);
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get transaction by ID (Protected) - MUST BE AFTER specific routes
router.get('/:id', protect, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate('user', 'name email')
      .populate('item', 'name itemId category');

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Check access
    if (transaction.user._id.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(transaction);
  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Borrow item (Protected - student/faculty)
router.post('/borrow', protect, async (req, res) => {
  try {
    const { itemId } = req.body;

    if (!itemId) {
      return res.status(400).json({ message: 'Item ID is required' });
    }

    // Check if item exists and is available
    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    if (item.status !== 'available') {
      return res.status(400).json({ message: 'Item is not available' });
    }

    // Create transaction
    const transaction = new Transaction({
      user: req.user.userId,
      item: itemId,
      borrowDate: new Date(),
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      status: 'active'
    });

    await transaction.save();

    // Update item status ONLY
    await Item.findByIdAndUpdate(
      itemId,
      { status: 'borrowed' },
      { new: true }
    );

    // Populate and return
    const populatedTransaction = await Transaction.findById(transaction._id)
      .populate('user', 'name email')
      .populate('item', 'name itemId category');

    res.status(201).json({
      message: 'Item borrowed successfully',
      transaction: populatedTransaction
    });
  } catch (error) {
    console.error('Borrow error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Return item (Protected)
router.post('/return/:transactionId', protect, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.transactionId);

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Check if user owns this transaction or is admin
    if (transaction.user.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Update transaction
    transaction.returnDate = new Date();
    transaction.status = 'returned';
    await transaction.save();

    // Update item status ONLY
    await Item.findByIdAndUpdate(
      transaction.item,
      { status: 'available' },
      { new: true }
    );

    // Populate and return
    const populatedTransaction = await Transaction.findById(transaction._id)
      .populate('user', 'name email')
      .populate('item', 'name itemId category');

    res.json({
      message: 'Item returned successfully',
      transaction: populatedTransaction
    });
  } catch (error) {
    console.error('Return error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;