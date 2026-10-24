import { Router } from 'express';
import crypto from 'crypto';
import Parcel from '../models/Parcel.js';
import Payment from '../models/Payment.js';
import { protect, allowRoles } from '../middleware/auth.js';
import { getPricing, calculateCharge, makeTrackingId, publicParcel } from '../utils/helpers.js';

const router = Router();

// GET /api/parcels/pricing - Public delivery pricing rates
router.get('/pricing', async (_req, res, next) => {
  try {
    const p = await getPricing();
    res.json({
      perKg: p.perKg,
      perKm: p.perKm,
      baseFee: p.baseFee,
      cityDistances: Object.fromEntries(p.cityDistances || [])
    });
  } catch (e) {
    next(e);
  }
});

// GET /api/parcels/track/:trackingId - Public parcel tracking (sanitized, privacy-safe)
router.get('/track/:trackingId', async (req, res, next) => {
  try {
    const trackingId = String(req.params.trackingId || '').trim().toUpperCase();
    if (!trackingId) {
      return res.status(400).json({ message: 'Tracking ID is required.' });
    }

    const p = await Parcel.findOne({ trackingId });
    if (!p) {
      return res.status(404).json({
        message: `No parcel found with Tracking ID "${trackingId}". Please check and try again.`
      });
    }

    res.json({ parcel: publicParcel(p) });
  } catch (e) {
    next(e);
  }
});

// POST /api/parcels - Customer parcel booking
router.post('/', protect, allowRoles('customer'), async (req, res, next) => {
  try {
    const {
      pickupAddress,
      pickupCity,
      receiverName,
      receiverPhone,
      destinationAddress,
      destinationCity,
      weightKg,
      description,
      distanceKm,
      paymentMethod
    } = req.body;

    const requiredFields = {
      pickupAddress,
      pickupCity,
      receiverName,
      receiverPhone,
      destinationAddress,
      destinationCity,
      weightKg,
      distanceKm
    };

    for (const [key, value] of Object.entries(requiredFields)) {
      if (value === undefined || value === null || String(value).trim() === '') {
        return res.status(400).json({ message: `Field "${key}" is required.` });
      }
    }

    const weight = Number(weightKg);
    const distance = Number(distanceKm);

    if (!Number.isFinite(weight) || weight < 0.1 || weight > 100) {
      return res.status(400).json({ message: 'Weight must be between 0.1 and 100 kg.' });
    }

    if (!Number.isFinite(distance) || distance < 1 || distance > 5000) {
      return res.status(400).json({ message: 'Distance must be between 1 and 5000 km.' });
    }

    const method = paymentMethod === 'card' ? 'card' : 'cash';
    const pricing = await getPricing();
    const charge = calculateCharge(weight, distance, pricing);

    // Generate unique tracking ID
    let trackingId = makeTrackingId();
    while (await Parcel.exists({ trackingId })) {
      trackingId = makeTrackingId();
    }

    // 6-digit delivery verification OTP
    const otp = String(crypto.randomInt(100000, 1000000));

    const parcel = await Parcel.create({
      trackingId,
      customer: req.user._id,
      pickupAddress: pickupAddress.trim(),
      pickupCity: pickupCity.trim(),
      receiverName: receiverName.trim(),
      receiverPhone: receiverPhone.trim(),
      destinationAddress: destinationAddress.trim(),
      destinationCity: destinationCity.trim(),
      weightKg: weight,
      description: String(description || '').trim(),
      distanceKm: distance,
      charge,
      paymentMethod: method,
      paymentStatus: method === 'card' ? 'demo' : 'unpaid',
      deliveryOtp: otp,
      currentLocation: pickupCity.trim(),
      events: [
        {
          status: 'Pending',
          note: 'Booking created successfully.',
          location: pickupCity.trim(),
          updatedBy: req.user._id,
          updatedByName: req.user.name,
          createdAt: new Date()
        }
      ]
    });

    await Payment.create({
      parcel: parcel._id,
      customer: req.user._id,
      amount: charge,
      method,
      status: parcel.paymentStatus,
      reference: method === 'card' ? `DEMO-${trackingId}` : undefined
    });

    res.status(201).json({
      parcel,
      message:
        method === 'card'
          ? 'Booking created. Card payment simulated in demo mode.'
          : 'Booking created successfully. Payment will be collected in cash.',
      deliveryOtp: otp
    });
  } catch (e) {
    next(e);
  }
});

