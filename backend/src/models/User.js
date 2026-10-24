import mongoose from 'mongoose';
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 80 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, trim: true, default: '' },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ['admin', 'customer', 'agent'], default: 'customer' },
  active: { type: Boolean, default: true },
  savedAddresses: [{ label: String, address: String, city: String }]
}, { timestamps: true });
export default mongoose.model('User', userSchema);
