import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  MapPin,
  Package,
  ShieldCheck,
  Truck,
  Zap,
  Search,
  Globe2,
  Headphones,
  UserRound,
  Shield,
  Bike,
  Mail,
  Phone,
  ArrowLeft,
  Calculator,
  Send,
  HelpCircle
} from 'lucide-react';
import api, { messageOf } from '../api';
import { PublicNav, Brand, StatusBadge } from '../components/Shared';
import AuthForm from './AuthForm';
import toast from 'react-hot-toast';

export function Home() {
  const [quickTrackId, setQuickTrackId] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'DoorDash Courier | Reliable Parcel Delivery & Tracking';
    const description = document.querySelector('meta[name="description"]');
    if (description) {
      description.content =
        'DoorDash Courier Management System - Fast, dependable parcel delivery, real-time tracking, transparent rates, and role-based logistics.';
    }
  }, []);

  function handleQuickTrack(e) {
    e.preventDefault();
    if (!quickTrackId.trim()) return;
    navigate(`/track?id=${encodeURIComponent(quickTrackId.trim().toUpperCase())}`);
  }

  return (
    <>
      <PublicNav />
      <main>
        {/* HERO SECTION */}
        <section className="hero">
          <div className="hero-grid" />
          <div className="container hero-content">
            <div className="hero-copy">
              <div className="pill">
                <span className="live-dot" /> LIVE LOGISTICS DISPATCH NETWORK
              </div>
              <h1>
                Your parcels.<br />
                Our <span>priority.</span>
              </h1>
              <p>
                Fast, dependable courier delivery that keeps your packages moving and your customers connected.
                Track shipments in real time, calculate exact delivery charges, and manage door-to-door logistics seamlessly.
              </p>

              {/* Quick Tracking Widget on Hero */}
              <form onSubmit={handleQuickTrack} className="hero-quick-track">
                <div className="hero-quick-track-input">
                  <Search size={18} />
                  <input
                    value={quickTrackId}
                    onChange={e => setQuickTrackId(e.target.value)}
                    placeholder="Enter Tracking ID (e.g. DD1234567AB)"
                    aria-label="Quick track parcel ID"
                  />
                </div>
                <button type="submit" className="btn btn-primary">
                  Track Parcel <ArrowRight size={16} />
                </button>
              </form>

              <div className="hero-actions">
                <Link className="btn btn-primary btn-large" to="/register">
                  Ship a Parcel <ArrowRight size={18} />
                </Link>
                <Link className="btn btn-outline btn-large" to="/pricing-info">
                  <Calculator size={18} /> Delivery Charges
                </Link>
              </div>

              <div className="hero-trust">
                <div className="avatar-stack">
                  <i>DD</i>
                  <i>PK</i>
                  <i>EX</i>
                  <i>+</i>
                </div>
                <div>
                  <b>Dependable Door-to-Door Delivery</b>
                  <small>Verified tracking & OTP delivery confirmation</small>
                </div>
                <div className="trust-stars">
                  ★★★★★
                  <small>Proven reliability</small>
                </div>
              </div>
            </div>

            <div className="hero-visual">
              <div className="visual-orbit orbit-one" />
              <div className="visual-orbit orbit-two" />
              <div className="visual-circle">
                <div className="parcel-illustration">
                  <Package size={110} strokeWidth={1.2} />
                  <span className="parcel-label">DOORDASH · EXPRESS</span>
                </div>
              </div>
              <div className="float-card float-top">
                <span className="float-icon green">
                  <CheckCircle2 size={18} />
                </span>
                <div>
                  <b>Parcel Out for Delivery</b>
                  <small>Agent on route to destination</small>
                </div>
                <span className="float-time">Live</span>
              </div>
              <div className="float-card float-bottom">
                <span className="float-icon orange">
                  <MapPin size={18} />
                </span>
                <div>
                  <b>Accurate Timeline</b>
                  <small>Every milestone verified</small>
                </div>
                <ArrowUpRight size={17} />
              </div>
              <div className="visual-sticker">
                MOVE<br />
                WITH<br />
                <b>CARE.</b>
              </div>
            </div>
          </div>

          <div className="hero-bottom container">
            <span>
              <ShieldCheck size={18} /> Verified Delivery with 6-Digit Recipient OTP
            </span>
            <span>
              <Clock3 size={18} /> Real-Time Parcel Journey Updates
            </span>
            <span>
              <Zap size={18} /> Transparent Pricing: Base Fee + Weight + Distance
            </span>
          </div>
        </section>

        {/* LOGISTICS TICKER */}
        <section className="delivery-marquee" aria-label="DoorDash delivery features">
          <div className="delivery-marquee-track">
            <span>SMARTER SHIPPING</span>
            <i>✳</i>
            <span>DOORSTEP PICKUP</span>
            <i>✳</i>
            <span>REAL-TIME TRACKING</span>
            <i>✳</i>
            <span>OTP DELIVERY VERIFICATION</span>
            <i>✳</i>
            <span>FLEET COORDINATION</span>
            <i>✳</i>
            <span>TRANSPARENT PKR RATES</span>
            <i>✳</i>
            <span>SMARTER SHIPPING</span>
            <i>✳</i>
            <span>DOORSTEP PICKUP</span>
            <i>✳</i>
            <span>REAL-TIME TRACKING</span>
            <i>✳</i>
            <span>OTP DELIVERY VERIFICATION</span>
            <i>✳</i>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="section bg-light">
          <div className="container">
            <div className="section-heading">
              <div>
                <div className="eyebrow">HOW DOORDASH WORKS</div>
                <h2>
                  From booking to delivery<br />
                  in <span>four simple steps.</span>
                </h2>
              </div>
              <p>
                Our structured workflow ensures transparent pricing, reliable courier assignments, and complete visibility every mile.
              </p>
            </div>

            <div className="workflow-grid">
              <div className="workflow-step">
                <span className="step-num">01</span>
                <h3>Book Parcel Online</h3>
                <p>
                  Enter pickup and destination details, parcel weight, and route distance. Instantly view calculated delivery charges.
                </p>
              </div>

              <div className="workflow-step">
                <span className="step-num">02</span>
                <h3>Instant Tracking & OTP</h3>
                <p>
                  Receive a unique tracking ID and a secure 6-digit delivery verification OTP for the recipient.
                </p>
              </div>

              <div className="workflow-step">
                <span className="step-num">03</span>
                <h3>Courier Assigned</h3>
                <p>
                  The administrator assigns an active delivery agent who picks up the package and updates live progress.
                </p>
              </div>

              <div className="workflow-step">
                <span className="step-num">04</span>
                <h3>OTP Handover & Delivery</h3>
                <p>
                  The agent completes delivery only after verifying the customer’s OTP, guaranteeing accurate doorstep delivery.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SERVICES SECTION */}
        <section className="section" id="services">
          <div className="container">
            <div className="section-heading">
              <div>
                <div className="eyebrow">WHAT WE DELIVER</div>
                <h2>
                  Logistics solutions<br />
                  built for <span>your pace.</span>
                </h2>
              </div>
              <p>
                Whether sending an urgent document across the city or managing regional logistics, DoorDash has the right service for you.
              </p>
            </div>

            <div className="service-grid">
              <article className="service-card">
                <div className="service-icon">
                  <Package size={24} />
                </div>
                <span className="service-number">01 / EXPRESS PARCELS</span>
                <h3>Door-to-Door Courier</h3>
                <p>
                  Quick pickup from your doorstep and reliable delivery to any recipient address with verified tracking.
                </p>
                <Link to="/register">
                  Book a delivery <ArrowRight size={16} />
                </Link>
              </article>

              <article className="service-card featured">
                <div className="service-icon">
                  <MapPin size={24} />
                </div>
                <span className="service-number">02 / LIVE VISIBILITY</span>
                <h3>Milestone Parcel Tracking</h3>
                <p>
                  Follow every stage of the shipment from Booking, Pickup, In Transit, to Out for Delivery without guessing.
                </p>
                <Link to="/track">
                  Track your parcel <ArrowRight size={16} />
                </Link>
              </article>

              <article className="service-card">
                <div className="service-icon">
                  <Calculator size={24} />
                </div>
                <span className="service-number">03 / RATE TRANSPARENCY</span>
                <h3>Standard PKR Pricing</h3>
                <p>
                  Predictable charges based on base booking fee, per-kilogram weight, and route distance. No surprise fees.
                </p>
                <Link to="/pricing-info">
                  Calculate charges <ArrowRight size={16} />
                </Link>
              </article>
            </div>
          </div>
        </section>

        {/* ABOUT OVERVIEW */}
        <section className="section about-section" id="about">
          <div className="container about-grid">
            <div className="about-art">
              <div className="about-art-card">
                <div className="about-art-head">
                  <Brand />
                  <span>PARCEL JOURNEY</span>
                </div>
                <div className="route-line">
                  <i />
                  <span />
                  <i />
                  <span />
                  <i />
                </div>
                <div className="route-labels">
                  <span>Pickup City</span>
                  <span>In Transit</span>
                  <span>Destination</span>
                </div>
                <div className="about-package">
                  <Package size={38} />
                  <div>
                    <b>Verified Parcel Dispatch</b>
                    <small>Real-time updates, no guesswork</small>
                  </div>
                  <CheckCircle2 size={20} />
                </div>
              </div>
              <div className="about-sticker">
                BUILT FOR<br />
                <b>DEPENDABLE<br />DELIVERIES</b>
              </div>
            </div>

            <div className="about-copy">
              <div className="eyebrow">THE DOORDASH DIFFERENCE</div>
              <h2>
                Full control.<br />
                From <span>pickup to doorstep.</span>
              </h2>
              <p>
                DoorDash connects customers, administrators, and delivery agents into a single unified workspace.
                Customers book and track packages effortlessly, administrators oversee assignments, and agents fulfill deliveries with verified OTP handovers.
              </p>
              <ul>
                <li>
                  <CheckCircle2 size={18} /> Accurate delivery rates calculated from real distance and weight
                </li>
                <li>
                  <CheckCircle2 size={18} /> 6-digit delivery verification OTP protects every recipient
                </li>
                <li>
                  <CheckCircle2 size={18} /> Dedicated portals for Admin, Customer, and Delivery Agent
                </li>
              </ul>
              <Link className="btn btn-dark" to="/register">
                Get started today <ArrowRight size={17} />
              </Link>
            </div>
          </div>
        </section>

        {/* CTA BANNER */}
        <section className="cta-band">
          <div className="container cta-inner">
            <div>
              <div className="eyebrow">START SHIPPING TODAY</div>
              <h2>
                Make your next delivery<br />
                your easiest one yet.
              </h2>
            </div>
            <div className="cta-actions">
              <Link className="btn btn-primary btn-large" to="/register">
                Create Free Account <ArrowRight size={18} />
              </Link>
              <Link className="btn btn-outline btn-large" to="/pricing-info">
                View Rates Breakdown <ArrowUpRight size={18} />
              </Link>
            </div>
          </div>
        </section>
      </main>
      <PublicFooter />
    </>
  );
}

