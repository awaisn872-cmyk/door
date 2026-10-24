import { Router } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Parcel from '../models/Parcel.js';
import Payment from '../models/Payment.js';
import Pricing from '../models/Pricing.js';
import { protect, allowRoles } from '../middleware/auth.js';
import { getPricing } from '../utils/helpers.js';

const router = Router();
router.use(protect, allowRoles('admin'));

// GET /api/admin/overview - Real-time system statistics and recent bookings
router.get('/overview', async (_req, res, next) => {
  try {
    const [
      totalParcels,
      pending,
      assigned,
      unassigned,
      pickedUp,
      inTransit,
      outForDelivery,
      delivered,
      failedDelivery,
      customers,
      agents,
      activeAgents,
      recent,
      statusCounts,
      revenue
    ] = await Promise.all([
      Parcel.countDocuments(),
      Parcel.countDocuments({ status: 'Pending' }),
      Parcel.countDocuments({ status: 'Assigned' }),
      Parcel.countDocuments({ agent: null, status: { $nin: ['Delivered', 'Failed Delivery'] } }),
      Parcel.countDocuments({ status: 'Picked Up' }),
      Parcel.countDocuments({ status: 'In Transit' }),
      Parcel.countDocuments({ status: 'Out for Delivery' }),
      Parcel.countDocuments({ status: 'Delivered' }),
      Parcel.countDocuments({ status: 'Failed Delivery' }),
      User.countDocuments({ role: 'customer' }),
      User.countDocuments({ role: 'agent' }),
      User.countDocuments({ role: 'agent', active: true }),
      Parcel.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('customer', 'name email phone')
        .populate('agent', 'name email phone'),
      Parcel.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Payment.aggregate([
        { $match: { status: { $in: ['paid', 'demo'] } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ])
    ]);

    const transitTotal = assigned + pickedUp + inTransit + outForDelivery;

    res.json({
      stats: {
        totalParcels,
        pending,
        assigned,
        unassigned,
        pickedUp,
        inTransit,
        outForDelivery,
        transit: transitTotal,
        delivered,
        failedDelivery,
        customers,
        agents,
        activeAgents,
        revenue: revenue[0]?.total || 0
      },
      recent,
      statusCounts
    });
  } catch (e) {
    next(e);
  }
});

// GET /api/admin/parcels - List parcels with optional status, unassigned filter and search
router.get('/parcels', async (req, res, next) => {
  try {
    const filter = {};

    if (req.query.unassigned === 'true') {
      filter.agent = null;
    } else if (req.query.status && req.query.status !== 'All') {
      filter.status = req.query.status;
    }

    if (req.query.q) {
      const q = String(req.query.q).trim();
      filter.$or = [
        { trackingId: { $regex: q, $options: 'i' } },
        { receiverName: { $regex: q, $options: 'i' } },
        { receiverPhone: { $regex: q, $options: 'i' } },
        { destinationCity: { $regex: q, $options: 'i' } },
        { pickupCity: { $regex: q, $options: 'i' } }
      ];
    }

    const parcels = await Parcel.find(filter)
      .sort({ createdAt: -1 })
      .populate('customer', 'name email phone')
      .populate('agent', 'name email phone');

    res.json({ parcels });
  } catch (e) {
    next(e);
  }
});

// GET /api/admin/users - List users by role
router.get('/users', async (req, res, next) => {
  try {
    const filter = {};
    if (['customer', 'agent'].includes(req.query.role)) {
      filter.role = req.query.role;
    }
    if (req.query.q) {
      const q = String(req.query.q).trim();
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
        { phone: { $regex: q, $options: 'i' } }
      ];
    }
    const users = await User.find(filter).select('-password').sort({ createdAt: -1 });
    res.json({ users });
  } catch (e) {
    next(e);
  }
});

// POST /api/admin/agents - Provision a new delivery agent account
router.post('/agents', async (req, res, next) => {
  try {
    const { name, email, phone, password } = req.body;
    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({ message: 'Name, email and password are required.' });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    if (await User.exists({ email: cleanEmail })) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }

    const user = await User.create({
      name: name.trim(),
      email: cleanEmail,
      phone: String(phone || '').trim(),
      password: await bcrypt.hash(password, 12),
      role: 'agent',
      active: true
    });

    res.status(201).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        active: user.active
      },
      message: 'Delivery agent account created successfully.'
    });
  } catch (e) {
    next(e);
  }
});

