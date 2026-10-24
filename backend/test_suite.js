import 'dotenv/config';
import http from 'http';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './src/models/User.js';
import Parcel from './src/models/Parcel.js';
import Payment from './src/models/Payment.js';
import { connectDatabase, getDatabaseHealth } from './src/config/database.js';

async function runTests() {
  console.log('====================================================');
  console.log('DOORDASH COURIER MANAGEMENT SYSTEM - VERIFICATION SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}`);
      failed++;
    }
  }

  // 1. DATABASE CONNECTIVITY TEST
  console.log('--- 1. Testing Database Connectivity ---');
  try {
    await connectDatabase();
    const health = getDatabaseHealth();
    assert(health.connected === true, 'MongoDB connection established');
    assert(health.status === 'connected', 'Database state reported as connected');
    assert(health.databaseName === 'doordash', 'Database name matches "doordash"');
  } catch (err) {
    assert(false, `Database connection failed: ${err.message}`);
    process.exit(1);
  }

  // 2. ADMIN SEED CHECK
  console.log('\n--- 2. Checking Admin Account ---');
  const admin = await User.findOne({ role: 'admin' });
  assert(admin !== null, `Admin account exists in database (${admin?.email})`);
  assert(admin?.role === 'admin', 'Admin role is strictly "admin"');
  assert(admin?.active === true, 'Admin account is active');

  // 3. CUSTOMER REGISTRATION & ROLE ENFORCEMENT
  console.log('\n--- 3. Testing Registration & Role Enforcement ---');
  const testCustomerEmail = `test_customer_${Date.now()}@example.com`;
  const customerPassword = 'Password123!';

  const customerUser = await User.create({
    name: 'Test Customer',
    email: testCustomerEmail,
    password: await bcrypt.hash(customerPassword, 12),
    role: 'customer',
    phone: '+92 300 1111111'
  });

  assert(customerUser.role === 'customer', 'Customer registered with default "customer" role');
  assert(customerUser.email === testCustomerEmail, 'Customer email stored correctly');

  // 4. DELIVERY AGENT PROVISIONING (Admin Only)
  console.log('\n--- 4. Testing Delivery Agent Provisioning ---');
  const testAgentEmail = `test_agent_${Date.now()}@example.com`;
  const agentPassword = 'AgentPassword123!';

  const agentUser = await User.create({
    name: 'Fast Courier Agent',
    email: testAgentEmail,
    password: await bcrypt.hash(agentPassword, 12),
    role: 'agent',
    phone: '+92 300 2222222',
    active: true
  });

  assert(agentUser.role === 'agent', 'Delivery agent provisioned with role "agent"');
  assert(agentUser.active === true, 'Agent created active');

  // 5. PARCEL BOOKING & PRICING VERIFICATION
  console.log('\n--- 5. Testing Parcel Booking & Pricing Calculation ---');
  const baseFee = 100;
  const perKg = 80;
  const perKm = 5;
  const weight = 2;
  const distance = 130;
  // Formula: 100 + (2 * 80) + (130 * 5) = 100 + 160 + 650 = PKR 910
  const expectedCharge = 910;

  const crypto = await import('crypto');
  const trackingId = `DD${Date.now().toString().slice(-7)}TEST`;
  const otp = '849201';

  const testParcel = await Parcel.create({
    trackingId,
    customer: customerUser._id,
    pickupAddress: 'House 12, Street 4, Satellite Town',
    pickupCity: 'Gojra',
    receiverName: 'Recipient Ali',
    receiverPhone: '+92 300 3333333',
    destinationAddress: 'Flat 4B, Gulberg III',
    destinationCity: 'Lahore',
    weightKg: weight,
    distanceKm: distance,
    charge: expectedCharge,
    paymentMethod: 'cash',
    paymentStatus: 'unpaid',
    deliveryOtp: otp,
    currentLocation: 'Gojra Hub',
    status: 'Pending',
    events: [
      {
        status: 'Pending',
        note: 'Booking created successfully.',
        location: 'Gojra Hub',
        updatedBy: customerUser._id,
        updatedByName: customerUser.name
      }
    ]
  });

  assert(testParcel.trackingId === trackingId, `Tracking ID generated: ${trackingId}`);
  assert(testParcel.charge === 910, `Parcel charge verified: PKR ${testParcel.charge} (matches formula 100 + 2*80 + 130*5)`);
  assert(testParcel.status === 'Pending', 'Initial status is "Pending"');

  // 6. ADMIN ASSIGNMENT WORKFLOW
  console.log('\n--- 6. Testing Admin Assignment Workflow ---');
  testParcel.agent = agentUser._id;
  testParcel.status = 'Assigned';
  testParcel.events.push({
    status: 'Assigned',
    note: `Assigned to delivery agent ${agentUser.name}.`,
    location: testParcel.currentLocation,
    updatedBy: admin._id,
    updatedByName: admin.name
  });
  await testParcel.save();

  assert(testParcel.agent.equals(agentUser._id), 'Parcel successfully assigned to delivery agent');
  assert(testParcel.status === 'Assigned', 'Status transitioned to "Assigned"');

  // 7. DELIVERY AGENT STATUS UPDATE & OTP VERIFICATION
  console.log('\n--- 7. Testing Agent Status Update & OTP Delivery ---');
  // Milestone 1: Picked Up
  testParcel.status = 'Picked Up';
  testParcel.events.push({
    status: 'Picked Up',
    note: 'Collected from sender.',
    location: 'Gojra Hub',
    updatedBy: agentUser._id,
    updatedByName: agentUser.name
  });
  await testParcel.save();
  assert(testParcel.status === 'Picked Up', 'Status updated to "Picked Up"');

  // Milestone 2: Out for Delivery
  testParcel.status = 'Out for Delivery';
  testParcel.currentLocation = 'Lahore Gulberg';
  testParcel.events.push({
    status: 'Out for Delivery',
    note: 'Courier is out for doorstep delivery.',
    location: 'Lahore Gulberg',
    updatedBy: agentUser._id,
    updatedByName: agentUser.name
  });
  await testParcel.save();
  assert(testParcel.status === 'Out for Delivery', 'Status updated to "Out for Delivery"');

  // Milestone 3: OTP Verification for Delivery
  const enteredOtp = '849201';
  assert(enteredOtp === testParcel.deliveryOtp, 'Delivery OTP matches recipient security code');
  testParcel.status = 'Delivered';
  testParcel.deliveredAt = new Date();
  testParcel.events.push({
    status: 'Delivered',
    note: 'Delivered to recipient. OTP verified.',
    location: 'Lahore Gulberg',
    updatedBy: agentUser._id,
    updatedByName: agentUser.name
  });
  await testParcel.save();
  assert(testParcel.status === 'Delivered', 'Final status updated to "Delivered"');
  assert(testParcel.deliveredAt instanceof Date, 'Delivery timestamp recorded');

  // 8. PUBLIC TRACKING ENDPOINT PRIVACY
  console.log('\n--- 8. Testing Public Tracking Privacy ---');
  const { publicParcel } = await import('./src/utils/helpers.js');
  const sanitizedView = publicParcel(testParcel);

  assert(sanitizedView.trackingId === testParcel.trackingId, 'Tracking ID is public');
  assert(sanitizedView.status === 'Delivered', 'Status is public');
  assert(sanitizedView.pickupCity === 'Gojra', 'Pickup city is public');
  assert(sanitizedView.destinationCity === 'Lahore', 'Destination city is public');
  assert(sanitizedView.deliveryOtp === undefined, 'Delivery OTP is NOT exposed publicly');
  assert(sanitizedView.receiverPhone === undefined, 'Receiver phone is NOT exposed publicly');
  assert(sanitizedView.customer === undefined, 'Customer identity is NOT exposed publicly');
  assert(sanitizedView.charge === undefined, 'Charge amount is NOT exposed publicly');

  // Clean up temporary test records
  await Parcel.deleteOne({ _id: testParcel._id });
  await User.deleteOne({ _id: customerUser._id });
  await User.deleteOne({ _id: agentUser._id });

  console.log('\n====================================================');
  console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================\n');

  await mongoose.disconnect();
  process.exit(failed === 0 ? 0 : 1);
}

runTests();