export function TrackPage() {
  const [id, setId] = useState('');
  const [parcel, setParcel] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = 'Track Parcel | DoorDash Courier';
    // Check if query param ?id= was passed
    const params = new URLSearchParams(window.location.search);
    const queryId = params.get('id');
    if (queryId) {
      setId(queryId);
      performSearch(queryId);
    }
  }, []);

  async function performSearch(trackingId) {
    const cleanId = String(trackingId || '').trim();
    if (!cleanId) return;

    setLoading(true);
    setError('');
    setParcel(null);

    try {
      const response = await api.get(`/parcels/track/${encodeURIComponent(cleanId.toUpperCase())}`);
      setParcel(response.data.parcel);
    } catch (err) {
      setError(messageOf(err));
    } finally {
      setLoading(false);
    }
  }

  function submit(e) {
    e.preventDefault();
    performSearch(id);
  }

  return (
    <>
      <PublicNav />
      <main className="track-page">
        <div className="track-hero">
          <div className="eyebrow">REAL-TIME SHIPMENT VISIBILITY</div>
          <h1>
            Track your <span>parcel journey.</span>
          </h1>
          <p>
            Enter your unique DoorDash Tracking ID below to view current milestone, route details, and status updates.
          </p>

          <form className="track-search" onSubmit={submit}>
            <Search size={18} />
            <input
              value={id}
              onChange={e => setId(e.target.value)}
              placeholder="e.g. DD1234567AB"
              aria-label="Tracking ID"
              required
            />
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? 'Locating…' : 'Track Parcel'} <ArrowRight size={17} />
            </button>
          </form>

          <div className="track-help">
            <ShieldCheck size={16} /> Privacy-safe: Sensitive contact and billing details are protected.
          </div>
        </div>

        {error && (
          <div className="container">
            <div className="alert alert-error">
              <strong>Unable to find parcel:</strong> {error}
            </div>
          </div>
        )}

        {parcel && (
          <div className="container track-result">
            <div className="track-result-head">
              <div>
                <span className="eyebrow">TRACKING ID</span>
                <h2>{parcel.trackingId}</h2>
                <p>
                  <span>{parcel.pickupCity}</span>
                  <ArrowRight size={15} />
                  <span>{parcel.destinationCity}</span>
                </p>
              </div>
              <StatusBadge status={parcel.status} />
            </div>

            <div className="track-current">
              <span className="track-current-icon">
                <Truck size={24} />
              </span>
              <div>
                <small>CURRENT LOCATION & STATUS</small>
                <h3>{parcel.status}</h3>
                <p>{parcel.currentLocation || 'Location update pending dispatch'}</p>
              </div>
            </div>

            <div className="timeline">
              <h3>Shipment Milestone History</h3>
              {[...(parcel.events || [])].reverse().map((ev, i) => (
                <div className="timeline-item" key={`${ev.status}-${i}`}>
                  <span className={`timeline-dot ${i === 0 ? 'current' : ''}`} />
                  <div>
                    <b>{ev.status}</b>
                    <p>{ev.note || `Parcel status changed to ${ev.status}`}</p>
                    <small>
                      {ev.location} · {new Date(ev.createdAt).toLocaleString()}
                    </small>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
      <PublicFooter />
    </>
  );
}

export function DeliveryChargesPage() {
  const [rates, setRates] = useState({ baseFee: 100, perKg: 80, perKm: 5 });
  const [weight, setWeight] = useState(2);
  const [distance, setDistance] = useState(130);

  useEffect(() => {
    document.title = 'Delivery Charges & Calculator | DoorDash Courier';
    api
      .get('/parcels/pricing')
      .then(res => {
        if (res.data) {
          setRates({
            baseFee: Number(res.data.baseFee || 100),
            perKg: Number(res.data.perKg || 80),
            perKm: Number(res.data.perKm || 5)
          });
        }
      })
      .catch(() => {});
  }, []);

  const numWeight = Math.max(0.1, Number(weight || 0));
  const numDistance = Math.max(1, Number(distance || 0));
  const weightCharge = Math.round(numWeight * rates.perKg * 100) / 100;
  const distanceCharge = Math.round(numDistance * rates.perKm * 100) / 100;
  const total = Math.round((rates.baseFee + weightCharge + distanceCharge) * 100) / 100;

  const money = n => `PKR ${Number(n || 0).toLocaleString('en-PK', { maximumFractionDigits: 2 })}`;

  return (
    <>
      <PublicNav />
      <main className="information-page">
        <section className="information-hero">
          <div className="container">
            <div className="eyebrow">TRANSPARENT TARIFF RATES</div>
            <h1>Delivery Charges & Rate Calculator</h1>
            <p>
              Our rates are straightforward and predictable. We use a standardized formula calculated from base booking fee, parcel weight, and route distance.
            </p>
          </div>
        </section>

        <section className="container pricing-calculator-section">
          <div className="pricing-formula-card">
            <div className="eyebrow">PRICING FORMULA</div>
            <h3>Delivery Charges = Base Fee + (Weight × Rate/KG) + (Distance × Rate/KM)</h3>
            <p>All rates are denominated in Pakistani Rupees (PKR).</p>
          </div>

          <div className="calculator-grid">
            <div className="panel calculator-inputs">
              <div className="panel-head">
                <div>
                  <h2>Estimate Your Shipment</h2>
                  <p>Adjust weight and route distance to calculate charges.</p>
                </div>
              </div>

              <div className="form-stack">
                <label>
                  Parcel Weight (Kilograms)
                  <input
                    type="number"
                    min="0.1"
                    max="100"
                    step="0.5"
                    value={weight}
                    onChange={e => setWeight(e.target.value)}
                  />
                  <small className="field-help">Allowed range: 0.1 kg to 100 kg</small>
                </label>

                <label>
                  Route Distance (Kilometres)
                  <input
                    type="number"
                    min="1"
                    max="5000"
                    step="1"
                    value={distance}
                    onChange={e => setDistance(e.target.value)}
                  />
                  <small className="field-help">Estimated driving distance between pickup and destination</small>
                </label>

                <div className="pricing-sample-note">
                  <CheckCircle2 size={16} />
                  <span>
                    Current Active Rates: Base Fee <b>{money(rates.baseFee)}</b> | Rate per KG <b>{money(rates.perKg)}</b> | Rate per KM <b>{money(rates.perKm)}</b>
                  </span>
                </div>
              </div>
            </div>

            <div className="panel calculator-summary">
              <span className="quick-action-icon">
                <Calculator size={20} />
              </span>
              <div className="eyebrow">INSTANT BREAKDOWN</div>
              <h2>Estimated Total</h2>

              <div className="summary-line">
                <span>Base Booking Fee</span>
                <b>{money(rates.baseFee)}</b>
              </div>

              <div className="summary-line">
                <span>Weight ({numWeight} kg × {money(rates.perKg)})</span>
                <b>{money(weightCharge)}</b>
              </div>

              <div className="summary-line">
                <span>Distance ({numDistance} km × {money(rates.perKm)})</span>
                <b>{money(distanceCharge)}</b>
              </div>

              <div className="summary-total">
                <span>Total Delivery Charge</span>
                <b>{money(total)}</b>
              </div>

              <div className="summary-note">
                <CheckCircle2 size={16} />
                <span>
                  The final charge is verified by the backend server when you confirm your booking.
                </span>
              </div>

              <Link to="/register" className="btn btn-primary btn-full btn-large">
                Ship This Parcel <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </section>
      </main>
      <PublicFooter />
    </>
  );
}

export function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    document.title = 'Contact & Support | DoorDash Courier';
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    setBusy(true);

    setTimeout(() => {
      setBusy(false);
      setSubmitted(true);
      toast.success('Your message has been received. Our support team will respond shortly.');
    }, 600);
  }

  return (
    <>
      <PublicNav />
      <main className="information-page">
        <section className="information-hero">
          <div className="container">
            <div className="eyebrow">WE ARE HERE TO HELP</div>
            <h1>Contact & Support Center</h1>
            <p>
              Have a question about a parcel, tracking ID, delivery route, or account setup? Reach out to our customer care team.
            </p>
          </div>
        </section>

        <section className="container contact-grid-section">
          <div className="contact-info-cards">
            <div className="contact-card">
              <Mail size={24} className="contact-card-icon" />
              <h3>Email Support</h3>
              <p>For tracking inquiries, billing assistance, and account questions.</p>
              <b>support@doordash-courier.local</b>
              <small>Average response: Within 2 to 4 hours</small>
            </div>

            <div className="contact-card">
              <Phone size={24} className="contact-card-icon" />
              <h3>Operations Helpline</h3>
              <p>Direct assistance for couriers, urgent shipments, and delivery OTP issues.</p>
              <b>+92 300 0000000</b>
              <small>Available Monday – Saturday, 8:00 AM – 9:00 PM</small>
            </div>

            <div className="contact-card">
              <HelpCircle size={24} className="contact-card-icon" />
              <h3>Tracking Help</h3>
              <p>Have your Tracking ID ready (e.g. DD1234567AB) for the fastest assistance.</p>
              <Link to="/track" className="text-link">
                Open tracking portal <ArrowRight size={15} />
              </Link>
            </div>
          </div>

          <div className="panel contact-form-panel">
            <div className="panel-head">
              <div>
                <h2>Send Us a Message</h2>
                <p>Complete the form below and an agent will be in touch.</p>
              </div>
            </div>

            {submitted ? (
              <div className="contact-success-state">
                <CheckCircle2 size={48} className="text-green" />
                <h3>Thank You for Contacting Us</h3>
                <p>Your inquiry has been received. A support representative will follow up via email.</p>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => {
                    setSubmitted(false);
                    setForm({ name: '', email: '', subject: '', message: '' });
                  }}
                >
                  Send another inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="form-stack">
                <label>
                  Your Full Name
                  <input
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. John Doe"
                    required
                  />
                </label>

                <label>
                  Email Address
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    placeholder="name@example.com"
                    required
                  />
                </label>

                <label>
                  Tracking ID or Subject
                  <input
                    value={form.subject}
                    onChange={e => setForm({ ...form, subject: e.target.value })}
                    placeholder="e.g. DD1234567AB or Booking Inquiry"
                    required
                  />
                </label>

                <label>
                  Message
                  <textarea
                    rows={4}
                    value={form.message}
                    onChange={e => setForm({ ...form, message: e.target.value })}
                    placeholder="Describe your question or issue in detail..."
                    required
                  />
                </label>

                <button type="submit" className="btn btn-primary btn-large" disabled={busy}>
                  <Send size={17} /> {busy ? 'Submitting…' : 'Submit Message'}
                </button>
              </form>
            )}
          </div>
        </section>
      </main>
      <PublicFooter />
    </>
  );
}

