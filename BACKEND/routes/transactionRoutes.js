import express from "express";
import Transaction from "../models/transaction.js";
import Item from "../models/item.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

//  Scan QR to borrow item
router.post("/borrow", protect, async (req, res) => {
  try {
    const { qrCode } = req.body; // Student scans physical QR code
    
    if (!qrCode) {
      return res.status(400).json({ message: "QR code is required" });
    }

    // Find item by scanned QR code
    const item = await Item.findOne({ qrCode });

    if (!item) {
      return res.status(404).json({ message: "Item not found. Invalid QR code." });
    }
    
    if (!item.available) {
      return res.status(400).json({ 
        message: "Item already borrowed",
        borrowedBy: item.lastBorrowedBy
      });
    }

    if (item.condition === "Under Maintenance") {
      return res.status(400).json({ message: "Item is under maintenance" });
    }

    // Create transaction
    const transaction = new Transaction({
      userId: req.user.id,
      itemId: item._id,
    });
    await transaction.save();

    // Update item status
    item.available = false;
    item.condition = "In Use";
    item.lastBorrowedBy = req.user.id;
    item.lastBorrowedAt = new Date();
    await item.save();

    res.status(201).json({ 
      message: `Item borrowed successfully. Please place in compartment ${item.compartmentNumber || 'assigned'}`, 
      transaction,
      item: {
        _id: item._id,
        name: item.name,
        compartmentNumber: item.compartmentNumber,
        qrCode: item.qrCode
      },
      //  Signal to unlock cupboard (for hardware integration)
      unlockCompartment: item.compartmentNumber
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Scan QR to return item
router.post("/return", protect, async (req, res) => {
  try {
    const { qrCode } = req.body; // Student scans physical QR code
    
    if (!qrCode) {
      return res.status(400).json({ message: "QR code is required" });
    }

    // Find item by scanned QR code
    const item = await Item.findOne({ qrCode });

    if (!item) {
      return res.status(404).json({ message: "Item not found. Invalid QR code." });
    }

    // Find active transaction for this user and item
    const transaction = await Transaction.findOne({ 
      itemId: item._id,
      userId: req.user.id,
      status: "borrowed" 
    });
    
    if (!transaction) {
      return res.status(400).json({ 
        message: "No active borrow found. You haven't borrowed this item or it's already returned." 
      });
    }

    // Update transaction
    transaction.status = "returned";
    transaction.returnedAt = new Date();
    await transaction.save();

    // Update item status
    item.available = true;
    item.condition = "Available";
    await item.save();

    res.json({ 
      message: `Item returned successfully to compartment ${item.compartmentNumber || 'default'}`, 
      transaction,
      item: {
        _id: item._id,
        name: item.name,
        compartmentNumber: item.compartmentNumber
      },
      //  Signal to unlock cupboard for return (for hardware integration)
      unlockCompartment: item.compartmentNumber
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

//  Get user's transaction history
router.get("/history", protect, async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user.id })
      .populate("itemId", "name qrCode compartmentNumber")
      .sort({ borrowedAt: -1 });
    
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

//  Get all transactions (Admin only)
router.get("/all", protect, adminOnly, async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .populate("userId", "name email")
      .populate("itemId", "name qrCode")
      .sort({ borrowedAt: -1 });
    
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

export default router;