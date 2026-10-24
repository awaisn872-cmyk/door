import mongoose from 'mongoose';
const schema = new mongoose.Schema({ parcel: { type: mongoose.Schema.Types.ObjectId, ref: 'Parcel', required: true }, customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, amount: { type: Number, required: true }, method: { type: String, enum: ['cash', 'card'], required: true }, status: { type: String, enum: ['unpaid', 'paid', 'demo'], default: 'unpaid' }, reference: String }, { timestamps: true });
export default mongoose.model('Payment', schema);
