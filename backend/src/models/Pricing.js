import mongoose from 'mongoose';
const schema = new mongoose.Schema({ perKg: { type: Number, min: 0, default: 80 }, perKm: { type: Number, min: 0, default: 5 }, baseFee: { type: Number, min: 0, default: 100 }, cityDistances: { type: Map, of: Number, default: {} } }, { timestamps: true });
export default mongoose.model('Pricing', schema);
