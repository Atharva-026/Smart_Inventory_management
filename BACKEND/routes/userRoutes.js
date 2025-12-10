import express from 'express';
import User from '../models/User.js';
import Invitation from '../models/Invitation.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// Middleware to check if user is faculty
const facultyOnly = (req, res, next) => {
  if (req.user.role === 'faculty' || req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Faculty only.' });
  }
};

// 🔥 NEW: Get my students (Faculty only)
router.get('/my-students', protect, facultyOnly, async (req, res) => {
  try {
    // Find all accepted invitations by this faculty
    const acceptedInvitations = await Invitation.find({
      invitedBy: req.user.userId,
      status: 'accepted'
    });

    // Get student IDs from accepted invitations
    const studentEmails = acceptedInvitations.map(inv => inv.email);

    // Find students with those emails
    const students = await User.find({
      email: { $in: studentEmails },
      role: 'student'
    }).select('-password');

    // Add invitation code to each student
    const studentsWithCodes = students.map(student => {
      const invitation = acceptedInvitations.find(inv => inv.email === student.email);
      return {
        ...student.toObject(),
        invitationCode: invitation?.code
      };
    });

    res.json(studentsWithCodes);
  } catch (error) {
    console.error('Get my students error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete student (Faculty only) - NEW
router.delete('/my-students/:studentId', protect, async (req, res) => {
  try {
    const { studentId } = req.params;
    const facultyId = req.user.userId;

    // Find student
    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Check if student was invited by this faculty
    const invitation = await Invitation.findOne({
      email: student.email,
      invitedBy: facultyId
    });

    if (!invitation && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this student' });
    }

    // Delete student
    await User.findByIdAndDelete(studentId);

    // Mark invitation as expired
    if (invitation) {
      invitation.status = 'expired';
      await invitation.save();
    }

    // Delete all related transactions
    await Transaction.deleteMany({ 
      $or: [
        { studentId: studentId },
        { borrowedBy: studentId }
      ]
    });

    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Delete student error:', error);
    res.status(500).json({ message: 'Failed to delete student', error: error.message });
  }
});

// Get all users (Admin only)
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user by ID (Admin only)
router.get('/:id', protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update user (Admin only)
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const { password, ...updateData } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete user (Admin only)
router.delete('/:id', protect, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admin can delete users' });
    }

    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete related invitations
    await Invitation.deleteMany({ email: user.email });

    // Delete all related transactions
    await Transaction.deleteMany({ 
      $or: [
        { studentId: id },
        { borrowedBy: id }
      ]
    });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Failed to delete user', error: error.message });
  }
});

// Toggle user status (Admin only)
router.patch('/:id/toggle-status', protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({ 
      message: 'User status updated', 
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error('Toggle status error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user statistics (Admin only)
router.get('/stats/overview', protect, adminOnly, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const adminCount = await User.countDocuments({ role: 'admin' });
    const studentCount = await User.countDocuments({ role: 'student' });
    const facultyCount = await User.countDocuments({ role: 'faculty' });

    res.json({
      totalUsers,
      activeUsers,
      adminCount,
      studentCount,
      facultyCount
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;