import crypto from 'crypto';
import Pricing from '../models/Pricing.js';
export const makeTrackingId = () => `DD${Date.now().toString().slice(-7)}${crypto.randomBytes(2).toString('hex').toUpperCase()}`;
export async function getPricing() { let pricing = await Pricing.findOne(); if (!pricing) pricing = await Pricing.create({}); return pricing; }
export function calculateCharge(weightKg, distanceKm, pricing) { return Math.round((Number(pricing.baseFee) + Number(weightKg) * Number(pricing.perKg) + Number(distanceKm) * Number(pricing.perKm)) * 100) / 100; }
export const publicParcel = (p) => ({ trackingId: p.trackingId, status: p.status, currentLocation: p.currentLocation, pickupCity: p.pickupCity, destinationCity: p.destinationCity, createdAt: p.createdAt, updatedAt: p.updatedAt, deliveredAt: p.deliveredAt, events: p.events?.map(e => ({ status: e.status, note: e.note, location: e.location, updatedByName: e.updatedByName, createdAt: e.createdAt })) || [] });