export function ServicesPage() {
  useEffect(() => {
    document.title = 'Delivery Services | DoorDash Courier';
  }, []);

  return (
    <>
      <PublicNav />
      <main className="information-page">
        <section className="information-hero">
          <div className="container">
            <div className="eyebrow">OUR CAPABILITIES</div>
            <h1>Comprehensive Courier Logistics</h1>
            <p>
              Explore our core delivery services designed for individuals, growing e-commerce businesses, and enterprise parcel management.
            </p>
          </div>
        </section>

        <section className="container section">
          <div className="service-grid">
            <article className="service-card">
              <div className="service-icon">
                <Package size={24} />
              </div>
              <span className="service-number">01 / PARCEL DISPATCH</span>
              <h3>Express Doorstep Courier</h3>
              <p>
                Effortless pickup from sender premises and rapid transit to destination city with recipient delivery notification.
              </p>
              <Link to="/register">
                Ship a parcel <ArrowRight size={16} />
              </Link>
            </article>

            <article className="service-card featured">
              <div className="service-icon">
                <MapPin size={24} />
              </div>
              <span className="service-number">02 / VISIBILITY</span>
              <h3>End-to-End Tracking</h3>
              <p>
                Real-time milestone tracking for senders and recipients. Receive timestamped location and status updates.
              </p>
              <Link to="/track">
                Track a parcel <ArrowRight size={16} />
              </Link>
            </article>

            <article className="service-card">
              <div className="service-icon">
                <ShieldCheck size={24} />
              </div>
              <span className="service-number">03 / SECURITY</span>
              <h3>OTP Verified Delivery</h3>
              <p>
                Every parcel includes an exclusive 6-digit delivery verification OTP, ensuring the package is handed over only to the intended recipient.
              </p>
              <Link to="/pricing-info">
                View charges <ArrowRight size={16} />
              </Link>
            </article>
          </div>
        </section>
      </main>
      <PublicFooter />
    </>
  );
}

