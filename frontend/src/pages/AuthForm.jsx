import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  UserRound,
  Phone,
  ShieldAlert,
  Info
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { messageOf } from '../api';

export default function AuthForm({ isLogin, selectedRole = 'customer' }) {
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  });

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setBusy(true);

    try {
      if (isLogin) {
        const user = await login({
          email: form.email,
          password: form.password,
          role: selectedRole
        });
        toast.success(`Welcome back, ${user.name}!`);
        navigate('/app');
      } else {
        const user = await register({
          name: form.name,
          email: form.email,
          phone: form.phone,
          password: form.password
        });
        toast.success(`Account created! Welcome to DoorDash, ${user.name}!`);
        navigate('/app');
      }
    } catch (error) {
      toast.error(messageOf(error));
    } finally {
      setBusy(false);
    }
  }

  const roleTitles = {
    admin: 'Administrator Portal',
    agent: 'Delivery Agent Portal',
    customer: 'Customer Portal'
  };

  const roleSubtitles = {
    admin: 'Log in to manage courier operations, fleet assignments, and rates.',
    agent: 'Log in to view assigned routes and update parcel delivery progress.',
    customer: isLogin
      ? 'Log in to book deliveries, track shipments, and view order history.'
      : 'Create a free customer account to book and track shipments.'
  };

  return (
    <div className="auth-form-card">
      <div className="auth-form-header">
        <span className="auth-step">
          {isLogin ? `${selectedRole.toUpperCase()} SIGN IN` : 'CUSTOMER REGISTRATION'}
        </span>
        <h2>{isLogin ? roleTitles[selectedRole] : 'Create Customer Account'}</h2>
        <p>{roleSubtitles[selectedRole]}</p>
      </div>

      {isLogin && selectedRole !== 'customer' && (
        <div className="alert alert-info auth-role-notice">
          <Info size={16} />
          <span>
            <b>Staff Notice:</b> {selectedRole === 'admin' ? 'Administrator' : 'Delivery Agent'} accounts
            are provisioned by the operations team. Public self-registration is restricted.
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="form-stack">
        {!isLogin && (
          <>
            <label>
              Full Name
              <div className="input-wrap">
                <UserRound size={18} />
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. John Doe"
                  required
                  autoComplete="name"
                />
              </div>
            </label>

            <label>
              Phone Number <span className="optional">Optional</span>
              <div className="input-wrap">
                <Phone size={18} />
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="+92 300 1234567"
                  autoComplete="tel"
                />
              </div>
            </label>
          </>
        )}

        <label>
          Email Address
          <div className="input-wrap">
            <Mail size={18} />
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="name@example.com"
              required
              autoComplete="email"
            />
          </div>
        </label>

        <label>
          Password
          <div className="input-wrap">
            <LockKeyhole size={18} />
            <input
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={handleChange}
              placeholder={isLogin ? 'Enter your password' : 'At least 8 characters'}
              required
              minLength={isLogin ? 1 : 8}
              autoComplete={isLogin ? 'current-password' : 'new-password'}
            />
            <button
              type="button"
              className="show-password"
              onClick={() => setShowPassword(!showPassword)}
              aria-label="Toggle password visibility"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </label>

        {isLogin && (
          <div className="form-note">
            <span>Forgot password? Contact system administrator to reset credentials.</span>
          </div>
        )}

        <button
          type="submit"
          className="btn btn-primary btn-full btn-large"
          disabled={busy}
        >
          {busy ? (
            'Authenticating…'
          ) : isLogin ? (
            <>
              Sign in as {selectedRole === 'admin' ? 'Admin' : selectedRole === 'agent' ? 'Agent' : 'Customer'}
              <ArrowRight size={18} />
            </>
          ) : (
            <>
              Complete Registration <ArrowRight size={18} />
            </>
          )}
        </button>
      </form>

      <div className="auth-switch">
        {isLogin ? (
          selectedRole === 'customer' ? (
            <>
              New customer? <Link to="/register">Create customer account</Link>
            </>
          ) : (
            <span className="text-muted">
              Need staff access? Contact your operations administrator.
            </span>
          )
        ) : (
          <>
            Already have an account? <Link to="/login">Sign in here</Link>
          </>
        )}
      </div>

      <div className="auth-legal">
        Secured with encrypted credentials and role-based access authorization.
      </div>
    </div>
  );
}
