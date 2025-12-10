import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['student', 'faculty', 'admin'],
    default: 'student'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // ✅ ADD THESE FIELDS
  invitedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  invitationCode: {
    type: String
  },
  department: {
    type: String
  }
}, {
  timestamps: true
});

export default mongoose.model('User', userSchema);