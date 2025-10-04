import express from "express";
import Item from "../models/item.js";   
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

//  Admin adds item with pre-existing QR code
router.post("/", protect, adminOnly, async (req, res) => {
  try {
    const { name, description, qrCode, compartmentNumber } = req.body;

    // Check if QR code already exists
    const existingItem = await Item.findOne({ qrCode });
    if (existingItem) {
      return res.status(400).json({ message: "Item with this QR code already exists" });
    }

    const item = new Item({ 
      name, 
      description,
      qrCode,
      compartmentNumber
    });
    
    await item.save();

    res.status(201).json({ 
      message: "Item added successfully", 
      item
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

//  Get all items
router.get("/", protect, async (req, res) => {
  try {
    const items = await Item.find().populate("lastBorrowedBy", "name email");
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

//  Get item by QR code (when student scans)
router.get("/qr/:qrCode", protect, async (req, res) => {
  try {
    const item = await Item.findOne({ qrCode: req.params.qrCode })
      .populate("lastBorrowedBy", "name email");
    
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }
    
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

//  Update item
router.put("/:id", protect, adminOnly, async (req, res) => {
  try {
    const { name, description, compartmentNumber, condition } = req.body;
    
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    if (name) item.name = name;
    if (description !== undefined) item.description = description;
    if (compartmentNumber !== undefined) item.compartmentNumber = compartmentNumber;
    if (condition) item.condition = condition;

    await item.save();

    res.json({ message: "Item updated successfully", item });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

//  Delete item
router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    await item.deleteOne();
    
    res.json({ message: "Item deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

export default router;