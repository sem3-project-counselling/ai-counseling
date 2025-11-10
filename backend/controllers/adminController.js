// backend/controllers/adminController.js
const User = require('../models/User');
const Feedback = require('../models/Feedback');
const Session = require('../models/Session');
const Chat = require('../models/Chat');

/**
 * GET /api/admin/me
 * Returns the logged-in admin's profile (without password)
 */
const getAdminProfile = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ ok: false, error: 'Not authenticated' });
    }

    const user = await User.findById(req.user._id).select('-password -resetToken -resetTokenExpiry');
    if (!user) {
      return res.status(404).json({ ok: false, error: 'User not found' });
    }

    res.status(200).json({ ok: true, admin: user });
  } catch (error) {
    console.error('getAdminProfile error:', error);
    res.status(500).json({ ok: false, error: 'Server error' });
  }
};

/**
 * GET /api/admin/users
 * Returns all users (admin-only)
 */
const getAllUsers = async (req, res) => {
  try {
    const allowedRoles = ['superadmin', 'admin', 'manager'];
    if (!req.user || !allowedRoles.includes(String(req.user.role).toLowerCase())) {
      return res.status(403).json({ ok: false, error: 'Access denied' });
    }

    const users = await User.find().select('-password -resetToken -resetTokenExpiry').sort({ createdAt: -1 });
    res.status(200).json({ ok: true, users });
  } catch (error) {
    console.error('getAllUsers error:', error);
    res.status(500).json({ ok: false, error: 'Server error' });
  }
};

/**
 * GET /api/admin/stats
 * Returns aggregated stats for dashboard
 */
const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalAdmins = await User.countDocuments({ role: { $in: ['superadmin', 'admin', 'manager'] } });
    const totalClients = await User.countDocuments({ role: 'client' });
    const newUsersThisWeek = await User.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });

    const totalSessions = await Session.countDocuments();
    const totalFeedback = await Feedback.countDocuments();
    const totalChats = await Chat.countDocuments();

    // User growth over last 30 days (daily counts)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const userGrowth = await User.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    res.status(200).json({
      ok: true,
      stats: {
        totalUsers,
        totalAdmins,
        totalClients,
        newUsersThisWeek,
        totalSessions,
        totalFeedback,
        totalChats,
        userGrowth
      }
    });
  } catch (error) {
    console.error('getAdminStats error:', error);
    res.status(500).json({ ok: false, error: 'Server error' });
  }
};

/**
 * GET /api/admin/feedback
 * Returns all feedback with user details
 */
const getAllFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.find()
      .populate('userId', 'name email')
      .populate('sessionId', 'started_at completed')
      .sort({ submitted_at: -1 });

    res.status(200).json({ ok: true, feedback });
  } catch (error) {
    console.error('getAllFeedback error:', error);
    res.status(500).json({ ok: false, error: 'Server error' });
  }
};

/**
 * GET /api/admin/sessions
 * Returns all sessions with user details
 */
const getAllSessions = async (req, res) => {
  try {
    const sessions = await Session.find()
      .populate('userId', 'name email role')
      .sort({ started_at: -1 });

    res.status(200).json({ ok: true, sessions });
  } catch (error) {
    console.error('getAllSessions error:', error);
    res.status(500).json({ ok: false, error: 'Server error' });
  }
};

/**
 * GET /api/admin/chats/:sessionId
 * Returns chats for a specific session
 */
const getSessionChats = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const chats = await Chat.find({ sessionId })
      .populate('userId', 'name email')
      .sort({ timestamp: 1 });

    res.status(200).json({ ok: true, chats });
  } catch (error) {
    console.error('getSessionChats error:', error);
    res.status(500).json({ ok: false, error: 'Server error' });
  }
};

/**
 * PUT /api/admin/users/:id
 * Update user details (admin/manager only)
 */
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body;

    // Prevent changing superadmin roles
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ ok: false, error: 'User not found' });
    }

    if (user.role === 'superadmin' && req.user.role !== 'superadmin') {
      return res.status(403).json({ ok: false, error: 'Cannot modify superadmin' });
    }

    // Only superadmins can change roles to superadmin
    if (role === 'superadmin' && req.user.role !== 'superadmin') {
      return res.status(403).json({ ok: false, error: 'Only superadmins can assign superadmin role' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { name, email, role },
      { new: true, select: '-password -resetToken -resetTokenExpiry' }
    );

    res.status(200).json({ ok: true, user: updatedUser });
  } catch (error) {
    console.error('updateUser error:', error);
    res.status(500).json({ ok: false, error: 'Server error' });
  }
};

/**
 * DELETE /api/admin/users/:id
 * Delete user (admin/manager only)
 */
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ ok: false, error: 'User not found' });
    }

    // Prevent deleting superadmins
    if (user.role === 'superadmin') {
      return res.status(403).json({ ok: false, error: 'Cannot delete superadmin' });
    }

    await User.findByIdAndDelete(id);
    res.status(200).json({ ok: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('deleteUser error:', error);
    res.status(500).json({ ok: false, error: 'Server error' });
  }
};

/**
 * GET /api/admin/admins
 * Returns all admins/managers (superadmin only)
 */