// GET /api/parcels/mine - Customer booking history (includes OTP for customer verification)
router.get('/mine', protect, allowRoles('customer'), async (req, res, next) => {
  try {
    const parcels = await Parcel.find({ customer: req.user._id })
      .select('+deliveryOtp')
      .sort({ createdAt: -1 })
      .populate('agent', 'name phone email');

    res.json({ parcels });
  } catch (e) {
    next(e);
  }
});

// GET /api/parcels/assigned - Delivery agent active route and assigned shipments
router.get('/assigned', protect, allowRoles('agent'), async (req, res, next) => {
  try {
    const parcels = await Parcel.find({ agent: req.user._id })
      .sort({ createdAt: -1 })
      .populate('customer', 'name phone email');

    res.json({ parcels });
  } catch (e) {
    next(e);
  }
});

// GET /api/parcels/:id - Parcel details with strict ownership verification
router.get('/:id', protect, async (req, res, next) => {
  try {
    let query = Parcel.findById(req.params.id)
      .populate('customer', 'name phone email')
      .populate('agent', 'name phone email');

    // Customer can see their deliveryOtp; others cannot
    if (req.user.role === 'customer') {
      query = query.select('+deliveryOtp');
    }

    const p = await query;
    if (!p) {
      return res.status(404).json({ message: 'Parcel not found.' });
    }

    if (req.user.role === 'customer' && String(p.customer?._id || p.customer) !== String(req.user._id)) {
      return res.status(403).json({ message: 'You can only access your own parcel bookings.' });
    }

    if (req.user.role === 'agent' && (!p.agent || String(p.agent?._id || p.agent) !== String(req.user._id))) {
      return res.status(403).json({ message: 'This parcel is not assigned to your delivery route.' });
    }

    res.json({ parcel: p });
  } catch (e) {
    next(e);
  }
});

// PATCH /api/parcels/:id/status - Update parcel delivery status (Agent or Admin)
router.patch('/:id/status', protect, allowRoles('agent', 'admin'), async (req, res, next) => {
  try {
    const { status, location, note, otp, failedReason } = req.body;
    const allowed = ['Picked Up', 'In Transit', 'Out for Delivery', 'Delivered', 'Failed Delivery'];

    if (!allowed.includes(status)) {
      return res.status(400).json({
        message: `Invalid status. Allowed statuses are: ${allowed.join(', ')}.`
      });
    }

    const p = await Parcel.findById(req.params.id);
    if (!p) {
      return res.status(404).json({ message: 'Parcel not found.' });
    }

    if (p.status === 'Delivered') {
      return res.status(400).json({ message: 'Delivered parcels cannot have their status updated.' });
    }

    // Role-based authority: Agent can only update their own assigned parcel
    if (req.user.role === 'agent') {
      if (!p.agent || String(p.agent) !== String(req.user._id)) {
        return res.status(403).json({ message: 'This parcel is not assigned to your route.' });
      }
    }

    // If marking as Delivered, verify recipient OTP
    if (status === 'Delivered') {
      const stored = await Parcel.findById(p._id).select('+deliveryOtp');
      const enteredOtp = String(otp || '').trim();

      if (!enteredOtp || enteredOtp !== stored.deliveryOtp) {
        return res.status(400).json({
          message: 'Correct 6-digit delivery OTP is required to complete delivery.'
        });
      }
      p.deliveredAt = new Date();
    }

    if (status === 'Failed Delivery' && !String(failedReason || '').trim()) {
      return res.status(400).json({ message: 'Please provide a reason for failed delivery.' });
    }

    p.status = status;
    p.currentLocation = String(location || p.destinationCity).trim().slice(0, 120);
    p.failedReason = status === 'Failed Delivery' ? String(failedReason).trim().slice(0, 300) : undefined;

    p.events.push({
      status,
      note: note || (status === 'Failed Delivery' ? failedReason : `Status updated to ${status}.`),
      location: p.currentLocation,
      updatedBy: req.user._id,
      updatedByName: req.user.name,
      createdAt: new Date()
    });

    await p.save();

    const populated = await Parcel.findById(p._id)
      .populate('customer', 'name phone email')
      .populate('agent', 'name phone email');

    res.json({
      parcel: populated,
      message: `Parcel status updated to ${status}.`
    });
  } catch (e) {
    next(e);
  }
});

export default router;
