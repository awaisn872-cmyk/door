import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Calculator,
  CheckCircle2,
  MapPin,
  Plus,
  Save,
  Trash2,
  Wallet,
  CalendarDays,
  Package
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Bar
} from 'recharts';
import api, { messageOf } from '../api';
import {
  PageTitle,
  Loading,
  StatusBadge,
  EmptyState
} from '../components/Shared';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

function StatCard({ title, value, icon: Icon, color = 'blue' }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    orange: 'bg-orange-50 text-orange-600',
    purple: 'bg-purple-50 text-purple-600',
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <h3 className="mt-2 text-2xl font-bold text-gray-900">{value}</h3>
        </div>
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
            colors[color] || colors.blue
          }`}
        >
          {Icon && <Icon size={23} />}
        </div>
      </div>
    </div>
  );
}

const money = (n) =>
  `PKR ${Number(n || 0).toLocaleString('en-PK', {
    maximumFractionDigits: 2,
  })}`;

function PackageIcon() {
  return <MapPin size={21} />;
}

export function BookParcel() {
  const [pricing, setPricing] = useState({
    perKg: 80,
    perKm: 5,
    baseFee: 100,
  });

  const [form, setForm] = useState({
    pickupAddress: '',
    pickupCity: 'Gojra',
    receiverName: '',
    receiverPhone: '',
    destinationAddress: '',
    destinationCity: 'Lahore',
    weightKg: 1,
    distanceKm: 130,
    description: '',
    paymentMethod: 'cash',
  });

  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    api
      .get('/parcels/pricing')
      .then((response) => setPricing(response.data))
      .catch(() => {});
  }, []);

  const charge =
    Math.round(
      (
        Number(pricing.baseFee) +
        Number(form.weightKg || 0) * Number(pricing.perKg) +
        Number(form.distanceKm || 0) * Number(pricing.perKm)
      ) * 100
    ) / 100;

  const set = (key, value) => {
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  async function submit(event) {
    event.preventDefault();
    setBusy(true);

    try {
      const response = await api.post('/parcels', form);
      setResult(response.data);
      toast.success('Parcel booking created');
    } catch (error) {
      toast.error(messageOf(error));
    } finally {
      setBusy(false);
    }
  }

  if (result) {
    return (
      <div className="success-booking">
        <span className="success-mark">
          <CheckCircle2 />
        </span>

        <div className="eyebrow">BOOKING CONFIRMED</div>

        <h1>Your parcel is on its way.</h1>

        <p>{result.message}</p>

        <div className="tracking-ticket">
          <span>YOUR TRACKING ID</span>
          <b>{result.parcel.trackingId}</b>
          <small>Keep this ID to track your parcel anytime.</small>

          <hr />

          <span>DELIVERY VERIFICATION OTP</span>
          <b className="otp-code">{result.deliveryOtp}</b>
          <small>
            Share this OTP with the recipient only at delivery. Save it
            securely.
          </small>

          <hr />

          <span>ESTIMATED CHARGE</span>
          <b>{money(result.parcel.charge)}</b>
        </div>

        <div className="success-actions">
          <Link className="btn btn-primary" to="/app/parcels">
            View my parcels <ArrowRight />
          </Link>

          <button
            type="button"
            className="btn btn-outline"
            onClick={() => {
              setResult(null);
              setForm((previous) => ({
                ...previous,
                pickupAddress: '',
                receiverName: '',
                receiverPhone: '',
                destinationAddress: '',
                description: '',
              }));
            }}
          >
            Book another parcel
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageTitle
        eyebrow="NEW SHIPMENT"
        title="Book a parcel"
        description="Add pickup and recipient details, review the calculated charge, and confirm."
      />

      <form onSubmit={submit} className="booking-layout">
        <div className="booking-form">
          <section className="panel form-panel">
            <div className="form-section-title">
              <span>01</span>
              <div>
                <h2>Pickup details</h2>
                <p>Where should we collect the parcel?</p>
              </div>
            </div>

            <div className="form-grid">
              <label className="full-field">
                Pickup address
                <input
                  value={form.pickupAddress}
                  onChange={(event) =>
                    set('pickupAddress', event.target.value)
                  }
                  placeholder="House, street, area"
                  required
                  maxLength={250}
                />
              </label>

              <label>
                Pickup city
                <input
                  value={form.pickupCity}
                  onChange={(event) => set('pickupCity', event.target.value)}
                  required
                  maxLength={80}
                />
              </label>

              <label>
                Parcel weight (kg)
                <input
                  type="number"
                  min="0.1"
                  max="100"
                  step="0.1"
                  value={form.weightKg}
                  onChange={(event) => set('weightKg', event.target.value)}
                  required
                />
              </label>
            </div>
          </section>

          <section className="panel form-panel">
            <div className="form-section-title">
              <span>02</span>
              <div>
                <h2>Recipient details</h2>
                <p>Who should receive this parcel?</p>
              </div>
            </div>

            <div className="form-grid">
              <label>
                Recipient full name
                <input
                  value={form.receiverName}
                  onChange={(event) => set('receiverName', event.target.value)}
                  required
                  maxLength={80}
                />
              </label>

              <label>
                Recipient phone
                <input
                  type="tel"
                  value={form.receiverPhone}
                  onChange={(event) => set('receiverPhone', event.target.value)}
                  required
                  maxLength={30}
                />
              </label>

              <label className="full-field">
                Destination address
                <input
                  value={form.destinationAddress}
                  onChange={(event) =>
                    set('destinationAddress', event.target.value)
                  }
                  required
                  maxLength={250}
                />
              </label>

              <label>
                Destination city
                <input
                  value={form.destinationCity}
                  onChange={(event) =>
                    set('destinationCity', event.target.value)
                  }
                  required
                  maxLength={80}
                />
              </label>

              <label>
                Distance (km)
                <input
                  type="number"
                  min="1"
                  max="5000"
                  step="1"
                  value={form.distanceKm}
                  onChange={(event) => set('distanceKm', event.target.value)}
                  required
                />
                <small className="field-help">
                  Enter the estimated route distance. City distances are
                  configurable by the administrator.
                </small>
              </label>

              <label className="full-field">
                Parcel description <span className="optional">Optional</span>
                <textarea
                  value={form.description}
                  onChange={(event) => set('description', event.target.value)}
                  placeholder="General description (do not send prohibited items)"
                  maxLength={500}
                />
              </label>
            </div>
          </section>

          <section className="panel form-panel">
            <div className="form-section-title">
              <span>03</span>
              <div>
                <h2>Payment preference</h2>
                <p>Choose how you intend to pay.</p>
              </div>
            </div>

            <div className="payment-options">
              <label
                className={`payment-option ${
                  form.paymentMethod === 'cash' ? 'selected' : ''
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={form.paymentMethod === 'cash'}
                  onChange={() => set('paymentMethod', 'cash')}
                />
                <Wallet />
                <span>
                  <b>Cash payment</b>
                  <small>
                    Pay according to your delivery arrangement.
                  </small>
                </span>
              </label>

              <label
                className={`payment-option ${
                  form.paymentMethod === 'card' ? 'selected' : ''
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={form.paymentMethod === 'card'}
                  onChange={() => set('paymentMethod', 'card')}
                />
                <Calculator />
                <span>
                  <b>Card (demo mode)</b>
                  <small>No real card transaction is processed.</small>
                </span>
              </label>
            </div>
          </section>
        </div>

        <aside className="booking-summary">
          <div className="summary-top">
            <span className="summary-icon">
              <PackageIcon />
            </span>
            <span>BOOKING SUMMARY</span>
          </div>

          <h2>Delivery estimate</h2>
          <p>Calculated from your entered weight and route distance.</p>

          <div className="summary-line">
            <span>Base fee</span>
            <b>{money(pricing.baseFee)}</b>
          </div>

          <div className="summary-line">
            <span>
              Weight · {form.weightKg || 0} kg × {money(pricing.perKg)}/kg
            </span>
            <b>{money(Number(form.weightKg || 0) * pricing.perKg)}</b>
          </div>

          <div className="summary-line">
            <span>
              Distance · {form.distanceKm || 0} km × {money(pricing.perKm)}/km
            </span>
            <b>{money(Number(form.distanceKm || 0) * pricing.perKm)}</b>
          </div>

          <div className="summary-total">
            <span>Estimated total</span>
            <b>{money(charge)}</b>
          </div>

          <div className="summary-note">
            <CheckCircle2 />
            <span>
              Final charge is validated by the server using the latest admin
              pricing.
            </span>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full btn-large"
            disabled={busy}
          >
            {busy ? 'Creating booking…' : 'Confirm booking'} <ArrowRight />
          </button>

          <small className="summary-disclaimer">
            Distance is an estimate entered for this project demo; it is not
            calculated using a live maps service.
          </small>
        </aside>
      </form>
    </>
  );
}

export function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  });
  const [q, setQ] = useState('');

  async function load() {
    try {
      const response = await api.get('/admin/users');
      setUsers(response.data.users);
    } catch (error) {
      toast.error(messageOf(error));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function create(event) {
    event.preventDefault();

    try {
      await api.post('/admin/agents', form);
      toast.success('Delivery agent account created');
      setShow(false);
      setForm({
        name: '',
        email: '',
        phone: '',
        password: '',
      });
      load();
    } catch (error) {
      toast.error(messageOf(error));
    }
  }

  async function toggle(user) {
    try {
      await api.patch(`/admin/users/${user._id}/active`, {
        active: !user.active,
      });

      toast.success(
        `Account ${user.active ? 'deactivated' : 'activated'}`
      );

      load();
    } catch (error) {
      toast.error(messageOf(error));
    }
  }

  const list = users.filter((user) =>
    `${user.name} ${user.email} ${user.role}`
      .toLowerCase()
      .includes(q.toLowerCase())
  );

  return (
    <>
      <PageTitle
        eyebrow="PEOPLE & ACCESS"
        title="Customers & agents"
        description="Review accounts and manage your delivery team."
        action={
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setShow(true)}
          >
            <Plus size={17} /> Add delivery agent
          </button>
        }
      />

      <section className="panel">
        <div className="table-toolbar">
          <div className="table-search">
            <input
              value={q}
              onChange={(event) => setQ(event.target.value)}
              placeholder="Search name, email or role…"
            />
          </div>
          <span>{list.length} users</span>
        </div>

        {loading ? (
          <Loading />
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {list.map((user) => (
                  <tr key={user._id}>
                    <td>
                      <b>{user.name}</b>
                      <small className="table-sub">
                        Joined {new Date(user.createdAt).toLocaleDateString()}
                      </small>
                    </td>
                    <td>{user.email}</td>
                    <td>{user.phone || '—'}</td>
                    <td>
                      <span className="role-pill">{user.role}</span>
                    </td>
                    <td>
                      <span
                        className={`status-badge ${
                          user.active
                            ? 'status-delivered'
                            : 'status-failed-delivery'
                        }`}
                      >
                        {user.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      {user.role === 'admin' ? (
                        <span className="muted">Protected</span>
                      ) : (
                        <button
                          type="button"
                          className="btn btn-small btn-outline"
                          onClick={() => toggle(user)}
                        >
                          {user.active ? 'Deactivate' : 'Activate'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {!list.length && (
              <EmptyState
                title="No users found"
                text="Try another search or create a delivery agent account."
              />
            )}
          </div>
        )}
      </section>

      {show && (
        <div className="modal-backdrop">
          <div className="modal">
            <div className="modal-head">
              <h2>Create delivery agent</h2>
              <button type="button" onClick={() => setShow(false)}>
                ×
              </button>
            </div>

            <p>
              The agent can sign in using these credentials and view assigned
              deliveries only.
            </p>

            <form onSubmit={create} className="form-stack">
              <label>
                Full name
                <input
                  value={form.name}
                  onChange={(event) =>
                    setForm({ ...form, name: event.target.value })
                  }
                  required
                />
              </label>

              <label>
                Email
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) =>
                    setForm({ ...form, email: event.target.value })
                  }
                  required
                />
              </label>

              <label>
                Phone
                <input
                  value={form.phone}
                  onChange={(event) =>
                    setForm({ ...form, phone: event.target.value })
                  }
                />
              </label>

              <label>
                Temporary password
                <input
                  type="password"
                  minLength={8}
                  value={form.password}
                  onChange={(event) =>
                    setForm({ ...form, password: event.target.value })
                  }
                  required
                />
                <small className="field-help">
                  Use at least 8 characters. Share credentials securely.
                </small>
              </label>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setShow(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export function PricingPage() {
  const [form, setForm] = useState({
    perKg: 80,
    perKm: 5,
    baseFee: 100,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/admin/pricing')
      .then((response) =>
        setForm({
          perKg: response.data.pricing.perKg,
          perKm: response.data.pricing.perKm,
          baseFee: response.data.pricing.baseFee,
        })
      )
      .catch((error) => toast.error(messageOf(error)))
      .finally(() => setLoading(false));
  }, []);

  async function save(event) {
    event.preventDefault();

    try {
      await api.put('/admin/pricing', form);
      toast.success('Pricing updated successfully');
    } catch (error) {
      toast.error(messageOf(error));
    }
  }

  return (
    <>
      <PageTitle
        eyebrow="RATE CONFIGURATION"
        title="Delivery pricing"
        description="Set the rates used by the server for new bookings."
      />

      {loading ? (
        <Loading />
      ) : (
        <div className="settings-grid">
          <section className="panel settings-panel">
            <div className="panel-head">
              <div>
                <h2>Base delivery rates</h2>
                <p>These rates apply to new bookings only.</p>
              </div>
              <span className="panel-badge">PKR</span>
            </div>

            <form onSubmit={save} className="form-stack">
              <label>
                Base fee (PKR)
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={form.baseFee}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      baseFee: Number(event.target.value),
                    })
                  }
                  required
                />
                <small className="field-help">
                  Fixed amount added to each parcel.
                </small>
              </label>

              <label>
                Rate per kilogram (PKR/kg)
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={form.perKg}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      perKg: Number(event.target.value),
                    })
                  }
                  required
                />
                <small className="field-help">
                  Multiplied by the parcel weight.
                </small>
              </label>

              <label>
                Rate per kilometre (PKR/km)
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={form.perKm}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      perKm: Number(event.target.value),
                    })
                  }
                  required
                />
                <small className="field-help">
                  Multiplied by the distance entered at booking.
                </small>
              </label>

              <button type="submit" className="btn btn-primary btn-large">
                <Save size={17} /> Save pricing changes
              </button>
            </form>
          </section>

          <section className="panel pricing-preview">
            <span className="quick-action-icon">
              <Calculator />
            </span>

            <div className="eyebrow">EXAMPLE CALCULATION</div>
            <h2>Estimate at a glance</h2>
            <p>
              For a 2 kg parcel travelling 100 km, using the rates you
              configure.
            </p>

            <div className="summary-line">
              <span>Base fee</span>
              <b>{money(form.baseFee)}</b>
            </div>

            <div className="summary-line">
              <span>2 kg × rate</span>
              <b>{money(form.perKg * 2)}</b>
            </div>

            <div className="summary-line">
              <span>100 km × rate</span>
              <b>{money(form.perKm * 100)}</b>
            </div>

            <div className="summary-total">
              <span>Example total</span>
              <b>{money(form.baseFee + form.perKg * 2 + form.perKm * 100)}</b>
            </div>

            <div className="summary-note">
              <CheckCircle2 />
              <span>Existing bookings keep their original saved charge.</span>
            </div>
          </section>
        </div>
      )}
    </>
  );
}

export function PaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/admin/payments')
      .then((response) => setPayments(response.data.payments))
      .catch((error) => toast.error(messageOf(error)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <PageTitle
        eyebrow="PAYMENT RECORDS"
        title="Payments"
        description="Review payment method and status for recent bookings."
      />

      <section className="panel">
        {loading ? (
          <Loading />
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Reference / Parcel</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Method</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {payments.map((payment) => (
                  <tr key={payment._id}>
                    <td>
                      <b>{payment.parcel?.trackingId || 'Parcel removed'}</b>
                      <small className="table-sub">
                        {payment.reference ||
                          payment._id.slice(-8).toUpperCase()}
                      </small>
                    </td>
                    <td>{payment.customer?.name || '—'}</td>
                    <td>
                      {new Date(payment.createdAt).toLocaleDateString()}
                    </td>
                    <td className="capitalize">{payment.method}</td>
                    <td>{money(payment.amount)}</td>
                    <td>
                      <StatusBadge
                        status={
                          payment.status === 'demo'
                            ? 'Demo payment'
                            : payment.status
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {!payments.length && (
              <EmptyState
                title="No payments yet"
                text="Payment records are created when customers book parcels."
              />
            )}
          </div>
        )}
      </section>

      <div className="alert alert-info payment-warning">
        Card payments are explicitly marked demo until a real payment gateway
        is configured. No real card details are collected or charged.
      </div>
    </>
  );
}

export function ReportsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    api
      .get('/admin/reports')
      .then((response) => {
        if (active) {
          setData(response.data);
        }
      })
      .catch((error) => {
        if (active) {
          toast.error(messageOf(error));
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const months = (data?.monthly || []).map((item) => ({
    month: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
    bookings: Number(item.bookings || 0),
    charges: Number(item.charges || 0),
  }));

  const totalBookings = months.reduce(
    (total, item) => total + item.bookings,
    0
  );

  const totalCharges = months.reduce(
    (total, item) => total + item.charges,
    0
  );

  return (
    <>
      <PageTitle
        eyebrow="BUSINESS INSIGHTS"
        title="Reports & analytics"
        description="A monthly view of booking volume and parcel charges."
      />

      {loading ? (
        <Loading />
      ) : (
        <>
          <div className="stats-grid">
            <StatCard
              title="Months with activity"
              value={months.length}
              icon={CalendarDays}
              color="purple"
            />

            <StatCard
              title="Bookings in report"
              value={totalBookings}
              icon={Package}
              color="blue"
            />

            <StatCard
              title="Total parcel charges"
              value={money(totalCharges)}
              icon={Wallet}
              color="green"
            />
          </div>

          <section className="panel">
            <div className="panel-head">
              <div>
                <h2>Monthly bookings</h2>
                <p>Grouped by the parcel booking date.</p>
              </div>
            </div>

            {months.length > 0 ? (
              <div className="chart-wrap">
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart
                    data={months}
                    margin={{
                      top: 10,
                      right: 15,
                      left: 0,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#edf0f4"
                    />

                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />

                    <YAxis
                      allowDecimals={false}
                      tick={{ fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />

                    <Tooltip />

                    <Bar
                      dataKey="bookings"
                      name="Bookings"
                      fill="#f47732"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyState
                title="Reports will appear here"
                text="Create parcel bookings to start building your monthly report."
              />
            )}
          </section>

          <section className="panel recent-panel">
            <div className="panel-head">
              <div>
                <h2>Monthly detail</h2>
                <p>Summary of the most recent reporting months.</p>
              </div>
            </div>

            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Month</th>
                    <th>Bookings</th>
                    <th>Sum of parcel charges</th>
                  </tr>
                </thead>

                <tbody>
                  {months.map((item) => (
                    <tr key={item.month}>
                      <td>{item.month}</td>
                      <td>{item.bookings}</td>
                      <td>{money(item.charges)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {!months.length && (
                <EmptyState
                  title="No monthly data"
                  text="Monthly details will appear after parcel bookings are recorded."
                />
              )}
            </div>
          </section>
        </>
      )}
    </>
  );
}

export function AddressesPage() {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    label: 'Home',
    address: '',
    city: '',
  });

  useEffect(() => {
    api
      .get('/auth/me')
      .then((response) =>
        setAddresses(response.data.user.savedAddresses || [])
      )
      .catch((error) => toast.error(messageOf(error)))
      .finally(() => setLoading(false));
  }, []);

  async function save(next) {
    try {
      const response = await api.put('/auth/addresses', {
        addresses: next,
      });

      setAddresses(response.data.addresses);
      toast.success('Saved addresses updated');
    } catch (error) {
      toast.error(messageOf(error));
    }
  }

  return (
    <>
      <PageTitle
        eyebrow="PERSONAL DETAILS"
        title="Saved addresses"
        description="Keep commonly used pickup addresses ready for future bookings."
      />

      <div className="settings-grid">
        <section className="panel settings-panel">
          <div className="panel-head">
            <div>
              <h2>Add an address</h2>
              <p>Store a label, street address and city.</p>
            </div>
          </div>

          <form
            className="form-stack"
            onSubmit={(event) => {
              event.preventDefault();
              save([...addresses, form]);
              setForm({
                label: 'Home',
                address: '',
                city: '',
              });
            }}
          >
            <label>
              Label
              <input
                value={form.label}
                onChange={(event) =>
                  setForm({ ...form, label: event.target.value })
                }
                required
              />
            </label>

            <label>
              Street address
              <input
                value={form.address}
                onChange={(event) =>
                  setForm({ ...form, address: event.target.value })
                }
                required
              />
            </label>

            <label>
              City
              <input
                value={form.city}
                onChange={(event) =>
                  setForm({ ...form, city: event.target.value })
                }
                required
              />
            </label>

            <button type="submit" className="btn btn-primary">
              <Plus size={16} /> Save address
            </button>
          </form>
        </section>

        <section className="panel settings-panel">
          <div className="panel-head">
            <div>
              <h2>Your saved addresses</h2>
              <p>{addresses.length} saved</p>
            </div>
          </div>

          {loading ? (
            <Loading />
          ) : addresses.length ? (
            addresses.map((address, index) => (
              <div
                className="saved-address"
                key={`${address.label}-${index}`}
              >
                <span>
                  <MapPin />
                </span>

                <div>
                  <b>{address.label}</b>
                  <p>{address.address}</p>
                  <small>{address.city}</small>
                </div>

                <button
                  type="button"
                  className="icon-button"
                  onClick={() =>
                    save(addresses.filter((_, itemIndex) => itemIndex !== index))
                  }
                  aria-label="Delete address"
                >
                  <Trash2 />
                </button>
              </div>
            ))
          ) : (
            <EmptyState
              title="No saved addresses"
              text="Add an address to make future bookings easier."
            />
          )}
        </section>
      </div>
    </>
  );
}

export function SettingsPage() {
  const { user, updateUser, logout } = useAuth();

  const [profile, setProfile] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
  });

  const [password, setPassword] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [busy, setBusy] = useState(false);

  async function saveProfile(event) {
    event.preventDefault();

    try {
      const response = await api.put('/auth/profile', profile);
      updateUser(response.data.user);
      toast.success('Profile updated');
    } catch (error) {
      toast.error(messageOf(error));
    }
  }

  async function savePassword(event) {
    event.preventDefault();

    if (password.newPassword !== password.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    setBusy(true);

    try {
      await api.put('/auth/change-password', password);
      toast.success('Password changed. Please sign in again.');
      logout();
    } catch (error) {
      toast.error(messageOf(error));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageTitle
        eyebrow="ACCOUNT SETTINGS"
        title="Your profile"
        description="Keep your account information current and secure."
      />

      <div className="settings-grid">
        <section className="panel settings-panel">
          <div className="panel-head">
            <div>
              <h2>Personal information</h2>
              <p>Update the details associated with your account.</p>
            </div>
          </div>

          <form onSubmit={saveProfile} className="form-stack">
            <label>
              Full name
              <input
                value={profile.name}
                onChange={(event) =>
                  setProfile({ ...profile, name: event.target.value })
                }
                required
              />
            </label>

            <label>
              Email address
              <input value={user?.email || ''} disabled />
              <small className="field-help">
                Email changes are not available in this project demo.
              </small>
            </label>

            <label>
              Phone number
              <input
                value={profile.phone}
                onChange={(event) =>
                  setProfile({ ...profile, phone: event.target.value })
                }
              />
            </label>

            <button type="submit" className="btn btn-primary">
              <Save size={16} /> Save profile
            </button>
          </form>
        </section>

        <section className="panel settings-panel">
          <div className="panel-head">
            <div>
              <h2>Change password</h2>
              <p>Use a strong password you do not reuse elsewhere.</p>
            </div>
          </div>

          <form onSubmit={savePassword} className="form-stack">
            <label>
              Current password
              <input
                type="password"
                autoComplete="current-password"
                value={password.currentPassword}
                onChange={(event) =>
                  setPassword({
                    ...password,
                    currentPassword: event.target.value,
                  })
                }
                required
              />
            </label>

            <label>
              New password
              <input
                type="password"
                minLength={8}
                autoComplete="new-password"
                value={password.newPassword}
                onChange={(event) =>
                  setPassword({
                    ...password,
                    newPassword: event.target.value,
                  })
                }
                required
              />
            </label>

            <label>
              Confirm new password
              <input
                type="password"
                minLength={8}
                autoComplete="new-password"
                value={password.confirmPassword}
                onChange={(event) =>
                  setPassword({
                    ...password,
                    confirmPassword: event.target.value,
                  })
                }
                required
              />
            </label>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={busy}
            >
              <Save size={16} />
              {busy ? 'Saving…' : 'Change password'}
            </button>
          </form>
        </section>
      </div>
    </>
  );
}