const getAllAdmins = async (req, res) => {
  try {
    const admins = await User.find({ role: { $in: ['superadmin', 'admin', 'manager'] } })
      .select('-password -resetToken -resetTokenExpiry')
      .sort({ createdAt: -1 });

    res.status(200).json({ ok: true, admins });
  } catch (error) {
    console.error('getAllAdmins error:', error);
    res.status(500).json({ ok: false, error: 'Server error' });
  }
};

/**
 * POST /api/admin/admins
 * Add new admin/manager (superadmin only)
 */
const addAdmin = async (req, res) => {
  try {
    const { email, role, upgrade } = req.body;

    if (!email || !role) {
      return res.status(400).json({ ok: false, error: 'Email and role required' });
    }

    if (!['admin', 'manager'].includes(role)) {
      return res.status(400).json({ ok: false, error: 'Invalid role' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      if (upgrade) {
        // Upgrade existing user's role
        existingUser.role = role;
        await existingUser.save();

        // Send reset password email for role upgrade
        const crypto = require('crypto');
        const token = crypto.randomBytes(32).toString('hex');
        const expiry = Date.now() + 1000 * 60 * 60 * 24; // 24 hours

        existingUser.resetToken = token;
        existingUser.resetTokenExpiry = expiry;
        await existingUser.save();

        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

        await sendAdminEmail(email, resetUrl, 'role upgrade');

        return res.status(200).json({
          ok: true,
          admin: { _id: existingUser._id, name: existingUser.name, email: existingUser.email, role: existingUser.role },
          message: 'User role upgraded and reset email sent'
        });
      } else {
        // Return existing user info for confirmation
        return res.status(409).json({
          ok: false,
          error: 'Email already exists',
          existingUser: {
            _id: existingUser._id,
            name: existingUser.name,
            email: existingUser.email,
            role: existingUser.role
          }
        });
      }
    }

    // Create new user with temporary password (they'll reset via email)
    const tempPassword = Math.random().toString(36).slice(-12);
    const hashedPassword = await require('bcryptjs').hash(tempPassword, 10);

    const newAdmin = new User({
      name: email.split('@')[0], // temporary name
      email,
      password: hashedPassword,
      role
    });

    await newAdmin.save();

    // Send reset password email
    const crypto = require('crypto');
    const token = crypto.randomBytes(32).toString('hex');
    const expiry = Date.now() + 1000 * 60 * 60 * 24; // 24 hours

    newAdmin.resetToken = token;
    newAdmin.resetTokenExpiry = expiry;
    await newAdmin.save();

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

    await sendAdminEmail(email, resetUrl, 'account creation');

    res.status(201).json({ ok: true, admin: { _id: newAdmin._id, name: newAdmin.name, email: newAdmin.email, role: newAdmin.role } });
  } catch (error) {
    console.error('addAdmin error:', error);
    res.status(500).json({ ok: false, error: 'Server error' });
  }
};

/**
 * Helper function to send professional admin email
 */
const sendAdminEmail = async (email, resetUrl, type) => {
  const subject = type === 'role upgrade'
    ? 'Admin Role Upgraded - Set Your Password'
    : 'Admin Account Created - Set Your Password';

  const textMessage = type === 'role upgrade'
    ? `Your admin role has been upgraded. Please set your password using this link: ${resetUrl}`
    : `Your admin account has been created. Please set your password using this link: ${resetUrl}`;

  const htmlMessage = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
      <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <h2 style="color: #333; text-align: center; margin-bottom: 20px;">AI Counselling System</h2>
        <p style="color: #555; font-size: 16px; line-height: 1.6;">
          ${type === 'role upgrade'
            ? 'Your admin role has been upgraded. To access your account, you need to set a password.'
            : 'Your admin account has been created. To get started, you need to set a password.'}
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #007bff; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Set Password</a>
        </div>
        <p style="color: #777; font-size: 14px; text-align: center;">
          If the button doesn't work, copy and paste this link into your browser:<br>
          <a href="${resetUrl}" style="color: #007bff;">${resetUrl}</a>
        </p>
        <p style="color: #777; font-size: 14px; text-align: center; margin-top: 20px;">
          This link will expire in 24 hours for security reasons.
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #999; font-size: 12px; text-align: center;">
          If you didn't request this, please ignore this email.
        </p>
      </div>
    </div>
  `;

  if (process.env.SMTP_USER && process.env.SMTP_HOST && process.env.SMTP_HOST !== 'smtp.example.com' && process.env.SMTP_HOST !== '') {
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === 'true',
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    });

    try {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM || 'no-reply@aicounselling.com',
        to: email,
        subject,
        text: textMessage,
        html: htmlMessage
      });
      console.log(`Admin ${type} email sent successfully to:`, email);
    } catch (emailErr) {
      console.error(`Failed to send admin ${type} email:`, emailErr);
      throw emailErr; // Re-throw to handle in calling function if needed
    }
  } else {
    console.log(`Admin ${type} email for ${email}. Reset URL (no SMTP configured): ${resetUrl}`);
  }
};

module.exports = {
  getAdminProfile,
  getAllUsers,
  getAdminStats,
  getAllFeedback,
  getAllSessions,
  getSessionChats,
  updateUser,
  deleteUser,
  getAllAdmins,
  addAdmin
};
