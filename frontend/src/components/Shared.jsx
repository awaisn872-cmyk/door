import { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import {
  Package,
  ArrowRight,
  LogOut,
  Menu,
  X,
  LayoutDashboard,
  Truck,
  UserRound,
  Settings,
  ClipboardList,
  Search,
  CircleHelp,
  Globe,
  MapPin,
  ShieldCheck,
  Calculator,
  Phone,
  Mail
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function Brand({ light = false }) {
  return (
    <Link to="/" className={`brand ${light ? 'brand-light' : ''}`}>
      <span className="brand-mark">
        <Package size={22} />
      </span>
      <span>
        DoorDash<span className="brand-dot">.</span>
        <small>COURIER MANAGEMENT</small>
      </span>
    </Link>
  );
}

export function PublicNav() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  // Close mobile navigation drawer on resize above mobile breakpoint
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 992 && open) {
        setOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [open]);

  // Lock body scroll when mobile nav is open on iOS / Android
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [open]);

  return (
    <header className="public-nav">
      <div className="container nav-inner">
        <Brand />

        <button
          type="button"
          className="mobile-toggle"
          onClick={() => setOpen(!open)}
          aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={open}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>

        {open && (
          <div
            className="mobile-nav-backdrop"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
        )}

        <nav className={`nav-links ${open ? 'open' : ''}`}>
          <div className="nav-main-links">
            <Link to="/" onClick={() => setOpen(false)}>
              Home
            </Link>
            <Link to="/services" onClick={() => setOpen(false)}>
              Services
            </Link>
            <Link to="/track" onClick={() => setOpen(false)}>
              Track Parcel
            </Link>
            <Link to="/pricing-info" onClick={() => setOpen(false)}>
              Delivery Charges
            </Link>
            <Link to="/about" onClick={() => setOpen(false)}>
              About Us
            </Link>
            <Link to="/contact" onClick={() => setOpen(false)}>
              Contact
            </Link>
          </div>

          {user ? (
            <div className="nav-auth-group">
              <Link
                className="btn btn-primary nav-dashboard-btn"
                to="/app"
                onClick={() => setOpen(false)}
              >
                <LayoutDashboard size={16} /> Dashboard
              </Link>
              <button
                type="button"
                className="btn btn-outline nav-logout-btn"
                onClick={() => {
                  setOpen(false);
                  logout();
                }}
              >
                <LogOut size={15} /> Sign out
              </button>
            </div>
          ) : (
            <div className="nav-auth-group">
              <Link
                to="/login"
                className="nav-signin-link"
                onClick={() => setOpen(false)}
              >
                Sign In
              </Link>
              <Link
                className="btn btn-primary nav-cta-btn"
                to="/register"
                onClick={() => setOpen(false)}
              >
                Ship a Parcel <ArrowRight size={16} />
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}

export function AppShell({ children }) {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  // Close sidebar on window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 992 && open) {
        setOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [open]);

  // Lock body scroll when mobile sidebar is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [open]);

  const links =
    user?.role === 'admin'
      ? [
          ['Overview', '/app', 'grid'],
          ['All Parcels', '/app/parcels', 'parcels'],
          ['Customers & Agents', '/app/users', 'users'],
          ['Delivery Pricing', '/app/pricing', 'pricing'],
          ['Payment Records', '/app/payments', 'payments'],
          ['Reports & Analytics', '/app/reports', 'reports'],
          ['Profile & Security', '/app/settings', 'profile']
        ]
      : user?.role === 'agent'
      ? [
          ['My Route', '/app', 'truck'],
          ['Deliveries List', '/app/parcels', 'parcels'],
          ['Profile & Security', '/app/settings', 'profile']
        ]
      : [
          ['Dashboard', '/app', 'grid'],
          ['Book a Parcel', '/app/book', 'book'],
          ['My Parcels', '/app/parcels', 'parcels'],
          ['Saved Addresses', '/app/addresses', 'addresses'],
          ['Profile & Security', '/app/settings', 'profile']
        ];

  const getIcon = key => {
    switch (key) {
      case 'grid':
        return <LayoutDashboard size={18} />;
      case 'parcels':
        return <Package size={18} />;
      case 'users':
        return <UserRound size={18} />;
      case 'pricing':
        return <Calculator size={18} />;
      case 'payments':
      case 'reports':
        return <ClipboardList size={18} />;
      case 'truck':
        return <Truck size={18} />;
      case 'book':
        return <Package size={18} />;
      case 'addresses':
        return <MapPin size={18} />;
      case 'profile':
        return <Settings size={18} />;
      default:
        return <Package size={18} />;
    }
  };

  const roleLabels = {
    admin: 'Administrator',
    agent: 'Delivery Agent',
    customer: 'Customer'
  };

  return (
    <div className="app-layout">
      <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
        <div className="sidebar-brand">
          <Brand light />
          <button
            type="button"
            className="sidebar-close"
            onClick={() => setOpen(false)}
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        <div className="workspace-label">
          {roleLabels[user?.role] || 'PORTAL'} WORKSPACE
        </div>

        <nav className="side-links">
          {links.map(([label, to, key]) => (
            <NavLink
              end={to === '/app'}
              onClick={() => setOpen(false)}
              className={({ isActive }) => `side-link ${isActive ? 'active' : ''}`}
              key={to}
              to={to}
            >
              {getIcon(key)}
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <Link to="/" className="side-link back-website">
            <Globe size={16} />
            <span>Public Website</span>
            <ArrowRight size={14} className="back-website-arrow" />
          </Link>

          <div className="help-card">
            <CircleHelp size={18} />
            <b>DoorDash Help Desk</b>
            <span>Need assistance with shipments or operations?</span>
            <Link to="/contact">Support Center &rarr;</Link>
          </div>

          <button
            type="button"
            className="side-link side-logout"
            onClick={logout}
          >
            <LogOut size={16} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {open && (
        <div
          className="sidebar-overlay"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      <main className="app-main">
        <header className="app-topbar">
          <button
            type="button"
            className="mobile-toggle top-menu"
            onClick={() => setOpen(!open)}
            aria-label="Open sidebar menu"
          >
            <Menu size={22} />
          </button>

          <div className="breadcrumb">
            <span>Workspace</span> /{' '}
            <b>{links.find(x => x[1] === window.location.pathname)?.[0] || 'Dashboard'}</b>
          </div>

          <div className="top-user">
            <span className="top-avatar">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </span>
            <div className="top-user-info">
              <b>{user?.name || 'User'}</b>
              <small>{roleLabels[user?.role] || 'Courier Account'}</small>
            </div>
          </div>
        </header>

        <div className="app-content">{children}</div>

        <footer className="app-footer">
          <span>&copy; {new Date().getFullYear()} DoorDash Courier Management System. All rights reserved.</span>
          <div>
            <Link to="/about">About</Link>
            <Link to="/pricing-info">Pricing</Link>
            <Link to="/terms">Terms</Link>
            <Link to="/privacy">Privacy</Link>
            <Link to="/contact">Support</Link>
          </div>
        </footer>
      </main>
    </div>
  );
}

export function PageTitle({ eyebrow, title, description, action }) {
  return (
    <div className="page-title">
      <div>
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {action && <div className="page-title-action">{action}</div>}
    </div>
  );
}

export function StatCard({ label, value, sub, icon: Icon, tone = 'orange' }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${tone}`}>{Icon && <Icon size={21} />}</div>
      <div className="stat-copy">
        <span>{label}</span>
        <strong>{value ?? 0}</strong>
        {sub && <small>{sub}</small>}
      </div>
    </div>
  );
}

export function StatusBadge({ status }) {
  const clean = String(status || 'Pending').trim();
  const cls = clean.toLowerCase().replace(/\s+/g, '-');
  return <span className={`status-badge status-${cls}`}>{clean}</span>;
}

export function Loading({ message = 'Loading workspace data…' }) {
  return (
    <div className="loading-wrap">
      <span className="spinner" />
      <span>{message}</span>
    </div>
  );
}

export function EmptyState({
  title = 'No records found',
  text = 'Items will appear here once bookings or assignments are made.',
  action
}) {
  return (
    <div className="empty-state">
      <span>
        <Package size={26} />
      </span>
      <h3>{title}</h3>
      <p>{text}</p>
      {action}
    </div>
  );
}
