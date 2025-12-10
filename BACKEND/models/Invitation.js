import mongoose from 'mongoose';

const invitationSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true
  },
  invitedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  role: {
    type: String,
    enum: ['student', 'faculty'],
    default: 'student'
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'expired'],
    default: 'pending'
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
  },
  usedAt: {  // ✅ ADD THIS
    type: Date
  }
}, {
  timestamps: true
});

invitationSchema.index({ code: 1 });
invitationSchema.index({ email: 1, status: 1 });

export default mongoose.model('Invitation', invitationSchema);