export function PublicFooter() {
  return (
    <footer className="public-footer">
      <div className="container footer-main">
        <div className="footer-brand-column">
          <Brand light />
          <p>
            Dependable parcel delivery, verified tracking, and transparent pricing. Connecting customers, fleet agents, and operations across the courier lifecycle.
          </p>
          <div className="footer-contact">
            <Link to="/contact">
              <Mail size={15} /> Support Center
            </Link>
            <span>
              <Phone size={15} /> Operational Courier Assistance
            </span>
          </div>
        </div>

        <div className="footer-links-column">
          <h3>Services</h3>
          <Link to="/">Home</Link>
          <Link to="/services">Delivery Services</Link>
          <Link to="/track">Track Parcel</Link>
          <Link to="/pricing-info">Delivery Charges</Link>
        </div>

        <div className="footer-links-column">
          <h3>Workspaces</h3>
          <Link to="/login">Admin Login</Link>
          <Link to="/login">Customer Login</Link>
          <Link to="/login">Delivery Agent Login</Link>
          <Link to="/register">Register as Customer</Link>
        </div>

        <div className="footer-links-column">
          <h3>Company & Policies</h3>
          <Link to="/about">About Us</Link>
          <Link to="/contact">Contact Support</Link>
          <Link to="/terms">Terms & Conditions</Link>
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/refund">Refund Policy</Link>
        </div>
      </div>

      <div className="container footer-bottom">
        <span>&copy; {new Date().getFullYear()} DoorDash Courier Management System. All rights reserved.</span>
        <span>Built for dependable deliveries and fleet management.</span>
      </div>
    </footer>
  );
}

