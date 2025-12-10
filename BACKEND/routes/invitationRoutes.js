import express from 'express';
import crypto from 'crypto';
import Invitation from '../models/Invitation.js';
import User from '../models/User.js';
import { protect } from '../middleware/authMiddleware.js';
import { sendEmail } from '../config/email.js';
import { invitationEmailTemplate } from '../utils/emailTemplates.js';

const router = express.Router();

// Helper function to generate unique invitation code
const generateInviteCode = () => {
  return crypto.randomBytes(4).toString('hex').toUpperCase();
};

// Middleware to check if user is faculty
const facultyOnly = (req, res, next) => {
  if (req.user.role === 'faculty') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Faculty only.' });
  }
};

// Send single invitation
router.post('/send', protect, async (req, res) => {
  try {
    const { email, studentName } = req.body;
    const userId = req.user.userId;

    // Validate email
    if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      return res.status(400).json({ message: 'Valid email is required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists. Please use a different email.' });
    }

    // Check if invitation already sent to this email (not accepted/expired)
    const existingInvitation = await Invitation.findOne({ 
      email, 
      status: { $in: ['pending'] }
    });

    if (existingInvitation) {
      return res.status(400).json({ message: 'An active invitation already exists for this email. Use resend option instead.' });
    }

    // Generate unique code
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();

    // Create invitation
    const invitation = new Invitation({
      email,
      studentName: studentName || email.split('@')[0],
      code,
      invitedBy: userId,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    await invitation.save();

    // Send email
    const invitationLink = `${process.env.FRONTEND_URL}/register?code=${code}&email=${email}`;
    
    try {
      await sendEmail({
        to: email,
        subject: 'Smart Inventory System - Student Registration Invitation',
        html: `
          <h2>Welcome, ${studentName || 'Student'}!</h2>
          <p>You have been invited to join the Smart Inventory Management System.</p>
          <p><a href="${invitationLink}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Accept Invitation & Register</a></p>
          <p>Or copy this link: ${invitationLink}</p>
          <p>This invitation will expire in 7 days.</p>
        `
      });
    } catch (emailError) {
      console.warn('Email sending failed (invitation still saved):', emailError.message);
    }

    res.status(201).json({ message: 'Invitation sent successfully', invitation });
  } catch (error) {
    console.error('Send invitation error:', error);
    res.status(500).json({ message: 'Failed to send invitation', error: error.message });
  }
});

// Resend invitation email
router.post('/resend/:invitationId', protect, async (req, res) => {
  try {
    const { invitationId } = req.params;
    const userId = req.user.userId;

    // Find the invitation
    const invitation = await Invitation.findById(invitationId);
    
    if (!invitation) {
      return res.status(404).json({ message: 'Invitation not found' });
    }

    // Check if invitation belongs to the current user
    if (invitation.invitedBy.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to resend this invitation' });
    }

    // Check if invitation is already accepted
    if (invitation.status === 'accepted') {
      return res.status(400).json({ message: 'Cannot resend accepted invitation' });
    }

    // Update expiry date (extend by 7 days)
    invitation.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    invitation.status = 'pending';
    await invitation.save();

    // Send email
    const invitationLink = `${process.env.FRONTEND_URL}/register?code=${invitation.code}&email=${invitation.email}`;
    
    try {
      await sendEmail({
        to: invitation.email,
        subject: 'Smart Inventory System - Student Registration Invitation (Resent)',
        html: `
          <h2>Your Invitation has been Resent</h2>
          <p>You have been invited to join the Smart Inventory Management System.</p>
          <p><a href="${invitationLink}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Accept Invitation</a></p>
          <p>Or copy this link: ${invitationLink}</p>
          <p>This invitation will expire in 7 days.</p>
        `
      });
    } catch (emailError) {
      console.warn('Email sending failed (invitation still updated):', emailError.message);
    }

    res.json({ message: 'Invitation resent successfully', invitation });
  } catch (error) {
    console.error('Resend invitation error:', error);
    res.status(500).json({ message: 'Failed to resend invitation', error: error.message });
  }
});

// Send bulk invitations (keep existing code)
router.post('/send-bulk', protect, facultyOnly, async (req, res) => {
  try {
    const { emails } = req.body;

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return res.status(400).json({ message: 'Emails array is required' });
    }

    const results = {
      success: [],
      failed: [],
      existing: []
    };

    const faculty = await User.findById(req.user.userId);

    for (const emailData of emails) {
      const email = typeof emailData === 'string' ? emailData : emailData.email;
      const studentName = typeof emailData === 'object' ? emailData.name : email;

      try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          results.existing.push({ email, reason: 'User already exists' });
          continue;
        }

        const existingInvitation = await Invitation.findOne({ 
          email, 
          status: 'pending' 
        });

        if (existingInvitation) {
          results.existing.push({ 
            email, 
            code: existingInvitation.code,
            reason: 'Invitation already sent' 
          });
          continue;
        }

        let code;
        let isUnique = false;
        while (!isUnique) {
          code = generateInviteCode();
          const existing = await Invitation.findOne({ code });
          if (!existing) isUnique = true;
        }

        const invitation = new Invitation({
          code,
          email,
          invitedBy: req.user.userId,
          role: 'student'
        });

        await invitation.save();

        const registrationLink = `${process.env.FRONTEND_URL}/register?code=${code}&email=${encodeURIComponent(email)}`;
        
        const emailResult = await sendEmail({
          to: email,
          subject: '🎓 You\'re Invited to Smart Inventory System!',
          html: invitationEmailTemplate(
            studentName,
            faculty.name,
            code,
            registrationLink
          )
        });

        results.success.push({
          email,
          code: invitation.code,
          expiresAt: invitation.expiresAt,
          emailSent: emailResult.success
        });
      } catch (error) {
        results.failed.push({ email, error: error.message });
      }
    }

    res.status(201).json({
      message: `Processed ${emails.length} invitations: ${results.success.length} sent, ${results.existing.length} already exist, ${results.failed.length} failed`,
      results
    });
  } catch (error) {
    console.error('Bulk invitation error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Verify invitation code (Public)
router.post('/verify', async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ message: 'Invitation code is required' });
    }

    const invitation = await Invitation.findOne({ 
      code: code.toUpperCase(), 
      status: 'pending' 
    }).populate('invitedBy', 'name email');

    if (!invitation) {
      return res.status(404).json({ message: 'Invalid or expired invitation code' });
    }

    if (invitation.expiresAt < new Date()) {
      invitation.status = 'expired';
      await invitation.save();
      return res.status(400).json({ message: 'Invitation code has expired' });
    }

    res.json({
      message: 'Valid invitation code',
      invitation: {
        code: invitation.code,
        email: invitation.email,
        invitedBy: invitation.invitedBy.name,
        expiresAt: invitation.expiresAt
      }
    });
  } catch (error) {
    console.error('Verify invitation error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get my sent invitations (Faculty only)
router.get('/my-invitations', protect, facultyOnly, async (req, res) => {
  try {
    const invitations = await Invitation.find({ invitedBy: req.user.userId })
      .sort({ createdAt: -1 });

    res.json(invitations);
  } catch (error) {
    console.error('Get invitations error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get invitation statistics (Faculty only)
router.get('/stats', protect, facultyOnly, async (req, res) => {
  try {
    const total = await Invitation.countDocuments({ invitedBy: req.user.userId });
    const pending = await Invitation.countDocuments({ 
      invitedBy: req.user.userId, 
      status: 'pending' 
    });
    const accepted = await Invitation.countDocuments({ 
      invitedBy: req.user.userId, 
      status: 'accepted' 
    });
    const expired = await Invitation.countDocuments({ 
      invitedBy: req.user.userId, 
      status: 'expired' 
    });

    res.json({
      total,
      pending,
      accepted,
      expired
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete invitation (Faculty only)
router.delete('/:id', protect, facultyOnly, async (req, res) => {
  try {
    const invitation = await Invitation.findOne({ 
      _id: req.params.id,
      invitedBy: req.user.userId 
    });

    if (!invitation) {
      return res.status(404).json({ message: 'Invitation not found' });
    }

    await invitation.deleteOne();

    res.json({ message: 'Invitation deleted successfully' });
  } catch (error) {
    console.error('Delete invitation error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;