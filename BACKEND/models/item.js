import mongoose from "mongoose";

const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  qrCode: { type: String, required: true, unique: true }, //  Must match physical QR on item
  compartmentNumber: { type: Number }, // Which locker compartment
  available: { type: Boolean, default: true },
  condition: { 
    type: String, 
    enum: ["Available", "In Use", "Under Maintenance"], 
    default: "Available" 
  },
  lastBorrowedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  lastBorrowedAt: { type: Date }
}, { timestamps: true });

const Item = mongoose.model("Item", itemSchema);

export default Item;