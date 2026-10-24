import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = Router();

const safeUser = u => ({
  id: u._id,
  name: u.name,
  email: u.email,
  phone: u.phone,
  role: u.role,
  savedAddresses: u.savedAddresses || []
});

const issueToken = user =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });

// POST /api/auth/register - Public customer registration (Customers only)
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name?.trim() || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long.' });
    }

    const cleanEmail = String(email).toLowerCase().trim();
    const exists = await User.findOne({ email: cleanEmail });

    if (exists) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }

    // Role is strictly 'customer' for public registration
    const user = await User.create({
      name: name.trim(),
      email: cleanEmail,
      phone: String(phone || '').trim(),
      password: await bcrypt.hash(password, 12),
      role: 'customer',
      active: true
    });

    res.status(201).json({
      token: issueToken(user),
      user: safeUser(user),
      message: 'Account created successfully.'
    });
  } catch (e) {
    next(e);
  }
});

// POST /api/auth/login - Role-aware login validation
router.post('/login', async (req, res, next) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide both email and password.' });
    }

    const user = await User.findOne({ email: String(email).toLowerCase().trim() }).select('+password');

    if (!user || !user.active || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Email or password is incorrect.' });
    }

    const allowedRoles = ['admin', 'customer', 'agent'];
    if (role && allowedRoles.includes(role)) {
      if (user.role !== role) {
        const roleNames = {
          admin: 'an Administrator',
          customer: 'a Customer',
          agent: 'a Delivery Agent'
        };
        return res.status(403).json({
          message: `This account is registered as ${roleNames[user.role] || user.role}. Please select the matching role tab above to sign in.`
        });
      }
    }

    res.json({
      token: issueToken(user),
      user: safeUser(user)
    });
  } catch (e) {
    next(e);
  }
});

// GET /api/auth/me - Current user session
router.get('/me', protect, async (req, res) => {
  res.json({ user: safeUser(req.user) });
});

// PUT /api/auth/profile - Update name and phone
router.put('/profile', protect, async (req, res, next) => {
  try {
    const { name, phone } = req.body;
    if (!name?.trim()) {
      return res.status(400).json({ message: 'Name is required.' });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name: name.trim(), phone: String(phone || '').trim() },
      { new: true, runValidators: true }
    );

    res.json({ user: safeUser(user), message: 'Profile updated successfully.' });
  } catch (e) {
    next(e);
  }
});

// PUT /api/auth/change-password - Change account password (all roles)
router.put('/change-password', protect, async (req, res, next) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    if (!(await bcrypt.compare(currentPassword || '', user.password))) {
      return res.status(400).json({ message: 'Current password is incorrect.' });
    }

    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ message: 'New password must be at least 8 characters long.' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'New password and confirmation do not match.' });
    }

    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();

    res.json({ message: 'Password changed successfully. Please sign in again.' });
  } catch (e) {
    next(e);
  }
});

// PUT /api/auth/addresses - Customer saved addresses
router.put('/addresses', protect, async (req, res, next) => {
  try {
    const addresses = Array.isArray(req.body.addresses) ? req.body.addresses.slice(0, 20) : [];
    req.user.savedAddresses = addresses.map(a => ({
      label: String(a.label || '').trim().slice(0, 40),
      address: String(a.address || '').trim().slice(0, 250),
      city: String(a.city || '').trim().slice(0, 80)
    }));

    await req.user.save();
    res.json({ addresses: req.user.savedAddresses, message: 'Saved addresses updated.' });
  } catch (e) {
    next(e);
  }
});

export default router;
