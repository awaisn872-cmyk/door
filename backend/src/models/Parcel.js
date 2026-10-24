import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
  {
    status: { type: String, required: true },
    note: { type: String, default: '' },
    location: { type: String, default: '' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedByName: { type: String, default: 'System' },
    createdAt: { type: Date, default: Date.now }
  },
  { _id: true }
);

const parcelSchema = new mongoose.Schema(
  {
    trackingId: { type: String, unique: true, index: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    agent: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },

    pickupAddress: { type: String, required: true, trim: true },
    pickupCity: { type: String, required: true, trim: true },

    receiverName: { type: String, required: true, trim: true },
    receiverPhone: { type: String, required: true, trim: true },

    destinationAddress: { type: String, required: true, trim: true },
    destinationCity: { type: String, required: true, trim: true },

    weightKg: { type: Number, required: true, min: 0.1, max: 100 },
    description: { type: String, default: '', maxlength: 500 },
    distanceKm: { type: Number, required: true, min: 1 },
    charge: { type: Number, required: true, min: 0 },

    paymentMethod: { type: String, enum: ['cash', 'card'], default: 'cash' },
    paymentStatus: { type: String, enum: ['unpaid', 'paid', 'demo'], default: 'unpaid' },

    status: {
      type: String,
      enum: ['Pending', 'Assigned', 'Picked Up', 'In Transit', 'Out for Delivery', 'Delivered', 'Failed Delivery'],
      default: 'Pending',
      index: true
    },

    currentLocation: { type: String, default: 'Booking created' },
    deliveryOtp: { type: String, select: false },
    deliveredAt: { type: Date },
    failedReason: { type: String },
    events: [eventSchema]
  },
  { timestamps: true }
);

export default mongoose.model('Parcel', parcelSchema);
