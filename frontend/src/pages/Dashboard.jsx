import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Package,
  Clock3,
  Truck,
  CheckCircle2,
  Plus,
  Search,
  MapPin,
  Users,
  Wallet,
  BarChart3,
  UserRound,
  ShieldCheck,
  Eye,
  X,
  Phone,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';
import api, { messageOf } from '../api';
import { useAuth } from '../context/AuthContext';
import { PageTitle, StatCard, StatusBadge, Loading, EmptyState } from '../components/Shared';
import toast from 'react-hot-toast';

const money = n => `PKR ${Number(n || 0).toLocaleString('en-PK', { maximumFractionDigits: 0 })}`;

export function Dashboard() {
  const { user } = useAuth();
  if (user?.role === 'admin') return <AdminDashboard />;
  if (user?.role === 'agent') return <AgentDashboard />;
  return <CustomerDashboard />;
}

// -------------------------------------------------------------
// CUSTOMER DASHBOARD
// -------------------------------------------------------------
function CustomerDashboard() {
  const { user } = useAuth();
  const [parcels, setParcels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedParcel, setSelectedParcel] = useState(null);

  const fetchParcels = () => {
    setLoading(true);
    api
      .get('/parcels/mine')
      .then(r => setParcels(r.data.parcels || []))
      .catch(e => toast.error(messageOf(e)))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchParcels();
  }, []);

  const count = s => parcels.filter(p => p.status === s).length;
  const transitCount = parcels.filter(p =>
    ['Assigned', 'Picked Up', 'In Transit', 'Out for Delivery'].includes(p.status)
  ).length;

  return (
    <>
      <PageTitle
        eyebrow="CUSTOMER PORTAL"
        title={`Welcome back, ${user?.name?.split(' ')[0] || 'Customer'}!`}
        description="Monitor your parcel bookings, view tracking updates, and access your delivery OTPs."
        action={
          <Link className="btn btn-primary" to="/app/book">
            <Plus size={17} /> Book a Parcel
          </Link>
        }
      />

      <div className="stats-grid">
        <StatCard label="Total Bookings" value={parcels.length} icon={Package} />
        <StatCard label="Pending Dispatch" value={count('Pending')} icon={Clock3} tone="yellow" />
        <StatCard label="In Transit" value={transitCount} icon={Truck} tone="blue" />
        <StatCard label="Delivered" value={count('Delivered')} icon={CheckCircle2} tone="green" />
      </div>

      <div className="content-grid customer-grid">
        <section className="panel">
          <div className="panel-head">
            <div>
              <h2>Recent Shipments</h2>
              <p>Click on any tracking ID or parcel to view its journey details & OTP.</p>
            </div>
            <Link to="/app/parcels" className="text-link">
              View all <ArrowRight size={15} />
            </Link>
          </div>

          {loading ? (
            <Loading message="Fetching recent parcel records…" />
          ) : parcels.length ? (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Tracking ID</th>
                    <th>Destination</th>
                    <th>Booked On</th>
                    <th>Charge</th>
                    <th>Delivery OTP</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {parcels.slice(0, 6).map(p => (
                    <tr key={p._id}>
                      <td>
                        <button
                          type="button"
                          className="table-id-btn"
                          onClick={() => setSelectedParcel(p)}
                        >
                          {p.trackingId}
                        </button>
                      </td>
                      <td>
                        <b>{p.destinationCity}</b>
                        <small className="table-sub">{p.destinationAddress}</small>
                      </td>
                      <td>{new Date(p.createdAt).toLocaleDateString()}</td>
                      <td>{money(p.charge)}</td>
                      <td>
                        {p.deliveryOtp ? (
                          <span className="otp-pill">{p.deliveryOtp}</span>
                        ) : (
                          <span className="muted">—</span>
                        )}
                      </td>
                      <td>
                        <StatusBadge status={p.status} />
                      </td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-small btn-outline"
                          onClick={() => setSelectedParcel(p)}
                        >
                          <Eye size={13} /> View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              title="No parcel bookings yet"
              text="Book your first parcel to receive a tracking ID and follow its journey."
              action={
                <Link className="btn btn-primary" to="/app/book">
                  Book a parcel <ArrowRight size={16} />
                </Link>
              }
            />
          )}
        </section>

        <section className="panel quick-panel">
          <div className="panel-head">
            <div>
              <h2>Quick Actions</h2>
              <p>Common courier workflows.</p>
            </div>
          </div>

          <Link className="quick-action" to="/app/book">
            <span className="quick-action-icon">
              <Plus />
            </span>
            <span>
              <b>Book a New Parcel</b>
              <small>Calculate charges & arrange collection</small>
            </span>
            <ArrowRight size={16} />
          </Link>

          <Link className="quick-action" to="/app/parcels">
            <span className="quick-action-icon green">
              <Search />
            </span>
            <span>
              <b>Track & History</b>
              <small>Search previous shipments and check OTPs</small>
            </span>
            <ArrowRight size={16} />
          </Link>

          <Link className="quick-action" to="/app/addresses">
            <span className="quick-action-icon blue">
              <MapPin />
            </span>
            <span>
              <b>Saved Pickup Addresses</b>
              <small>Manage stored addresses for faster booking</small>
            </span>
            <ArrowRight size={16} />
          </Link>

          <div className="support-note">
            <ShieldCheck size={20} />
            <span>
              <b>Secure Delivery OTP</b>
              <small>Only give your 6-digit OTP to the courier when your package arrives.</small>
            </span>
          </div>
        </section>
      </div>

      {selectedParcel && (
        <ParcelDetailModal
          parcel={selectedParcel}
          onClose={() => setSelectedParcel(null)}
          isCustomer
        />
      )}
    </>
  );
}

// -------------------------------------------------------------
// ADMIN DASHBOARD
// -------------------------------------------------------------
function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedParcel, setSelectedParcel] = useState(null);

  const fetchOverview = () => {
    setLoading(true);
    api
      .get('/admin/overview')
      .then(r => setData(r.data))
      .catch(e => toast.error(messageOf(e)))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  if (loading) return <Loading message="Loading operational dashboard…" />;

  const s = data?.stats || {};
  const chart = (data?.statusCounts || []).map(x => ({
    name: x._id,
    count: x.count
  }));

  return (
    <>
      <PageTitle
        eyebrow="OPERATIONS COMMAND CENTER"
        title="Courier Fleet Overview"
        description="Real-time operational statistics and system dispatch control."
        action={
          <Link className="btn btn-primary" to="/app/parcels">
            <Package size={17} /> Manage All Parcels
          </Link>
        }
      />

      <div className="stats-grid stats-grid-6">
        <StatCard label="Total Parcels" value={s.totalParcels} icon={Package} />
        <StatCard label="Unassigned" value={s.unassigned} icon={AlertTriangle} tone="yellow" />
        <StatCard label="Pending" value={s.pending} icon={Clock3} tone="yellow" />
        <StatCard label="In Transit" value={s.transit} icon={Truck} tone="blue" />
        <StatCard label="Delivered" value={s.delivered} icon={CheckCircle2} tone="green" />
        <StatCard label="Active Couriers" value={s.activeAgents} icon={UserRound} tone="green" />
      </div>

      <div className="content-grid admin-charts">
        <section className="panel">
          <div className="panel-head">
            <div>
              <h2>Parcel Distribution by Status</h2>
              <p>Breakdown across the active shipment lifecycle.</p>
            </div>
            <span className="panel-badge">LIVE DATABASE METRICS</span>
          </div>

          {chart.length ? (
            <div className="chart-wrap">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={chart} margin={{ top: 10, right: 10, left: -18, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#edf0f4" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#f47732" radius={[6, 6, 0, 0]} maxBarSize={48} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState
              title="No parcel records yet"
              text="Parcels will appear here once bookings are submitted."
            />
          )}
        </section>

        <section className="panel admin-shortcuts">
          <div className="panel-head">
            <div>
              <h2>Operations Controls</h2>
              <p>Direct access to administrative workflows.</p>
            </div>
          </div>

          <Link className="quick-action" to="/app/parcels">
            <span className="quick-action-icon">
              <Package size={18} />
            </span>
            <span>
              <b>Parcel Dispatch & Assignment</b>
              <small>Assign couriers to unassigned shipments</small>
            </span>
            <ArrowRight size={16} />
          </Link>

          <Link className="quick-action" to="/app/users">
            <span className="quick-action-icon blue">
              <Users size={18} />
            </span>
            <span>
              <b>Customers & Delivery Agents</b>
              <small>Add couriers and manage user accounts</small>
            </span>
            <ArrowRight size={16} />
          </Link>

          <Link className="quick-action" to="/app/pricing">
            <span className="quick-action-icon green">
              <Wallet size={18} />
            </span>
            <span>
              <b>Tariff & Pricing Rates</b>
              <small>Configure base fee, weight and distance rates</small>
            </span>
            <ArrowRight size={16} />
          </Link>

          <Link className="quick-action" to="/app/reports">
            <span className="quick-action-icon yellow">
              <BarChart3 size={18} />
            </span>
            <span>
              <b>Reports & Revenue Analytics</b>
              <small>Monthly booking trends and revenue sums</small>
            </span>
            <ArrowRight size={16} />
          </Link>
        </section>
      </div>

      <section className="panel recent-panel">
        <div className="panel-head">
          <div>
            <h2>Recent Shipments & Dispatches</h2>
            <p>Latest parcels created across the courier network.</p>
          </div>
          <Link className="text-link" to="/app/parcels">
            All parcels <ArrowRight size={15} />
          </Link>
        </div>

        <ParcelTable
          parcels={data?.recent || []}
          admin
          onChanged={fetchOverview}
          onSelectParcel={setSelectedParcel}
        />
      </section>

      {selectedParcel && (
        <ParcelDetailModal
          parcel={selectedParcel}
          onClose={() => setSelectedParcel(null)}
          isAdmin
        />
      )}
    </>
  );
}

// -------------------------------------------------------------
// DELIVERY AGENT DASHBOARD
// -------------------------------------------------------------
function AgentDashboard() {
  const [parcels, setParcels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedParcel, setSelectedParcel] = useState(null);

  const fetchAssigned = () => {
    setLoading(true);
    api
      .get('/parcels/assigned')
      .then(r => setParcels(r.data.parcels || []))
      .catch(e => toast.error(messageOf(e)))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAssigned();
  }, []);

  const active = parcels.filter(p => !['Delivered', 'Failed Delivery'].includes(p.status));
  const completed = parcels.filter(p => p.status === 'Delivered').length;
  const inTransit = parcels.filter(p =>
    ['Picked Up', 'In Transit', 'Out for Delivery'].includes(p.status)
  ).length;

  return (
    <>
      <PageTitle
        eyebrow="DELIVERY AGENT WORKSPACE"
        title="My Assigned Route"
        description="Shipments assigned to you for collection, transit, and OTP-verified doorstep delivery."
      />

      <div className="stats-grid">
        <StatCard label="Total Assigned" value={parcels.length} icon={Package} />
        <StatCard label="Active to Deliver" value={active.length} icon={Clock3} tone="yellow" />
        <StatCard label="In Transit" value={inTransit} icon={Truck} tone="blue" />
        <StatCard label="Completed Deliveries" value={completed} icon={CheckCircle2} tone="green" />
      </div>

      <section className="panel">
        <div className="panel-head">
          <div>
            <h2>Assigned Shipments</h2>
            <p>View recipient contact information, pickup addresses, and update delivery progress.</p>
          </div>
          <span className="panel-badge">{active.length} ACTIVE DELIVERIES</span>
        </div>

        {loading ? (
          <Loading message="Fetching your assigned delivery route…" />
        ) : parcels.length ? (
          <ParcelTable
            parcels={parcels}
            agent
            onChanged={fetchAssigned}
            onSelectParcel={setSelectedParcel}
          />
        ) : (
          <EmptyState
            title="No deliveries assigned yet"
            text="When an administrator assigns parcels to your route, they will appear here."
          />
        )}
      </section>

      {selectedParcel && (
        <ParcelDetailModal
          parcel={selectedParcel}
          onClose={() => setSelectedParcel(null)}
          isAgent
        />
      )}
    </>
  );
}

// -------------------------------------------------------------
// REUSABLE PARCEL TABLE COMPONENT
// -------------------------------------------------------------
export function ParcelTable({
  parcels = [],
  admin = false,
  agent = false,
  onChanged,
  onSelectParcel
}) {
  const [q, setQ] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [assignModal, setAssignModal] = useState(null);
  const [agents, setAgents] = useState([]);
  const [selectedAgentId, setSelectedAgentId] = useState('');
  const [statusModal, setStatusModal] = useState(null);
  const [statusForm, setStatusForm] = useState({
    status: 'Picked Up',
    location: '',
    note: '',
    otp: '',
    failedReason: ''
  });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (assignModal) {
      api
        .get('/admin/users?role=agent')
        .then(r => setAgents((r.data.users || []).filter(u => u.active)))
        .catch(e => toast.error(messageOf(e)));
    }
  }, [assignModal]);

  // Filtering
  const filtered = parcels.filter(p => {
    const matchesSearch = [
      p.trackingId,
      p.receiverName,
      p.receiverPhone,
      p.destinationCity,
      p.destinationAddress,
      p.pickupCity,
      p.customer?.name,
      p.agent?.name
    ].some(v => String(v || '').toLowerCase().includes(q.toLowerCase()));

    if (!matchesSearch) return false;

    if (statusFilter === 'All') return true;
    if (statusFilter === 'Unassigned') return !p.agent;
    return p.status === statusFilter;
  });

  async function handleSaveAssign(p) {
    setBusy(true);
    try {
      const res = await api.patch(`/admin/parcels/${p._id}/assign`, {
        agentId: selectedAgentId || null
      });
      toast.success(res.data.message || 'Delivery agent assignment updated');
      setAssignModal(null);
      onChanged?.();
    } catch (e) {
      toast.error(messageOf(e));
    } finally {
      setBusy(false);
    }
  }

  async function handleSaveStatus() {
    setBusy(true);
    try {
      const res = await api.patch(`/parcels/${statusModal._id}/status`, statusForm);
      toast.success(res.data.message || 'Delivery status updated');
      setStatusModal(null);
      onChanged?.();
    } catch (e) {
      toast.error(messageOf(e));
    } finally {
      setBusy(false);
    }
  }

  function openStatusModal(p) {
    setStatusModal(p);
    let nextStatus = 'Picked Up';
    if (p.status === 'Assigned') nextStatus = 'Picked Up';
    else if (p.status === 'Picked Up') nextStatus = 'In Transit';
    else if (p.status === 'In Transit') nextStatus = 'Out for Delivery';
    else if (p.status === 'Out for Delivery') nextStatus = 'Delivered';

    setStatusForm({
      status: nextStatus,
      location: p.currentLocation || p.destinationCity,
      note: '',
      otp: '',
      failedReason: ''
    });
  }

  const statusTabs = admin
    ? ['All', 'Unassigned', 'Pending', 'Assigned', 'In Transit', 'Delivered']
    : ['All', 'Assigned', 'In Transit', 'Delivered'];

  return (
    <>
      <div className="table-toolbar">
        <div className="status-tab-group">
          {statusTabs.map(tab => (
            <button
              type="button"
              key={tab}
              className={`status-tab ${statusFilter === tab ? 'active' : ''}`}
              onClick={() => setStatusFilter(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="table-search">
          <Search size={16} />
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Search tracking ID, recipient, courier, or city…"
          />
        </div>

        <span className="table-count-label">{filtered.length} records</span>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Tracking ID</th>
              <th>Customer / Receiver</th>
              <th>Pickup Address</th>
              <th>Destination</th>
              <th>Charge</th>
              <th>Status</th>
              {admin && <th>Assigned Courier</th>}
              {(admin || agent) && <th>Action</th>}
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p._id}>
                <td>
                  <button
                    type="button"
                    className="table-id-btn"
                    onClick={() => onSelectParcel?.(p)}
                  >
                    {p.trackingId}
                  </button>
                  <small className="table-sub">{new Date(p.createdAt).toLocaleDateString()}</small>
                </td>

                <td>
                  <b>{p.receiverName}</b>
                  <small className="table-sub">
                    Sender: {p.customer?.name || 'Customer'}
                    {p.receiverPhone && ` · Tel: ${p.receiverPhone}`}
                  </small>
                </td>

                <td>
                  <span>{p.pickupCity}</span>
                  <small className="table-sub">{p.pickupAddress}</small>
                </td>

                <td>
                  <span>{p.destinationCity}</span>
                  <small className="table-sub">{p.destinationAddress}</small>
                </td>

                <td>{money(p.charge)}</td>

                <td>
                  <StatusBadge status={p.status} />
                </td>

                {admin && (
                  <td>
                    {p.agent ? (
                      <span className="courier-badge">
                        <Truck size={12} /> {p.agent.name}
                      </span>
                    ) : (
                      <span className="unassigned-pill">Unassigned</span>
                    )}
                  </td>
                )}

                {(admin || agent) && (
                  <td>
                    <div className="table-action-btns">
                      {admin && (
                        <button
                          type="button"
                          className="btn btn-small btn-outline"
                          onClick={() => {
                            setAssignModal(p);
                            setSelectedAgentId(p.agent?._id || '');
                          }}
                        >
                          {p.agent ? 'Reassign' : 'Assign Courier'}
                        </button>
                      )}

                      {agent &&
                        (!['Delivered', 'Failed Delivery'].includes(p.status) ? (
                          <button
                            type="button"
                            className="btn btn-small btn-primary"
                            onClick={() => openStatusModal(p)}
                          >
                            Update Status
                          </button>
                        ) : (
                          <span className="muted">Complete</span>
                        ))}

                      <button
                        type="button"
                        className="btn btn-small btn-ghost"
                        onClick={() => onSelectParcel?.(p)}
                        title="View details"
                      >
                        <Eye size={15} />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {!filtered.length && (
          <EmptyState
            title="No matching parcels found"
            text="Try adjusting your filter status or search term."
          />
        )}
      </div>

      {/* ADMIN ASSIGN MODAL */}
      {assignModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <div className="modal-head">
              <h2>Assign Delivery Courier</h2>
              <button
                type="button"
                className="modal-close"
                onClick={() => setAssignModal(null)}
              >
                <X size={20} />
              </button>
            </div>
            <p>
              Parcel <b>{assignModal.trackingId}</b> · Destination: {assignModal.destinationCity}
            </p>

            <label>
              Select Active Delivery Agent
              <select
                value={selectedAgentId}
                onChange={e => setSelectedAgentId(e.target.value)}
              >
                <option value="">— Unassigned (No Courier) —</option>
                {agents.map(a => (
                  <option key={a._id} value={a._id}>
                    {a.name} ({a.email}) {a.phone ? `· ${a.phone}` : ''}
                  </option>
                ))}
              </select>
            </label>

            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setAssignModal(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                disabled={busy}
                onClick={() => handleSaveAssign(assignModal)}
              >
                {busy ? 'Saving Assignment…' : 'Confirm Assignment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AGENT STATUS UPDATE MODAL */}
      {statusModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <div className="modal-head">
              <h2>Update Delivery Milestone</h2>
              <button
                type="button"
                className="modal-close"
                onClick={() => setStatusModal(null)}
              >
                <X size={20} />
              </button>
            </div>
            <p>
              Parcel <b>{statusModal.trackingId}</b> · Recipient: {statusModal.receiverName}
            </p>

            <form
              onSubmit={e => {
                e.preventDefault();
                handleSaveStatus();
              }}
              className="form-stack"
            >
              <label>
                New Status
                <select
                  value={statusForm.status}
                  onChange={e => setStatusForm({ ...statusForm, status: e.target.value })}
                >
                  {['Picked Up', 'In Transit', 'Out for Delivery', 'Delivered', 'Failed Delivery'].map(
                    s => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    )
                  )}
                </select>
              </label>

              <label>
                Current Location
                <input
                  value={statusForm.location}
                  onChange={e => setStatusForm({ ...statusForm, location: e.target.value })}
                  placeholder="e.g. Lahore Transit Hub"
                  required
                />
              </label>

              {statusForm.status === 'Delivered' && (
                <div className="otp-verification-field">
                  <label>
                    Recipient 6-Digit Delivery OTP <span>Required to Complete</span>
                    <input
                      value={statusForm.otp}
                      onChange={e => setStatusForm({ ...statusForm, otp: e.target.value })}
                      placeholder="e.g. 123456"
                      maxLength={6}
                      required
                    />
                  </label>
                  <small className="field-help text-orange">
                    Ask the customer/recipient for their unique 6-digit delivery OTP before handing over the parcel.
                  </small>
                </div>
              )}

              {statusForm.status === 'Failed Delivery' && (
                <label>
                  Reason for Delivery Failure
                  <textarea
                    value={statusForm.failedReason}
                    onChange={e => setStatusForm({ ...statusForm, failedReason: e.target.value })}
                    placeholder="e.g. Recipient unavailable, incorrect address"
                    required
                  />
                </label>
              )}

              <label>
                Milestone Note <span className="optional">Optional</span>
                <textarea
                  value={statusForm.note}
                  onChange={e => setStatusForm({ ...statusForm, note: e.target.value })}
                  placeholder="Any notable route details for the customer"
                />
              </label>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setStatusModal(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={busy}>
                  {busy ? 'Saving Status…' : 'Save Status Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

// -------------------------------------------------------------
// PARCEL DETAILS MODAL (TIMELINE & OTP DISPLAY)
// -------------------------------------------------------------
function ParcelDetailModal({ parcel, onClose, isCustomer, isAdmin, isAgent }) {
  if (!parcel) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal modal-large">
        <div className="modal-head">
          <div>
            <span className="eyebrow">PARCEL DOSSIER</span>
            <h2>Tracking ID: {parcel.trackingId}</h2>
          </div>
          <button type="button" className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="parcel-dossier-grid">
          {/* Customer OTP Box */}
          {isCustomer && parcel.deliveryOtp && (
            <div className="dossier-otp-box">
              <ShieldCheck size={26} />
              <div>
                <span>YOUR DELIVERY VERIFICATION OTP</span>
                <strong className="dossier-otp-code">{parcel.deliveryOtp}</strong>
                <small>Provide this 6-digit code to the delivery courier when they arrive.</small>
              </div>
            </div>
          )}

          <div className="dossier-meta">
            <div>
              <span className="meta-label">Status</span>
              <StatusBadge status={parcel.status} />
            </div>
            <div>
              <span className="meta-label">Booking Date</span>
              <b>{new Date(parcel.createdAt).toLocaleString()}</b>
            </div>
            <div>
              <span className="meta-label">Total Charge</span>
              <b>{money(parcel.charge)}</b>
            </div>
            <div>
              <span className="meta-label">Payment</span>
              <b className="capitalize">{parcel.paymentMethod} ({parcel.paymentStatus})</b>
            </div>
          </div>

          <div className="dossier-route-box">
            <div className="route-point">
              <span className="route-dot pickup" />
              <div>
                <small>PICKUP ADDRESS</small>
                <b>{parcel.pickupCity}</b>
                <p>{parcel.pickupAddress}</p>
                {parcel.customer?.phone && (
                  <span className="contact-tel">
                    <Phone size={13} /> {parcel.customer.phone}
                  </span>
                )}
              </div>
            </div>

            <div className="route-divider" />

            <div className="route-point">
              <span className="route-dot destination" />
              <div>
                <small>DESTINATION ADDRESS</small>
                <b>{parcel.destinationCity}</b>
                <p>{parcel.destinationAddress}</p>
                <p>Recipient: <b>{parcel.receiverName}</b></p>
                {parcel.receiverPhone && (
                  <span className="contact-tel">
                    <Phone size={13} /> {parcel.receiverPhone}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="dossier-specs">
            <span>Weight: <b>{parcel.weightKg} kg</b></span>
            <span>Distance: <b>{parcel.distanceKm} km</b></span>
            {parcel.agent && <span>Courier: <b>{parcel.agent.name}</b></span>}
          </div>

          <div className="timeline dossier-timeline">
            <h3>Milestone Event History</h3>
            {[...(parcel.events || [])].reverse().map((ev, i) => (
              <div className="timeline-item" key={`${ev.status}-${i}`}>
                <span className={`timeline-dot ${i === 0 ? 'current' : ''}`} />
                <div>
                  <b>{ev.status}</b>
                  <p>{ev.note || `Status marked as ${ev.status}`}</p>
                  <small>
                    {ev.location} · {new Date(ev.createdAt).toLocaleString()}
                    {ev.updatedByName && ` · Updated by ${ev.updatedByName}`}
                  </small>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="modal-actions">
          <button type="button" className="btn btn-outline" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// PARCELS PAGE COMPONENT (NAV ROUTE)
// -------------------------------------------------------------
export function ParcelsPage() {
  const { user } = useAuth();
  const [parcels, setParcels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedParcel, setSelectedParcel] = useState(null);

  const admin = user?.role === 'admin';
  const agent = user?.role === 'agent';

  const loadParcels = () => {
    setLoading(true);
    const url = admin ? '/admin/parcels' : agent ? '/parcels/assigned' : '/parcels/mine';
    api
      .get(url)
      .then(r => setParcels(r.data.parcels || []))
      .catch(e => toast.error(messageOf(e)))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadParcels();
  }, [user?.role]);

  return (
    <>
      <PageTitle
        eyebrow="PARCEL MANAGEMENT"
        title={admin ? 'All Parcel Dispatches' : agent ? 'Assigned Route Deliveries' : 'My Parcel Shipments'}
        description={
          admin
            ? 'Search, filter, inspect and assign parcels across the entire delivery network.'
            : agent
            ? 'View pickup details, recipient phone numbers, and record OTP delivery handovers.'
            : 'Track status timelines, check verification OTPs, and review charges.'
        }
        action={
          !admin &&
          !agent && (
            <Link className="btn btn-primary" to="/app/book">
              <Plus size={17} /> Book a Parcel
            </Link>
          )
        }
      />

      <section className="panel">
        {loading ? (
          <Loading message="Loading parcel database…" />
        ) : (
          <ParcelTable
            parcels={parcels}
            admin={admin}
            agent={agent}
            onChanged={loadParcels}
            onSelectParcel={setSelectedParcel}
          />
        )}
      </section>

      {selectedParcel && (
        <ParcelDetailModal
          parcel={selectedParcel}
          onClose={() => setSelectedParcel(null)}
          isCustomer={!admin && !agent}
          isAdmin={admin}
          isAgent={agent}
        />
      )}
    </>
  );
}