export function InformationPage({ path }) {
  const legalContent = {
    '/about': {
      eyebrow: 'WHO WE ARE',
      title: 'Logistics Built on Clarity and Care',
      intro: 'DoorDash is a courier management platform designed to make parcel delivery easier to book, follow, and manage.',
      sections: [
        ['Our Purpose', 'We connect customers, administrators, and delivery agents in a single transparent workspace. Clear milestone statuses and accurate tracking eliminate guesswork.'],
        ['Platform Architecture', 'Customers create bookings and receive unique tracking IDs with delivery verification OTPs. Administrators oversee assignments and rates. Couriers update progress on the move.'],
        ['Reliability and Trust', 'We provide predictable PKR pricing, verified OTP handovers, and clear timeline history for every package.']
      ]
    },
    '/terms': {
      eyebrow: 'LEGAL AGREEMENT',
      title: 'Terms & Conditions',
      intro: 'These terms explain the operating rules for using the DoorDash Courier Management System.',
      sections: [
        ['Accurate Information', 'Users must provide accurate sender, recipient, address, and parcel weight details.'],
        ['Prohibited Items', 'Hazardous, flammable, illegal, leaking, or improperly packaged goods are strictly prohibited.'],
        ['Account Security', 'Users are responsible for maintaining credential secrecy and not attempting unauthorized access to other accounts or roles.'],
        ['Delivery & Verification', 'Deliveries require recipient presentation of the 6-digit delivery OTP to confirm receipt.']
      ]
    },
    '/privacy': {
      eyebrow: 'DATA PROTECTION',
      title: 'Privacy Policy',
      intro: 'This policy describes how parcel, sender, and recipient details are processed securely.',
      sections: [
        ['Information Handled', 'We process account names, emails, contact numbers, pickup and destination addresses, and parcel specifications.'],
        ['How Information is Used', 'Information is used exclusively to facilitate parcel booking, route assignments, status tracking, and delivery fulfillment.'],
        ['Public Endpoint Privacy', 'Our public parcel tracking endpoint never exposes customer phone numbers, sender contact details, or billing records.'],
        ['Security Measures', 'Passwords are encrypted using bcrypt hashing, and API routes enforce strict JWT token authorization.']
      ]
    },
    '/refund': {
      eyebrow: 'PAYMENTS & CANCELLATIONS',
      title: 'Refund Policy',
      intro: 'Expectations for reviewing courier charges, booking cancellations, and payment claims.',
      sections: [
        ['Cancellation Before Collection', 'Bookings cancelled prior to courier pickup are eligible for full cancellation and charge review.'],
        ['Shipments In Transit', 'Once a parcel has been picked up by a delivery agent and placed in transit, standard delivery charges apply.'],
        ['Cash on Delivery & Demo Payments', 'Demo card payments are simulated for development workflow. Cash on delivery amounts are collected upon verified delivery.']
      ]
    }
  };

  const page = legalContent[path] || legalContent['/about'];

  useEffect(() => {
    document.title = `${page.title} | DoorDash Courier`;
  }, [path, page]);

  return (
    <>
      <PublicNav />
      <main className="information-page">
        <section className="information-hero">
          <div className="container">
            <div className="eyebrow">{page.eyebrow}</div>
            <h1>{page.title}</h1>
            <p>{page.intro}</p>
          </div>
        </section>

        <section className="container information-content">
          {page.sections.map(([heading, body], i) => (
            <article className="information-section" key={heading}>
              <span className="information-index">{String(i + 1).padStart(2, '0')}</span>
              <div>
                <h2>{heading}</h2>
                <p>{body}</p>
              </div>
            </article>
          ))}
          <Link className="btn btn-outline" to="/">
            <ArrowLeft size={16} /> Back to website
          </Link>
        </section>
      </main>
      <PublicFooter />
    </>
  );
}

