import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
  itemId: {
    type: String,
    required: [true, 'Item ID is required'],
    unique: true
  },
  name: {
    type: String,
    required: [true, 'Item name is required']
  },
  category: {
    type: String,
    required: [true, 'Category is required']
  },
  description: {
    type: String
  },
  status: {
    type: String,
    enum: ['available', 'borrowed', 'maintenance', 'damaged'],
    default: 'available'
  },
  quantity: {
    type: Number,
    default: 1,
    min: 1
  },
  qrCode: {
    type: String,
    unique: true,
    sparse: true  // ← Allow null values to be unique
    // Remove required: true
  }
}, {
  timestamps: true
});

export default mongoose.model('Item', itemSchema);