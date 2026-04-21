// ============================================================
// STUDENT PANEL — HostelPro
// Separate login for students
// ============================================================

import { useState, useContext, createContext, useReducer, useEffect, useCallback } from "react";
import { api, getToken, setToken, setUser, getUser, removeToken, removeUser } from "./api";

// ─────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --brand: #0f3460;
    --accent: #e94560;
    --accent2: #533483;
    --teal: #00b4d8;
    --green: #06d6a0;
    --surface: #ffffff;
    --surface2: #f8f9fc;
    --surface3: #f1f3f9;
    --border: #e4e8f0;
    --text: #1a1a2e;
    --text2: #5a6482;
    --text3: #9aa0b8;
    --radius: 12px;
    --radius-lg: 16px;
    --shadow: 0 2px 12px rgba(26,26,46,0.08);
    --shadow-lg: 0 8px 32px rgba(26,26,46,0.14);
    font-family: 'DM Sans', sans-serif;
  }

  body { background: var(--surface2); color: var(--text); min-height: 100vh; }
  .font-display { font-family: 'Syne', sans-serif; }

  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: var(--surface2); }
  ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }

  @keyframes slideIn { from { opacity:0; transform: translateY(10px); } to { opacity:1; transform: translateY(0); } }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }

  .animate-in { animation: slideIn 0.3s ease; }
  .spinner { animation: spin 0.7s linear infinite; }

  /* Layout */
  .layout { display: flex; min-height: 100vh; }
  .sidebar {
    width: 260px; min-width: 260px;
    background: var(--brand);
    display: flex; flex-direction: column;
    position: sticky; top: 0; height: 100vh; overflow-y: auto;
  }
  .main { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
  .topbar {
    background: var(--surface); border-bottom: 1px solid var(--border);
    padding: 0 28px; height: 64px; display: flex; align-items: center;
    justify-content: space-between; position: sticky; top: 0; z-index: 10;
  }
  .content { flex: 1; padding: 28px; overflow-y: auto; }

  /* Sidebar */
  .sidebar-logo { padding: 24px 20px 16px; border-bottom: 1px solid rgba(255,255,255,0.08); }
  .nav-item {
    display: flex; align-items: center; gap: 12px; padding: 11px 20px;
    color: rgba(255,255,255,0.6); cursor: pointer; transition: all 0.2s;
    border-left: 3px solid transparent; font-size: 14px; font-weight: 500;
    user-select: none;
  }
  .nav-item:hover { color: #fff; background: rgba(255,255,255,0.06); }
  .nav-item.active { color: #fff; background: rgba(233,69,96,0.18); border-left-color: var(--accent); font-weight: 600; }
  .nav-section { padding: 16px 20px 6px; font-size: 10px; font-weight: 700; color: rgba(255,255,255,0.25); letter-spacing: 1.2px; text-transform: uppercase; }

  /* Cards */
  .card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 20px; box-shadow: var(--shadow); }
  .stat-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 20px 24px; box-shadow: var(--shadow); position: relative; overflow: hidden; transition: transform 0.2s, box-shadow 0.2s; }
  .stat-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-lg); }
  .accent-bar { position: absolute; top: 0; left: 0; right: 0; height: 3px; }

  /* Buttons */
  .btn { display: inline-flex; align-items: center; gap: 6px; padding: 9px 18px; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.15s; border: none; font-family: 'DM Sans', sans-serif; white-space: nowrap; }
  .btn-primary { background: var(--accent); color: #fff; }
  .btn-primary:hover { background: #c73652; transform: translateY(-1px); }
  .btn-secondary { background: var(--surface); color: var(--text); border: 1px solid var(--border); }
  .btn-secondary:hover { background: var(--surface3); }
  .btn-ghost { background: transparent; color: var(--text2); }
  .btn-ghost:hover { background: var(--surface3); }
  .btn-sm { padding: 6px 12px; font-size: 13px; }
  .btn-danger { background: #fee2e2; color: #dc2626; }
  .btn-success { background: #d1fae5; color: #065f46; }
  .btn-icon { padding: 8px; border-radius: 8px; }
  .btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .btn-teal { background: var(--teal); color: #fff; }
  .btn-teal:hover { background: #0096b4; }

  /* Badges */
  .badge { display: inline-flex; align-items: center; padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; }
  .badge-green { background: #d1fae5; color: #065f46; }
  .badge-red { background: #fee2e2; color: #dc2626; }
  .badge-yellow { background: #fef3c7; color: #92400e; }
  .badge-blue { background: #dbeafe; color: #1e40af; }
  .badge-purple { background: #ede9fe; color: #5b21b6; }
  .badge-gray { background: var(--surface3); color: var(--text2); }
  .badge-orange { background: #ffedd5; color: #9a3412; }
  .badge-teal { background: #cffafe; color: #0e7490; }

  /* Forms */
  .form-group { margin-bottom: 16px; }
  .form-label { display: block; font-size: 13px; font-weight: 600; color: var(--text2); margin-bottom: 6px; }
  .form-input { width: 100%; padding: 10px 14px; border: 1.5px solid var(--border); border-radius: 8px; font-size: 14px; color: var(--text); background: var(--surface); transition: border-color 0.15s; font-family: 'DM Sans', sans-serif; outline: none; }
  .form-input:focus { border-color: var(--accent); }
  .form-select { width: 100%; padding: 10px 14px; border: 1.5px solid var(--border); border-radius: 8px; font-size: 14px; color: var(--text); background: var(--surface); cursor: pointer; outline: none; font-family: 'DM Sans', sans-serif; }

  /* Table */
  .table-wrap { overflow-x: auto; }
  table { width: 100%; border-collapse: collapse; font-size: 14px; }
  th { text-align: left; padding: 12px 16px; font-size: 12px; font-weight: 700; color: var(--text3); text-transform: uppercase; letter-spacing: 0.6px; background: var(--surface2); border-bottom: 1px solid var(--border); }
  td { padding: 13px 16px; border-bottom: 1px solid var(--border); color: var(--text); vertical-align: middle; }
  tr:last-child td { border-bottom: none; }
  tr:hover td { background: var(--surface2); }

  /* Modal */
  .modal-overlay { position: fixed; inset: 0; background: rgba(26,26,46,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; backdrop-filter: blur(2px); }
  .modal { background: var(--surface); border-radius: var(--radius-lg); width: 100%; max-width: 500px; max-height: 90vh; overflow-y: auto; box-shadow: var(--shadow-lg); animation: slideIn 0.2s ease; }
  .modal-header { padding: 20px 24px 0; display: flex; align-items: center; justify-content: space-between; }
  .modal-body { padding: 20px 24px; }
  .modal-footer { padding: 16px 24px; border-top: 1px solid var(--border); display: flex; justify-content: flex-end; gap: 10px; }

  /* Login */
  .login-page { min-height: 100vh; display: flex; background: var(--brand); }
  .login-left { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px; color: #fff; }
  .login-right { width: 460px; background: var(--surface); display: flex; align-items: center; justify-content: center; padding: 40px; }
  @media(max-width:768px) { .login-left { display: none; } .login-right { width: 100%; } }

  /* Grid */
  .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
  .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; }
  .grid-4 { display: grid; grid-template-columns: repeat(4,1fr); gap: 20px; }
  @media(max-width:1100px) { .grid-4 { grid-template-columns: 1fr 1fr; } }
  @media(max-width:700px) { .grid-3,.grid-2 { grid-template-columns: 1fr; } }

  /* Tabs */
  .tabs { display: flex; gap: 2px; background: var(--surface3); padding: 4px; border-radius: 10px; }
  .tab { flex: 1; padding: 8px 14px; border-radius: 7px; font-size: 13px; font-weight: 500; cursor: pointer; color: var(--text2); transition: all 0.15s; text-align: center; border: none; background: transparent; }
  .tab.active { background: var(--surface); color: var(--text); box-shadow: var(--shadow); }

  /* Progress bar */
  .bar { height: 8px; background: var(--surface3); border-radius: 4px; overflow: hidden; }
  .bar-fill { height: 100%; border-radius: 4px; transition: width 0.8s ease; }

  /* Toast */
  .toast { position: fixed; bottom: 24px; right: 24px; z-index: 9999; background: var(--brand); color: #fff; padding: 12px 20px; border-radius: 10px; font-size: 14px; font-weight: 500; box-shadow: var(--shadow-lg); animation: slideIn 0.25s ease; display: flex; align-items: center; gap: 10px; min-width: 240px; }

  /* Info row */
  .info-row { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; background: var(--surface2); border-radius: 8px; margin-bottom: 8px; }

  /* Loading */
  .loading-screen { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: var(--brand); flex-direction: column; gap: 16px; }

  /* Notification dot */
  .notif-dot { width: 8px; height: 8px; background: var(--accent); border-radius: 50%; position: absolute; top: 6px; right: 6px; }

  /* Utilities */
  .flex { display: flex; }
  .items-center { align-items: center; }
  .justify-between { justify-content: space-between; }
  .gap-2 { gap: 8px; }
  .gap-3 { gap: 12px; }
  .gap-4 { gap: 16px; }
  .mb-1 { margin-bottom: 4px; }
  .mb-2 { margin-bottom: 8px; }
  .mb-3 { margin-bottom: 12px; }
  .mb-4 { margin-bottom: 16px; }
  .mb-6 { margin-bottom: 24px; }
  .mt-1 { margin-top: 4px; }
  .mt-2 { margin-top: 8px; }
  .text-sm { font-size: 13px; }
  .text-xs { font-size: 12px; }
  .text-muted { color: var(--text2); }
  .text-muted2 { color: var(--text3); }
  .text-accent { color: var(--accent); }
  .text-green { color: #059669; }
  .text-red { color: #dc2626; }
  .font-bold { font-weight: 700; }
  .font-semi { font-weight: 600; }
  .font-medium { font-weight: 500; }
  .w-full { width: 100%; }
  .truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .empty-state { text-align: center; padding: 48px 24px; color: var(--text3); }
  .empty-state .icon { font-size: 48px; margin-bottom: 12px; }
`;

// ─────────────────────────────────────────────
// ICONS
// ─────────────────────────────────────────────
const Icon = ({ name, size = 18, color = "currentColor" }) => {
  const icons = {
    home: <path d="M3 12L12 3l9 9M5 10v9h5v-5h4v5h5v-9"/>,
    bed: <><path d="M2 4v16M22 4v16M2 12h20M7 4v8M17 4v8"/><path d="M5 20h14"/></>,
    dollar: <><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></>,
    calendar: <><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>,
    food: <><path d="M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8zM6 1v3M10 1v3M14 1v3"/></>,
    clean: <><path d="M3 3h18M3 3l4 18M21 3l-4 18M9 21h6"/><path d="M9 9h6M10 15h4"/></>,
    basketball: <><circle cx="12" cy="12" r="10"/><path d="M4.93 4.93a12 12 0 0 0 14.14 14.14M4.93 19.07A12 12 0 0 1 19.07 4.93"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="12" y1="2" x2="12" y2="22"/></>,
    user: <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>,
    logout: <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></>,
    check: <polyline points="20 6 9 17 4 12"/>,
    x: <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>,
    plus: <><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>,
    alert: <><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></>,
    info: <><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></>,
    clock: <><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>,</>,
    star: <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>,
    bell: <><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"/></>,
    refresh: <><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.49"/></>,
    key: <><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}
      strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      {icons[name] || icons.info}
    </svg>
  );
};

// ─────────────────────────────────────────────
// CONTEXT
// ─────────────────────────────────────────────
const StudentContext = createContext(null);

const initialState = {
  currentUser: getUser(),
  activeModule: "home",
  myData: null,
  events: [],
  menu: {},
  sports: [],
  toast: null,
};

function reducer(state, action) {
  switch (action.type) {
    case "SET_USER": return { ...state, currentUser: action.payload };
    case "LOGOUT": return { ...state, currentUser: null, myData: null };
    case "SET_MODULE": return { ...state, activeModule: action.payload };
    case "SET_MY_DATA": return { ...state, myData: action.payload };
    case "SET_EVENTS": return { ...state, events: action.payload };
    case "SET_MENU": return { ...state, menu: action.payload };
    case "SET_SPORTS": return { ...state, sports: action.payload };
    case "SET_CLEANING": return { ...state, myData: state.myData ? { ...state.myData, cleanReqs: action.payload } : state.myData };
    case "SHOW_TOAST": return { ...state, toast: action.payload };
    case "HIDE_TOAST": return { ...state, toast: null };
    default: return state;
  }
}

// ─────────────────────────────────────────────
// UTILITY COMPONENTS
// ─────────────────────────────────────────────
const Avatar = ({ name = "?", size = 40, color = "#e94560" }) => {
  const initials = name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: color + "22", color, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: size * 0.35, flexShrink: 0 }}>
      {initials}
    </div>
  );
};

const Badge = ({ status }) => {
  const map = {
    PAID: "badge-green", Paid: "badge-green", AVAILABLE: "badge-green", Available: "badge-green",
    COMPLETED: "badge-green", Completed: "badge-green", Active: "badge-green", ACTIVE: "badge-green",
    PENDING: "badge-yellow", Pending: "badge-yellow",
    IN_PROGRESS: "badge-blue", "In Progress": "badge-blue",
    UPCOMING: "badge-blue", Upcoming: "badge-blue",
    OVERDUE: "badge-red", Overdue: "badge-red",
    MONTHLY: "badge-purple", Monthly: "badge-purple",
    DAILY: "badge-teal", Daily: "badge-teal",
    ONE_TIME: "badge-orange", "One Time": "badge-orange",
    HIGH: "badge-red", MEDIUM: "badge-yellow", LOW: "badge-blue",
    CULTURAL: "badge-purple", SPORTS: "badge-green", MEETING: "badge-blue", GENERAL: "badge-gray",
    Good: "badge-purple", Excellent: "badge-green", Fair: "badge-yellow", Poor: "badge-red",
    CANCELLED: "badge-red",
  };
  return <span className={`badge ${map[status] || "badge-gray"}`}>{status?.replace(/_/g, " ")}</span>;
};

const Modal = ({ open, onClose, title, children, footer }) => {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h3 className="font-display" style={{ fontSize: 18, fontWeight: 700 }}>{title}</h3>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><Icon name="x" size={18} /></button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// LOGIN PAGE
// ─────────────────────────────────────────────
const LoginPage = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!email || !password) { setError("Please fill all fields"); return; }
    setLoading(true); setError("");
    try {
      const res = await api.auth.login(email, password);
      if (res.user.role !== "STUDENT") {
        setError("This portal is for students only. Use the admin panel.");
        return;
      }
      setToken(res.token);
      setUser(res.user);
      onLogin(res.user);
    } catch (err) {
      setError(err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Left side */}
      <div className="login-left">
        <div style={{ maxWidth: 400, textAlign: "center" }}>
          <div style={{ fontSize: 64, marginBottom: 20 }}>🏠</div>
          <h1 className="font-display" style={{ fontSize: 36, fontWeight: 700, marginBottom: 12 }}>HostelPro</h1>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.6)", lineHeight: 1.6, marginBottom: 40 }}>
            Your home away from home. Manage your stay, track payments, and stay connected.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {[
              { icon: "bed", text: "View your room details & amenities" },
              { icon: "dollar", text: "Track payments & fee status" },
              { icon: "food", text: "Check weekly mess menu" },
              { icon: "calendar", text: "View & RSVP hostel events" },
            ].map(item => (
              <div key={item.icon} style={{ display: "flex", alignItems: "center", gap: 12, color: "rgba(255,255,255,0.8)", fontSize: 14 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon name={item.icon} size={16} color="#fff" />
                </div>
                {item.text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right side */}
      <div className="login-right">
        <div style={{ width: "100%", maxWidth: 360 }}>
          <div style={{ marginBottom: 32 }}>
            <h2 className="font-display" style={{ fontSize: 26, fontWeight: 700, marginBottom: 8 }}>Student Login</h2>
            <p className="text-muted text-sm">Sign in with your student credentials</p>
          </div>

          {error && (
            <div style={{ background: "#fee2e2", color: "#dc2626", padding: "10px 14px", borderRadius: 8, marginBottom: 16, fontSize: 14, display: "flex", alignItems: "center", gap: 8 }}>
              <Icon name="alert" size={15} color="#dc2626" /> {error}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input className="form-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password" onKeyDown={e => e.key === "Enter" && handleLogin()} />
          </div>

          <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center", padding: "12px", marginTop: 8, fontSize: 15 }} onClick={handleLogin} disabled={loading}>
            {loading ? "Signing in..." : "Sign In →"}
          </button>

          <div style={{ marginTop: 24, padding: "14px 16px", background: "var(--surface2)", borderRadius: 10, border: "1px solid var(--border)" }}>
            <p className="text-xs text-muted2 font-semi mb-2">Demo Credentials:</p>
            <p className="text-xs text-muted">Email: arjun@student.com</p>
            <p className="text-xs text-muted">Password: student123</p>
          </div>

          <p className="text-xs text-muted2" style={{ textAlign: "center", marginTop: 20 }}>
            Admin? <a href="http://localhost:5173" style={{ color: "var(--accent)", textDecoration: "none" }}>Go to Admin Panel →</a>
          </p>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// HOME / DASHBOARD
// ─────────────────────────────────────────────
const HomeModule = () => {
  const { state } = useContext(StudentContext);
  const { myData, currentUser, events } = state;
  const student = myData;
  const room = student?.room;
  const payments = student?.payments || [];
  const overduePayments = payments.filter(p => p.status === "OVERDUE" || p.status === "PENDING");
  const upcomingEvents = events.filter(e => e.status === "UPCOMING").slice(0, 3);

  return (
    <div className="animate-in">
      {/* Welcome Banner */}
      <div style={{ background: "linear-gradient(135deg, var(--brand) 0%, #533483 100%)", borderRadius: "var(--radius-lg)", padding: "28px 32px", marginBottom: 24, color: "#fff", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", right: -20, top: -20, width: 150, height: 150, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
        <div style={{ position: "absolute", right: 40, bottom: -40, width: 100, height: 100, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
        <div style={{ position: "relative" }}>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", marginBottom: 4 }}>{new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
          <h1 className="font-display" style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Welcome back, {currentUser?.name?.split(" ")[0]}! 👋</h1>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.7)" }}>
            {student?.course} • Year {student?.year} • {room ? `Room ${room.number}` : "No room assigned"}
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid-4 mb-6">
        <div className="stat-card">
          <div className="accent-bar" style={{ background: "#0f3460" }} />
          <div className="text-sm text-muted font-medium mb-2">My Room</div>
          <div className="font-display" style={{ fontSize: 26, fontWeight: 700 }}>{room ? `#${room.number}` : "—"}</div>
          <div className="text-xs text-muted2">{room ? room.type?.replace("_", " ") + ` • Floor ${room.floor}` : "Not assigned"}</div>
        </div>
        <div className="stat-card">
          <div className="accent-bar" style={{ background: "#e94560" }} />
          <div className="text-sm text-muted font-medium mb-2">Rent</div>
          <div className="font-display" style={{ fontSize: 26, fontWeight: 700 }}>₹{room ? Number(room.rent).toLocaleString() : "—"}</div>
          <div className="text-xs text-muted2">per month</div>
        </div>
        <div className="stat-card">
          <div className="accent-bar" style={{ background: overduePayments.length > 0 ? "#ef4444" : "#06d6a0" }} />
          <div className="text-sm text-muted font-medium mb-2">Payment Status</div>
          <div className="font-display" style={{ fontSize: 26, fontWeight: 700, color: overduePayments.length > 0 ? "#dc2626" : "#059669" }}>
            {overduePayments.length > 0 ? `${overduePayments.length} Due` : "Clear ✓"}
          </div>
          <div className="text-xs text-muted2">{payments.length} total payments</div>
        </div>
        <div className="stat-card">
          <div className="accent-bar" style={{ background: "#f5a623" }} />
          <div className="text-sm text-muted font-medium mb-2">Events</div>
          <div className="font-display" style={{ fontSize: 26, fontWeight: 700 }}>{upcomingEvents.length}</div>
          <div className="text-xs text-muted2">upcoming this month</div>
        </div>
      </div>

      <div className="grid-2">
        {/* Pending Payments Alert */}
        <div className="card">
          <h3 className="font-semi mb-4" style={{ fontSize: 15 }}>Payment Summary</h3>
          {overduePayments.length > 0 ? (
            <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: "14px 16px", marginBottom: 12 }}>
              <div className="flex items-center gap-2 mb-1">
                <Icon name="alert" size={15} color="#dc2626" />
                <span className="font-semi text-sm text-red">Payment Due!</span>
              </div>
              <p className="text-xs text-muted2">You have {overduePayments.length} pending/overdue payment(s). Please clear them soon.</p>
            </div>
          ) : (
            <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: "14px 16px", marginBottom: 12 }}>
              <div className="flex items-center gap-2">
                <Icon name="check" size={15} color="#059669" />
                <span className="font-semi text-sm text-green">All payments clear!</span>
              </div>
            </div>
          )}
          {payments.slice(0, 4).map(p => (
            <div key={p.id} className="info-row">
              <div>
                <div className="text-sm font-medium">{p.type?.replace("_", " ")}</div>
                <div className="text-xs text-muted2">Due: {new Date(p.dueDate).toLocaleDateString()}</div>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semi">₹{Number(p.amount).toLocaleString()}</span>
                <Badge status={p.status} />
              </div>
            </div>
          ))}
        </div>

        {/* Upcoming Events */}
        <div className="card">
          <h3 className="font-semi mb-4" style={{ fontSize: 15 }}>Upcoming Events</h3>
          {upcomingEvents.length === 0 ? (
            <div className="empty-state"><div className="icon">📅</div><p>No upcoming events</p></div>
          ) : (
            upcomingEvents.map(e => (
              <div key={e.id} style={{ padding: "14px 0", borderBottom: "1px solid var(--border)" }}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semi text-sm">{e.title}</span>
                  <Badge status={e.category} />
                </div>
                <div className="text-xs text-muted2 flex items-center gap-1">
                  <Icon name="calendar" size={12} />
                  {new Date(e.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </div>
                <p className="text-xs text-muted mt-1">{e.description}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// MY ROOM
// ─────────────────────────────────────────────
const MyRoomModule = () => {
  const { state } = useContext(StudentContext);
  const room = state.myData?.room;

  if (!room) return (
    <div className="animate-in">
      <h1 className="font-display mb-6" style={{ fontSize: 26, fontWeight: 700 }}>My Room</h1>
      <div className="card empty-state"><div className="icon">🏠</div><p>No room assigned yet. Contact admin.</p></div>
    </div>
  );

  const amenities = typeof room.amenities === "string" ? room.amenities.split(",") : room.amenities || [];
  const amenityIcons = { AC: "❄️", WiFi: "📶", TV: "📺", Fan: "🌀", Balcony: "🌿", Geyser: "🚿" };

  return (
    <div className="animate-in">
      <h1 className="font-display mb-6" style={{ fontSize: 26, fontWeight: 700 }}>My Room</h1>

      {/* Room Card */}
      <div style={{ background: "linear-gradient(135deg, #0f3460 0%, #533483 100%)", borderRadius: "var(--radius-lg)", padding: 28, marginBottom: 24, color: "#fff" }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: 1 }}>Your Room</p>
            <h2 className="font-display" style={{ fontSize: 48, fontWeight: 700 }}>#{room.number}</h2>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ background: "rgba(255,255,255,0.15)", padding: "6px 14px", borderRadius: 20, fontSize: 13, fontWeight: 600 }}>{room.type?.replace("_", " ")}</div>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 8 }}>Floor {room.floor}</p>
          </div>
        </div>
        <div style={{ display: "flex", gap: 24 }}>
          <div><p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>Monthly Rent</p><p style={{ fontSize: 20, fontWeight: 700 }}>₹{Number(room.rent).toLocaleString()}</p></div>
          <div><p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>Capacity</p><p style={{ fontSize: 20, fontWeight: 700 }}>{room.capacity} beds</p></div>
          <div><p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>Status</p><p style={{ fontSize: 20, fontWeight: 700 }}>{room.status?.replace("_", " ")}</p></div>
        </div>
      </div>

      {/* Amenities */}
      <div className="card mb-4">
        <h3 className="font-semi mb-4">Room Amenities</h3>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          {amenities.map(a => (
            <div key={a} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", background: "var(--surface2)", borderRadius: 10, border: "1px solid var(--border)" }}>
              <span style={{ fontSize: 18 }}>{amenityIcons[a.trim()] || "✓"}</span>
              <span className="text-sm font-medium">{a.trim()}</span>
            </div>
          ))}
          {amenities.length === 0 && <p className="text-muted2 text-sm">No amenities listed</p>}
        </div>
      </div>

      {/* Roommates */}
      <div className="card">
        <h3 className="font-semi mb-4">Roommates</h3>
        {(state.myData?.room?.students || []).filter(s => s.userId !== state.myData?.userId).length === 0 ? (
          <p className="text-muted2 text-sm">No roommates or single occupancy room</p>
        ) : (
          (state.myData?.room?.students || []).filter(s => s.userId !== state.myData?.userId).map(s => (
            <div key={s.id} className="flex items-center gap-3" style={{ padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
              <Avatar name={s.user?.name || "?"} size={36} color="#533483" />
              <div>
                <div className="font-semi text-sm">{s.user?.name}</div>
                <div className="text-xs text-muted2">{s.course} • Year {s.year}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// MY PAYMENTS
// ─────────────────────────────────────────────
const MyPaymentsModule = () => {
  const { state } = useContext(StudentContext);
  const payments = state.myData?.payments || [];

  const totalPaid = payments.filter(p => p.status === "PAID").reduce((a, p) => a + Number(p.amount), 0);
  const totalDue = payments.filter(p => p.status !== "PAID").reduce((a, p) => a + Number(p.amount), 0);

  return (
    <div className="animate-in">
      <h1 className="font-display mb-6" style={{ fontSize: 26, fontWeight: 700 }}>My Payments</h1>

      <div className="grid-3 mb-6">
        <div className="stat-card">
          <div className="accent-bar" style={{ background: "#06d6a0" }} />
          <div className="text-sm text-muted font-medium mb-2">Total Paid</div>
          <div className="font-display" style={{ fontSize: 26, fontWeight: 700, color: "#059669" }}>₹{totalPaid.toLocaleString()}</div>
          <div className="text-xs text-muted2">{payments.filter(p => p.status === "PAID").length} payments</div>
        </div>
        <div className="stat-card">
          <div className="accent-bar" style={{ background: "#f5a623" }} />
          <div className="text-sm text-muted font-medium mb-2">Amount Due</div>
          <div className="font-display" style={{ fontSize: 26, fontWeight: 700, color: totalDue > 0 ? "#dc2626" : "#059669" }}>₹{totalDue.toLocaleString()}</div>
          <div className="text-xs text-muted2">{payments.filter(p => p.status !== "PAID").length} pending</div>
        </div>
        <div className="stat-card">
          <div className="accent-bar" style={{ background: "#0f3460" }} />
          <div className="text-sm text-muted font-medium mb-2">Total Payments</div>
          <div className="font-display" style={{ fontSize: 26, fontWeight: 700 }}>{payments.length}</div>
          <div className="text-xs text-muted2">all time records</div>
        </div>
      </div>

      <div className="card">
        <h3 className="font-semi mb-4">Payment History</h3>
        {payments.length === 0 ? (
          <div className="empty-state"><div className="icon">💳</div><p>No payment records</p></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Type</th><th>Amount</th><th>Due Date</th><th>Paid On</th><th>Method</th><th>Status</th></tr>
              </thead>
              <tbody>
                {payments.map(p => (
                  <tr key={p.id}>
                    <td><span className="font-medium">{p.type?.replace("_", " ")}</span></td>
                    <td><span className="font-semi">₹{Number(p.amount).toLocaleString()}</span></td>
                    <td>{new Date(p.dueDate).toLocaleDateString("en-IN")}</td>
                    <td>{p.paidDate ? new Date(p.paidDate).toLocaleDateString("en-IN") : <span className="text-muted2">—</span>}</td>
                    <td>{p.paymentMethod || <span className="text-muted2">—</span>}</td>
                    <td><Badge status={p.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// EVENTS MODULE
// ─────────────────────────────────────────────
const EventsModule = () => {
  const { state } = useContext(StudentContext);
  const { events } = state;
  const [filter, setFilter] = useState("ALL");

  const filtered = filter === "ALL" ? events : events.filter(e => e.status === filter);
  const catColors = { CULTURAL: "#533483", SPORTS: "#06d6a0", MEETING: "#0f3460", GENERAL: "#9aa0b8" };
  const catEmojis = { CULTURAL: "🎭", SPORTS: "🏆", MEETING: "📋", GENERAL: "📢" };

  return (
    <div className="animate-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display" style={{ fontSize: 26, fontWeight: 700 }}>Events</h1>
          <p className="text-muted text-sm">{events.length} events total</p>
        </div>
      </div>

      <div className="tabs mb-6" style={{ maxWidth: 400 }}>
        {["ALL", "UPCOMING", "ONGOING", "COMPLETED"].map(f => (
          <button key={f} className={`tab ${filter === f ? "active" : ""}`} onClick={() => setFilter(f)}>{f}</button>
        ))}
      </div>

      <div className="grid-2">
        {filtered.map(e => (
          <div key={e.id} className="card animate-in" style={{ borderTop: `3px solid ${catColors[e.category] || "#9aa0b8"}` }}>
            <div className="flex items-center justify-between mb-3">
              <span style={{ fontSize: 28 }}>{catEmojis[e.category] || "📢"}</span>
              <Badge status={e.status} />
            </div>
            <h3 className="font-semi mb-1" style={{ fontSize: 16 }}>{e.title}</h3>
            <p className="text-sm text-muted mb-3">{e.description}</p>
            <div className="flex items-center gap-4 text-xs text-muted2">
              <span className="flex items-center gap-1"><Icon name="calendar" size={12} /> {new Date(e.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
              <span className="flex items-center gap-1"><Icon name="user" size={12} /> {e.organizer}</span>
              <span className="flex items-center gap-1"><Icon name="star" size={12} /> {e.rsvps?.length || 0} RSVPs</span>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <div className="empty-state" style={{ gridColumn: "1/-1" }}><div className="icon">📅</div><p>No events found</p></div>}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// FOOD MODULE
// ─────────────────────────────────────────────
const FoodModule = () => {
  const { state } = useContext(StudentContext);
  const { menu } = state;
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const today = new Date().toLocaleDateString("en-US", { weekday: "long" });
  const [activeDay, setActiveDay] = useState(days.includes(today) ? today : "Monday");

  const dayMenu = menu[activeDay] || {};
  const mealEmojis = { breakfast: "☕", lunch: "🍱", dinner: "🌙" };

  return (
    <div className="animate-in">
      <h1 className="font-display mb-2" style={{ fontSize: 26, fontWeight: 700 }}>Food & Mess</h1>
      <p className="text-muted text-sm mb-6">Weekly menu schedule</p>

      <div className="tabs mb-6" style={{ overflowX: "auto" }}>
        {days.map(d => (
          <button key={d} className={`tab ${activeDay === d ? "active" : ""}`} onClick={() => setActiveDay(d)}>
            {d.slice(0, 3)}
            {d === today && <span style={{ display: "block", fontSize: 8, color: "var(--accent)" }}>Today</span>}
          </button>
        ))}
      </div>

      <div className="grid-3 mb-6">
        {["breakfast", "lunch", "dinner"].map(meal => (
          <div key={meal} className="card" style={{ borderTop: `3px solid ${meal === "breakfast" ? "#f5a623" : meal === "lunch" ? "#06d6a0" : "#533483"}` }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>{mealEmojis[meal]}</div>
            <h3 className="font-semi mb-1" style={{ textTransform: "capitalize", fontSize: 15 }}>{meal}</h3>
            <p className="text-sm text-muted">{dayMenu[meal] || <span className="text-muted2">Menu not available</span>}</p>
          </div>
        ))}
      </div>

      {/* My Meal Subscription */}
      <div className="card">
        <h3 className="font-semi mb-4">My Meal Subscription</h3>
        {(state.myData?.meals || []).length === 0 ? (
          <div className="empty-state"><div className="icon">🍽️</div><p>No active meal subscription</p></div>
        ) : (
          state.myData.meals.map(m => (
            <div key={m.id} className="info-row">
              <div>
                <div className="font-semi text-sm">Meal Plan</div>
                <div className="text-xs text-muted2">Since {new Date(m.startDate).toLocaleDateString()}</div>
              </div>
              <div className="flex items-center gap-3">
                <Badge status={m.plan} />
                <span className="font-semi">₹{Number(m.amount).toLocaleString()}</span>
                <Badge status={m.isActive ? "Active" : "Inactive"} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// CLEANING MODULE
// ─────────────────────────────────────────────
const CleaningModule = () => {
  const { state, dispatch } = useContext(StudentContext);
  const myRequests = state.myData?.cleanReqs || [];
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ type: "REGULAR", priority: "MEDIUM", notes: "" });

  const handleSubmit = async () => {
    if (!state.myData?.id) return;
    setLoading(true);
    try {
      const room = state.myData?.room;
      const created = await api.cleaning.create({
        studentId: state.myData.id,
        roomNumber: room?.number || "Unknown",
        type: form.type,
        priority: form.priority,
        notes: form.notes,
      });
      dispatch({ type: "SET_CLEANING", payload: [...myRequests, created] });
      dispatch({ type: "SHOW_TOAST", payload: { text: "Cleaning request submitted!", type: "success" } });
      setShowModal(false);
      setForm({ type: "REGULAR", priority: "MEDIUM", notes: "" });
    } catch (err) {
      dispatch({ type: "SHOW_TOAST", payload: { text: err.message, type: "error" } });
    } finally { setLoading(false); }
  };

  const statusColors = { PENDING: "#f5a623", IN_PROGRESS: "#0f3460", COMPLETED: "#06d6a0", CANCELLED: "#e94560" };

  return (
    <div className="animate-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display" style={{ fontSize: 26, fontWeight: 700 }}>Cleaning Requests</h1>
          <p className="text-muted text-sm">{myRequests.length} requests submitted</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}><Icon name="plus" size={16} /> New Request</button>
      </div>

      {myRequests.length === 0 ? (
        <div className="card empty-state"><div className="icon">🧹</div><p>No cleaning requests yet</p><p className="text-xs mt-1">Submit a request and we'll take care of it!</p></div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {myRequests.map(req => (
            <div key={req.id} className="card animate-in" style={{ borderLeft: `4px solid ${statusColors[req.status] || "#9aa0b8"}` }}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: (statusColors[req.status] || "#9aa0b8") + "20", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon name="clean" size={16} color={statusColors[req.status] || "#9aa0b8"} />
                  </div>
                  <div>
                    <div className="font-semi text-sm">{req.type?.replace(/_/g, " ")}</div>
                    <div className="text-xs text-muted2">Room {req.roomNumber} • {new Date(req.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge status={req.priority} />
                  <Badge status={req.status?.replace(/_/g, " ")} />
                </div>
              </div>
              {req.notes && <p className="text-xs text-muted2 mt-1">📝 {req.notes}</p>}
              {req.status === "COMPLETED" && req.completedAt && (
                <p className="text-xs text-green mt-1">✅ Completed on {new Date(req.completedAt).toLocaleDateString()}</p>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Request Cleaning"
        footer={<>
          <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>{loading ? "Submitting..." : "Submit Request"}</button>
        </>}>
        <div className="form-group">
          <label className="form-label">Cleaning Type</label>
          <select className="form-select" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
            <option value="REGULAR">Regular Cleaning</option>
            <option value="DEEP_CLEAN">Deep Clean</option>
            <option value="BATHROOM">Bathroom Cleaning</option>
            <option value="WINDOW">Window Cleaning</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Priority</label>
          <select className="form-select" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High (Urgent)</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Additional Notes</label>
          <textarea className="form-input" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={3} style={{ resize: "vertical" }} placeholder="Any specific instructions..." />
        </div>
      </Modal>
    </div>
  );
};

// ─────────────────────────────────────────────
// SPORTS MODULE
// ─────────────────────────────────────────────
const SportsModule = () => {
  const { state } = useContext(StudentContext);
  const { sports } = state;

  return (
    <div className="animate-in">
      <h1 className="font-display mb-2" style={{ fontSize: 26, fontWeight: 700 }}>Sports Equipment</h1>
      <p className="text-muted text-sm mb-6">Available equipment for checkout — contact admin to issue</p>

      <div className="grid-3">
        {sports.map(equip => {
          const pct = equip.total > 0 ? Math.round((equip.available / equip.total) * 100) : 0;
          const isAvailable = equip.available > 0;
          return (
            <div key={equip.id} className="card animate-in">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semi">{equip.name}</h3>
                <Badge status={equip.condition} />
              </div>
              <div className="grid-2 mb-3">
                <div style={{ textAlign: "center", padding: "10px", background: "var(--surface2)", borderRadius: 8 }}>
                  <div className="font-display" style={{ fontSize: 20, fontWeight: 700 }}>{equip.total}</div>
                  <div className="text-xs text-muted2">Total</div>
                </div>
                <div style={{ textAlign: "center", padding: "10px", background: "var(--surface2)", borderRadius: 8 }}>
                  <div className="font-display" style={{ fontSize: 20, fontWeight: 700, color: isAvailable ? "#059669" : "#dc2626" }}>{equip.available}</div>
                  <div className="text-xs text-muted2">Available</div>
                </div>
              </div>
              <div className="bar mb-3">
                <div className="bar-fill" style={{ width: pct + "%", background: pct > 50 ? "#10b981" : pct > 20 ? "#f59e0b" : "#ef4444" }} />
              </div>
              <div style={{ padding: "8px 12px", borderRadius: 8, background: isAvailable ? "#d1fae5" : "#fee2e2", textAlign: "center" }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: isAvailable ? "#065f46" : "#dc2626" }}>
                  {isAvailable ? "✓ Available for issue" : "✗ Not available"}
                </span>
              </div>
            </div>
          );
        })}
        {sports.length === 0 && <div className="empty-state" style={{ gridColumn: "1/-1" }}><div className="icon">🏀</div><p>No equipment listed</p></div>}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// PROFILE MODULE
// ─────────────────────────────────────────────
const ProfileModule = () => {
  const { state } = useContext(StudentContext);
  const { currentUser, myData } = state;

  return (
    <div className="animate-in">
      <h1 className="font-display mb-6" style={{ fontSize: 26, fontWeight: 700 }}>My Profile</h1>

      <div className="card mb-4">
        <div className="flex items-center gap-4 mb-6">
          <Avatar name={currentUser?.name || "?"} size={72} color="#e94560" />
          <div>
            <h2 className="font-display" style={{ fontSize: 22, fontWeight: 700 }}>{currentUser?.name}</h2>
            <p className="text-muted">{currentUser?.email}</p>
            <div className="mt-2"><Badge status="STUDENT" /></div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            { label: "Student ID", value: `#STU-${myData?.id || "—"}` },
            { label: "Course", value: myData?.course || "—" },
            { label: "Year", value: myData?.year ? `Year ${myData.year}` : "—" },
            { label: "Phone", value: currentUser?.phone || "—" },
            { label: "Join Date", value: myData?.joinDate ? new Date(myData.joinDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "—" },
            { label: "Room", value: myData?.room ? `Room ${myData.room.number} (Floor ${myData.room.floor})` : "Not assigned" },
          ].map(item => (
            <div key={item.label} className="info-row">
              <span className="text-sm text-muted2">{item.label}</span>
              <span className="text-sm font-medium">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// MAIN STUDENT APP
// ─────────────────────────────────────────────
const navItems = [
  { id: "home", label: "Home", icon: "home" },
  { id: "room", label: "My Room", icon: "bed" },
  { id: "payments", label: "Payments", icon: "dollar" },
  { id: "events", label: "Events", icon: "calendar" },
  { id: "food", label: "Food & Mess", icon: "food" },
  { id: "cleaning", label: "Cleaning", icon: "clean" },
  { id: "sports", label: "Sports", icon: "basketball" },
  { id: "profile", label: "My Profile", icon: "user" },
];

export default function StudentApp() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [appLoading, setAppLoading] = useState(true);

  const loadStudentData = useCallback(async () => {
    if (!getToken()) { setAppLoading(false); return; }
    try {
      const [students, events, sports, menuData] = await Promise.allSettled([
        api.students.getAll(),
        api.events.getAll(),
        api.sports.getAll(),
        api.food.getMenu(),
      ]);

      // Find current student's data
      if (students.status === "fulfilled") {
        const currentUser = getUser();
        const myStudent = students.value.find(s => s.user?.id === currentUser?.id || s.userId === currentUser?.id);
        if (myStudent) dispatch({ type: "SET_MY_DATA", payload: myStudent });
      }
      if (events.status === "fulfilled") dispatch({ type: "SET_EVENTS", payload: events.value });
      if (sports.status === "fulfilled") dispatch({ type: "SET_SPORTS", payload: sports.value });
      if (menuData.status === "fulfilled") {
        const menuObj = {};
        menuData.value.forEach(m => { menuObj[m.day] = { breakfast: m.breakfast, lunch: m.lunch, dinner: m.dinner }; });
        dispatch({ type: "SET_MENU", payload: menuObj });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAppLoading(false);
    }
  }, []);

  useEffect(() => { loadStudentData(); }, [loadStudentData]);

  useEffect(() => {
    if (state.toast) {
      const t = setTimeout(() => dispatch({ type: "HIDE_TOAST" }), 3000);
      return () => clearTimeout(t);
    }
  }, [state.toast]);

  const handleLogin = (user) => {
    dispatch({ type: "SET_USER", payload: user });
    loadStudentData();
  };

  const handleLogout = () => {
    removeToken(); removeUser();
    dispatch({ type: "LOGOUT" });
  };

  const moduleComponents = {
    home: <HomeModule />,
    room: <MyRoomModule />,
    payments: <MyPaymentsModule />,
    events: <EventsModule />,
    food: <FoodModule />,
    cleaning: <CleaningModule />,
    sports: <SportsModule />,
    profile: <ProfileModule />,
  };

  const overdueCount = (state.myData?.payments || []).filter(p => p.status === "OVERDUE").length;

  if (appLoading) {
    return (
      <>
        <style>{STYLES}</style>
        <div className="loading-screen">
          <div style={{ fontSize: 48 }}>🏠</div>
          <div className="font-display" style={{ fontSize: 22, fontWeight: 700, color: "#fff" }}>HostelPro</div>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14 }}>Student Portal</p>
          <svg className="spinner" width={32} height={32} viewBox="0 0 24 24" fill="none" stroke="#e94560" strokeWidth={2}>
            <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="12" />
          </svg>
        </div>
      </>
    );
  }

  if (!state.currentUser) {
    return (
      <>
        <style>{STYLES}</style>
        <LoginPage onLogin={handleLogin} />
      </>
    );
  }

  return (
    <StudentContext.Provider value={{ state, dispatch }}>
      <style>{STYLES}</style>
      <div className="layout">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="sidebar-logo">
            <div className="font-display" style={{ fontSize: 18, fontWeight: 700, color: "#fff" }}>🏠 HostelPro</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>Student Portal</div>
          </div>

          <div style={{ padding: "12px 0", flex: 1 }}>
            <div className="nav-section">Menu</div>
            {navItems.map(item => (
              <div key={item.id} className={`nav-item ${state.activeModule === item.id ? "active" : ""}`}
                onClick={() => dispatch({ type: "SET_MODULE", payload: item.id })}>
                <Icon name={item.icon} size={17} color="currentColor" />
                <span>{item.label}</span>
                {item.id === "payments" && overdueCount > 0 && (
                  <span style={{ marginLeft: "auto", background: "#e94560", color: "#fff", borderRadius: 10, padding: "1px 7px", fontSize: 11, fontWeight: 700 }}>{overdueCount}</span>
                )}
              </div>
            ))}
          </div>

          {/* Student Info */}
          <div style={{ padding: "12px 16px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
            <div className="flex items-center gap-2">
              <Avatar name={state.currentUser.name} size={36} color="#e94560" />
              <div style={{ flex: 1, overflow: "hidden" }}>
                <div className="text-sm font-semi truncate" style={{ color: "#fff" }}>{state.currentUser.name}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>Student</div>
              </div>
              <button className="btn btn-ghost btn-icon" style={{ color: "rgba(255,255,255,0.4)" }} onClick={handleLogout} title="Logout">
                <Icon name="logout" size={16} />
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="main">
          <div className="topbar">
            <div className="font-semi" style={{ fontSize: 15 }}>
              {navItems.find(n => n.id === state.activeModule)?.label}
            </div>
            <div className="flex items-center gap-3">
              <button className="btn btn-secondary btn-sm" onClick={loadStudentData}>
                <Icon name="refresh" size={14} /> Refresh
              </button>
              <div className="flex items-center gap-2" style={{ paddingLeft: 8, borderLeft: "1px solid var(--border)" }}>
                <Avatar name={state.currentUser.name} size={30} color="#e94560" />
                <div>
                  <div className="text-sm font-medium">{state.currentUser.name}</div>
                  <div className="text-xs text-muted2">{state.myData?.course || "Student"}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="content">
            {moduleComponents[state.activeModule] || <HomeModule />}
          </div>
        </main>

        {/* Toast */}
        {state.toast && (
          <div className="toast">
            <Icon name={state.toast.type === "success" ? "check" : "alert"} size={16} color={state.toast.type === "success" ? "#10b981" : "#ef4444"} />
            {state.toast.text}
          </div>
        )}
      </div>
    </StudentContext.Provider>
  );
}