export function AuthPage({ mode }) {
  const isLogin = mode === 'login';
  const [selectedRole, setSelectedRole] = useState('customer');

  useEffect(() => {
    document.title = isLogin
      ? 'Sign In | DoorDash Courier'
      : 'Create Customer Account | DoorDash Courier';
  }, [isLogin]);

  // Requirement 5: Three clear role options: Admin, Customer, Delivery Agent
  const roles = [
    {
      id: 'admin',
      label: 'Login as Admin',
      detail: 'Operations, Fleet & Rates',
      Icon: Shield
    },
    {
      id: 'customer',
      label: 'Login as Customer',
      detail: 'Book & Track Parcels',
      Icon: UserRound
    },
    {
      id: 'agent',
      label: 'Login as Delivery Agent',
      detail: 'Assigned Routes & OTPs',
      Icon: Bike
    }
  ];

  return (
    <>
      <div className="auth-top">
        <Brand />
        <Link to="/" className="text-link">
          <ArrowLeft size={15} /> Back to website
        </Link>
      </div>

      <div className="auth-layout">
        <div className="auth-promo">
          <div className="eyebrow">DOORDASH LOGISTICS NETWORK</div>
          <h1>
            Move your parcels<br />
            forward<span>.</span>
          </h1>
          <p>
            Experience unified courier management. Book shipments with instant PKR estimates, track routes with live milestone updates, and ensure safe doorstep delivery with verified OTP handovers.
          </p>

          <div className="auth-promo-features">
            <div className="auth-promo-item">
              <CheckCircle2 size={18} className="text-orange" />
              <span>Three dedicated role-based portals</span>
            </div>
            <div className="auth-promo-item">
              <CheckCircle2 size={18} className="text-orange" />
              <span>Real-time tracking without guessing</span>
            </div>
            <div className="auth-promo-item">
              <CheckCircle2 size={18} className="text-orange" />
              <span>Secure 6-digit delivery OTP verification</span>
            </div>
          </div>

          <div className="auth-promo-bottom">
            <div className="auth-promo-icon">
              <Truck size={22} />
            </div>
            <div>
              <b>Unified Logistics Workspace</b>
              <small>Customers · Fleet Agents · Administration</small>
            </div>
          </div>
        </div>

        <div className="auth-form-wrap">
          <div className="auth-form-area">
            {/* REQUIREMENT 5: 3 Clear Role Selection Options Near Top */}
            {isLogin && (
              <div className="role-picker">
                <span className="auth-step">SELECT SIGN-IN ROLE</span>
                <h2 className="role-picker-title">How are you logging in?</h2>
                <p className="role-picker-description">
                  Choose your role portal below to access the appropriate workspace.
                </p>

                <div className="role-options">
                  {roles.map(({ id, label, detail, Icon }) => (
                    <button
                      type="button"
                      key={id}
                      className={`role-option ${selectedRole === id ? 'selected' : ''}`}
                      onClick={() => setSelectedRole(id)}
                      aria-pressed={selectedRole === id}
                    >
                      <span className="role-option-icon">
                        <Icon size={20} />
                      </span>
                      <span className="role-option-copy">
                        <b>{label}</b>
                        <small>{detail}</small>
                      </span>
                      <span className="role-option-radio" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            <AuthForm isLogin={isLogin} selectedRole={selectedRole} />
          </div>
        </div>
      </div>
    </>
  );
}