// PATCH /api/admin/users/:id/active - Activate / deactivate an account
router.patch('/users/:id/active', async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.role === 'admin') {
      return res.status(404).json({ message: 'User not found or cannot be modified.' });
    }

    user.active = Boolean(req.body.active);
    await user.save();

    res.json({
      message: `Account has been ${user.active ? 'activated' : 'deactivated'}.`,
      user: { id: user._id, active: user.active }
    });
  } catch (e) {
    next(e);
  }
});

// PATCH /api/admin/parcels/:id/assign - Assign delivery agent to a parcel
router.patch('/parcels/:id/assign', async (req, res, next) => {
  try {
    const { agentId } = req.body;
    const parcel = await Parcel.findById(req.params.id);

    if (!parcel) {
      return res.status(404).json({ message: 'Parcel not found.' });
    }

    if (parcel.status === 'Delivered') {
      return res.status(400).json({ message: 'Delivered parcels cannot be reassigned.' });
    }

    let agent = null;
    if (agentId) {
      agent = await User.findOne({ _id: agentId, role: 'agent', active: true });
      if (!agent) {
        return res.status(400).json({ message: 'Selected delivery agent is invalid or inactive.' });
      }
    }

    parcel.agent = agent ? agent._id : null;

    // Transition status to Assigned if was Pending; transition back to Pending if unassigned
    if (agent) {
      if (parcel.status === 'Pending') {
        parcel.status = 'Assigned';
      }
    } else {
      if (parcel.status === 'Assigned') {
        parcel.status = 'Pending';
      }
    }

    const note = agent
      ? `Assigned to delivery agent ${agent.name}.`
      : 'Delivery agent assignment removed.';

    parcel.events.push({
      status: parcel.status,
      note,
      location: parcel.currentLocation || parcel.pickupCity,
      updatedBy: req.user._id,
      updatedByName: req.user.name,
      createdAt: new Date()
    });

    await parcel.save();

    const populated = await Parcel.findById(parcel._id)
      .populate('customer', 'name email phone')
      .populate('agent', 'name email phone');

    res.json({
      parcel: populated,
      message: agent ? `Parcel assigned to ${agent.name}.` : 'Parcel unassigned.'
    });
  } catch (e) {
    next(e);
  }
});

// GET /api/admin/pricing - View rate configuration
router.get('/pricing', async (_req, res, next) => {
  try {
    const p = await getPricing();
    res.json({ pricing: p });
  } catch (e) {
    next(e);
  }
});

// PUT /api/admin/pricing - Update delivery rates
router.put('/pricing', async (req, res, next) => {
  try {
    const perKg = Number(req.body.perKg);
    const perKm = Number(req.body.perKm);
    const baseFee = Number(req.body.baseFee);

    if ([perKg, perKm, baseFee].some(n => !Number.isFinite(n) || n < 0 || n > 100000)) {
      return res.status(400).json({ message: 'Pricing rates must be non-negative numbers.' });
    }

    const p = await getPricing();
    p.perKg = perKg;
    p.perKm = perKm;
    p.baseFee = baseFee;
    await p.save();

    res.json({ pricing: p, message: 'Delivery pricing rates updated successfully.' });
  } catch (e) {
    next(e);
  }
});

// GET /api/admin/payments - View payment audit log
router.get('/payments', async (_req, res, next) => {
  try {
    const payments = await Payment.find()
      .sort({ createdAt: -1 })
      .limit(200)
      .populate('parcel', 'trackingId status')
      .populate('customer', 'name email');
    res.json({ payments });
  } catch (e) {
    next(e);
  }
});

// GET /api/admin/reports - View monthly volume and charge totals
router.get('/reports', async (_req, res, next) => {
  try {
    const monthly = await Parcel.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          bookings: { $sum: 1 },
          charges: { $sum: '$charge' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 }
    ]);

    const statuses = await Parcel.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    res.json({ monthly, statuses });
  } catch (e) {
    next(e);
  }
});

export default router;
