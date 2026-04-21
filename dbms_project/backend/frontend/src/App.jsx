// ============================================================
// HOSTEL MANAGEMENT SYSTEM — API Connected Version
// ============================================================

import { useState, useContext, createContext, useReducer, useEffect, useCallback } from "react";
import { api, getToken, setToken, setUser, getUser, removeToken, removeUser } from "./api";

// ─────────────────────────────────────────────
// DESIGN TOKENS & GLOBAL STYLES (unchanged)
// ─────────────────────────────────────────────
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --brand: #1a1a2e; --brand-mid: #16213e; --accent: #e94560;
    --accent2: #0f3460; --accent3: #533483; --gold: #f5a623;
    --teal: #00b4d8; --green: #06d6a0; --surface: #ffffff;
    --surface2: #f8f9fc; --surface3: #f1f3f9; --border: #e4e8f0;
    --text: #1a1a2e; --text2: #5a6482; --text3: #9aa0b8;
    --radius: 12px; --radius-lg: 16px;
    --shadow: 0 2px 12px rgba(26,26,46,0.08);
    --shadow-lg: 0 8px 32px rgba(26,26,46,0.14);
    font-family: 'DM Sans', sans-serif;
  }

  body { background: var(--surface2); color: var(--text); min-height: 100vh; }
  .font-display { font-family: 'Syne', sans-serif; }
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: var(--surface2); }
  ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }

  @keyframes slideIn { from { opacity:0; transform: translateY(8px); } to { opacity:1; transform: translateY(0); } }
  @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.5; } }
  @keyframes spin { to { transform: rotate(360deg); } }

  .animate-in { animation: slideIn 0.25s ease; }
  .animate-pulse { animation: pulse 2s infinite; }
  .spinner { animation: spin 0.7s linear infinite; }

  .layout { display: flex; min-height: 100vh; }
  .sidebar { width: 260px; min-width: 260px; background: var(--brand); display: flex; flex-direction: column; position: sticky; top: 0; height: 100vh; overflow-y: auto; }
  .main { flex: 1; overflow: hidden; display: flex; flex-direction: column; }
  .topbar { background: var(--surface); border-bottom: 1px solid var(--border); padding: 0 28px; height: 64px; display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; z-index: 10; }
  .content { flex: 1; padding: 28px; overflow-y: auto; }

  .sidebar-logo { padding: 20px 20px 16px; border-bottom: 1px solid rgba(255,255,255,0.08); }
  .nav-item { display: flex; align-items: center; gap: 12px; padding: 10px 20px; color: rgba(255,255,255,0.6); cursor: pointer; transition: all 0.2s; border-left: 3px solid transparent; font-size: 14px; font-weight: 500; user-select: none; }
  .nav-item:hover { color: #fff; background: rgba(255,255,255,0.06); }
  .nav-item.active { color: #fff; background: rgba(233,69,96,0.15); border-left-color: var(--accent); font-weight: 600; }
  .nav-section { padding: 16px 20px 8px; font-size: 10px; font-weight: 700; color: rgba(255,255,255,0.3); letter-spacing: 1.2px; text-transform: uppercase; }

  .card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 20px; box-shadow: var(--shadow); }
  .card-sm { padding: 16px; border-radius: var(--radius); }
  .stat-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 20px 24px; box-shadow: var(--shadow); position: relative; overflow: hidden; transition: transform 0.2s, box-shadow 0.2s; }
  .stat-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-lg); }
  .stat-card .accent-bar { position: absolute; top: 0; left: 0; right: 0; height: 3px; }

  .btn { display: inline-flex; align-items: center; gap: 6px; padding: 9px 18px; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.15s; border: none; font-family: 'DM Sans', sans-serif; white-space: nowrap; }
  .btn-primary { background: var(--accent); color: #fff; }
  .btn-primary:hover { background: #c73652; transform: translateY(-1px); }
  .btn-secondary { background: var(--surface); color: var(--text); border: 1px solid var(--border); }
  .btn-secondary:hover { background: var(--surface3); }
  .btn-ghost { background: transparent; color: var(--text2); }
  .btn-ghost:hover { background: var(--surface3); color: var(--text); }
  .btn-sm { padding: 6px 12px; font-size: 13px; }
  .btn-danger { background: #fee2e2; color: #dc2626; }
  .btn-danger:hover { background: #fecaca; }
  .btn-success { background: #d1fae5; color: #065f46; }
  .btn-success:hover { background: #a7f3d0; }
  .btn-icon { padding: 8px; border-radius: 8px; }
  .btn:disabled { opacity: 0.5; cursor: not-allowed; }

  .badge { display: inline-flex; align-items: center; padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; }
  .badge-green { background: #d1fae5; color: #065f46; }
  .badge-red { background: #fee2e2; color: #dc2626; }
  .badge-yellow { background: #fef3c7; color: #92400e; }
  .badge-blue { background: #dbeafe; color: #1e40af; }
  .badge-purple { background: #ede9fe; color: #5b21b6; }
  .badge-gray { background: var(--surface3); color: var(--text2); }
  .badge-orange { background: #ffedd5; color: #9a3412; }

  .form-group { margin-bottom: 16px; }
  .form-label { display: block; font-size: 13px; font-weight: 600; color: var(--text2); margin-bottom: 6px; }
  .form-input { width: 100%; padding: 10px 14px; border: 1.5px solid var(--border); border-radius: 8px; font-size: 14px; color: var(--text); background: var(--surface); transition: border-color 0.15s; font-family: 'DM Sans', sans-serif; outline: none; }
  .form-input:focus { border-color: var(--accent); }
  .form-select { width: 100%; padding: 10px 14px; border: 1.5px solid var(--border); border-radius: 8px; font-size: 14px; color: var(--text); background: var(--surface); cursor: pointer; outline: none; font-family: 'DM Sans', sans-serif; }
  .form-select:focus { border-color: var(--accent); }

  .table-wrap { overflow-x: auto; }
  table { width: 100%; border-collapse: collapse; font-size: 14px; }
  th { text-align: left; padding: 12px 16px; font-size: 12px; font-weight: 700; color: var(--text3); text-transform: uppercase; letter-spacing: 0.6px; background: var(--surface2); border-bottom: 1px solid var(--border); }
  td { padding: 13px 16px; border-bottom: 1px solid var(--border); color: var(--text); vertical-align: middle; }
  tr:last-child td { border-bottom: none; }
  tr:hover td { background: var(--surface2); }

  .modal-overlay { position: fixed; inset: 0; background: rgba(26,26,46,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; backdrop-filter: blur(2px); }
  .modal { background: var(--surface); border-radius: var(--radius-lg); width: 100%; max-width: 520px; max-height: 90vh; overflow-y: auto; box-shadow: var(--shadow-lg); animation: slideIn 0.2s ease; }
  .modal-header { padding: 20px 24px 0; display: flex; align-items: center; justify-content: space-between; }
  .modal-body { padding: 20px 24px; }
  .modal-footer { padding: 16px 24px; border-top: 1px solid var(--border); display: flex; justify-content: flex-end; gap: 10px; }

  .bar { height: 8px; background: var(--surface3); border-radius: 4px; overflow: hidden; }
  .bar-fill { height: 100%; border-radius: 4px; transition: width 0.8s ease; }

  .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
  .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; }
  .grid-4 { display: grid; grid-template-columns: repeat(4,1fr); gap: 20px; }
  @media(max-width:1200px) { .grid-4 { grid-template-columns: 1fr 1fr; } }
  @media(max-width:900px) { .grid-3,.grid-2 { grid-template-columns: 1fr; } }

  .tabs { display: flex; gap: 2px; background: var(--surface3); padding: 4px; border-radius: 10px; }
  .tab { flex: 1; padding: 8px 14px; border-radius: 7px; font-size: 13px; font-weight: 500; cursor: pointer; color: var(--text2); transition: all 0.15s; text-align: center; border: none; background: transparent; }
  .tab.active { background: var(--surface); color: var(--text); box-shadow: var(--shadow); }

  .search-bar { display: flex; align-items: center; gap: 8px; padding: 8px 14px; background: var(--surface2); border: 1.5px solid var(--border); border-radius: 8px; flex: 1; max-width: 320px; }
  .search-bar input { border: none; background: transparent; font-size: 14px; color: var(--text); outline: none; width: 100%; font-family: 'DM Sans', sans-serif; }

  .notif-dot { width: 8px; height: 8px; background: var(--accent); border-radius: 50%; position: absolute; top: 6px; right: 6px; }
  .empty-state { text-align: center; padding: 48px 24px; color: var(--text3); }
  .toast { position: fixed; bottom: 24px; right: 24px; z-index: 9999; background: var(--brand); color: #fff; padding: 12px 18px; border-radius: 10px; font-size: 14px; font-weight: 500; box-shadow: var(--shadow-lg); animation: slideIn 0.25s ease; display: flex; align-items: center; gap: 10px; min-width: 240px; }

  /* Login page */
  .login-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: var(--brand); }
  .login-card { background: var(--surface); border-radius: 20px; padding: 40px; width: 100%; max-width: 420px; box-shadow: var(--shadow-lg); }

  /* Loading */
  .loading-screen { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: var(--surface2); flex-direction: column; gap: 16px; }

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
  .mt-1 { margin-top: 4px; }
`;

// ─────────────────────────────────────────────
// ICONS
// ─────────────────────────────────────────────
const Icon = ({ name, size = 18, color = "currentColor", className = "" }) => {
  const icons = {
    home: <path d="M3 12L12 3l9 9M5 10v9h5v-5h4v5h5v-9"/>,
    bed: <><path d="M2 4v16M22 4v16M2 12h20M7 4v8M17 4v8"/><path d="M5 20h14"/></>,
    users: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></>,
    food: <><path d="M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8zM6 1v3M10 1v3M14 1v3"/></>,
    clean: <><path d="M3 3h18M3 3l4 18M21 3l-4 18M9 21h6"/><path d="M9 9h6M10 15h4"/></>,
    calendar: <><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93A10 10 0 0 0 4.93 19.07M4.93 4.93A10 10 0 0 0 19.07 19.07"/></>,
    bell: <><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"/></>,
    search: <><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></>,
    plus: <><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>,
    edit: <><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></>,
    trash: <><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></>,
    x: <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>,
    check: <polyline points="20 6 9 17 4 12"/>,
    logout: <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></>,
    dollar: <><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></>,
    alert: <><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></>,
    user: <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>,
    info: <><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></>,
    basketball: <><circle cx="12" cy="12" r="10"/><path d="M4.93 4.93a12 12 0 0 0 14.14 14.14M4.93 19.07A12 12 0 0 1 19.07 4.93"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="12" y1="2" x2="12" y2="22"/></>,
    clock: <><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>,
    refresh: <><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.49"/></>,
    key: <><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}
      strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"
      className={className} style={{ flexShrink: 0 }}>
      {icons[name] || icons.info}
    </svg>
  );
};

// ─────────────────────────────────────────────
// CONTEXT & REDUCER
// ─────────────────────────────────────────────
const AppContext = createContext(null);

const initialState = {
  currentUser: getUser() || null,
  activeModule: "dashboard",
  rooms: [], students: [], payments: [], events: [],
  meals: [], weeklyMenu: {}, cleaningRequests: [], sportsEquipment: [],
  notifications: [], toast: null, loading: {},
};

function reducer(state, action) {
  switch (action.type) {
    case "SET_USER": return { ...state, currentUser: action.payload };
    case "LOGOUT": return { ...state, currentUser: null };
    case "SET_MODULE": return { ...state, activeModule: action.payload };
    case "SET_LOADING": return { ...state, loading: { ...state.loading, [action.payload.key]: action.payload.value } };
    case "SET_ROOMS": return { ...state, rooms: action.payload };
    case "SET_STUDENTS": return { ...state, students: action.payload };
    case "SET_PAYMENTS": return { ...state, payments: action.payload };
    case "SET_EVENTS": return { ...state, events: action.payload };
    case "SET_MENU": return { ...state, weeklyMenu: action.payload };
    case "SET_MEALS": return { ...state, meals: action.payload };
    case "SET_CLEANING": return { ...state, cleaningRequests: action.payload };
    case "SET_SPORTS": return { ...state, sportsEquipment: action.payload };
    case "SHOW_TOAST": return { ...state, toast: action.payload };
    case "HIDE_TOAST": return { ...state, toast: null };
    default: return state;
  }
}

// ─────────────────────────────────────────────
// UTILITY COMPONENTS
// ─────────────────────────────────────────────
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

const StatCard = ({ label, value, icon, color, sub }) => (
  <div className="stat-card animate-in">
    <div className="accent-bar" style={{ background: color }} />
    <div className="flex items-center justify-between mb-3">
      <span className="text-sm text-muted font-medium">{label}</span>
      <div style={{ width: 38, height: 38, borderRadius: 10, background: color + "20", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon name={icon} size={18} color={color} />
      </div>
    </div>
    <div className="font-display" style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>{value}</div>
    {sub && <div className="text-xs text-muted2">{sub}</div>}
  </div>
);

const Avatar = ({ name = "?", size = 36, color = "#e94560" }) => {
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
    COMPLETED: "badge-green", Completed: "badge-green", Active: "badge-green",
    PENDING: "badge-yellow", Pending: "badge-yellow", IN_PROGRESS: "badge-blue", "In Progress": "badge-blue",
    UPCOMING: "badge-blue", Upcoming: "badge-blue", OVERDUE: "badge-red", Overdue: "badge-red",
    FULL: "badge-red", Full: "badge-red", MAINTENANCE: "badge-yellow", Maintenance: "badge-yellow",
    SINGLE: "badge-blue", Single: "badge-blue", DOUBLE: "badge-purple", Double: "badge-purple",
    SHARED: "badge-orange", Shared: "badge-orange",
    HIGH: "badge-red", High: "badge-red", MEDIUM: "badge-yellow", Medium: "badge-yellow",
    LOW: "badge-blue", Low: "badge-blue",
    CULTURAL: "badge-purple", Cultural: "badge-purple", SPORTS: "badge-green", Sports: "badge-green",
    MEETING: "badge-blue", Meeting: "badge-blue", GENERAL: "badge-gray", General: "badge-gray",
    MONTHLY: "badge-purple", Monthly: "badge-purple", DAILY: "badge-blue", Daily: "badge-blue",
    ONE_TIME: "badge-orange", "One-time": "badge-orange",
    Excellent: "badge-green", Good: "badge-purple", Fair: "badge-yellow", Poor: "badge-red",
  };
  return <span className={`badge ${map[status] || "badge-gray"}`}>{status?.replace(/_/g, " ")}</span>;
};

const SearchBar = ({ value, onChange, placeholder = "Search..." }) => (
  <div className="search-bar">
    <Icon name="search" size={15} color="var(--text3)" />
    <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
    {value && <button onClick={() => onChange("")} style={{ border: "none", background: "none", cursor: "pointer", color: "var(--text3)" }}>×</button>}
  </div>
);

const OccupancyBar = ({ occupied, capacity }) => {
  const pct = capacity > 0 ? Math.round((occupied / capacity) * 100) : 0;
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-muted">{occupied}/{capacity} beds</span>
        <span style={{ color: pct === 100 ? "#ef4444" : pct > 70 ? "#f59e0b" : "#10b981" }}>{pct}%</span>
      </div>
      <div className="bar"><div className="bar-fill" style={{ width: pct + "%", background: pct === 100 ? "#ef4444" : pct > 70 ? "#f59e0b" : "#10b981" }} /></div>
    </div>
  );
};

const LoadingSpinner = () => (
  <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
    <svg className="spinner" width={32} height={32} viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth={2}>
      <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="12" />
    </svg>
  </div>
);

// ─────────────────────────────────────────────
// LOGIN PAGE
// ─────────────────────────────────────────────
const LoginPage = ({ onLogin }) => {
  const [email, setEmail] = useState("admin@hostel.com");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setLoading(true); setError("");
    try {
      const res = await api.auth.login(email, password);
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
      <div className="login-card animate-in">
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🏠</div>
          <h1 className="font-display" style={{ fontSize: 28, fontWeight: 700, color: "var(--brand)", marginBottom: 4 }}>HostelPro</h1>
          <p className="text-muted text-sm">Management System v2.0</p>
        </div>
        {error && (
          <div style={{ background: "#fee2e2", color: "#dc2626", padding: "10px 14px", borderRadius: 8, marginBottom: 16, fontSize: 14 }}>
            {error}
          </div>
        )}
        <div className="form-group">
          <label className="form-label">Email</label>
          <input className="form-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@hostel.com" />
        </div>
        <div className="form-group">
          <label className="form-label">Password</label>
          <input className="form-input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter password" onKeyDown={e => e.key === "Enter" && handleLogin()} />
        </div>
        <button className="btn btn-primary w-full" style={{ width: "100%", justifyContent: "center", marginTop: 8 }} onClick={handleLogin} disabled={loading}>
          {loading ? "Signing in..." : "Sign In"}
        </button>
        <p className="text-xs text-muted2" style={{ textAlign: "center", marginTop: 16 }}>
          Use your registered admin credentials
        </p>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// DASHBOARD
// ─────────────────────────────────────────────
const Dashboard = () => {
  const { state, dispatch } = useContext(AppContext);
  const { rooms, students, payments, cleaningRequests, events } = state;

  const totalBeds = rooms.reduce((a, r) => a + (r.capacity || 0), 0);
  const occupiedBeds = rooms.reduce((a, r) => a + (r.occupied || 0), 0);
  const paidPayments = payments.filter(p => p.status === "PAID" || p.status === "Paid");
  const totalRevenue = paidPayments.reduce((a, p) => a + Number(p.amount), 0);
  const pendingClean = cleaningRequests.filter(c => c.status === "PENDING" || c.status === "Pending").length;
  const upcomingEvents = events.filter(e => e.status === "UPCOMING" || e.status === "Upcoming").length;

  return (
    <div className="animate-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display" style={{ fontSize: 26, fontWeight: 700, marginBottom: 4 }}>Dashboard</h1>
          <p className="text-muted text-sm">Welcome back, {state.currentUser?.name} • {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
        </div>
        <button className="btn btn-primary" onClick={() => dispatch({ type: "SET_MODULE", payload: "rooms" })}>
          <Icon name="plus" size={16} /> Manage Rooms
        </button>
      </div>

      <div className="grid-4 mb-6">
        <StatCard label="Total Students" value={students.length} icon="users" color="#e94560" sub={`${rooms.length} rooms total`} />
        <StatCard label="Room Occupancy" value={totalBeds > 0 ? `${Math.round((occupiedBeds/totalBeds)*100)}%` : "0%"} icon="bed" color="#0f3460" sub={`${occupiedBeds}/${totalBeds} beds filled`} />
        <StatCard label="Total Revenue" value={`₹${(totalRevenue/1000).toFixed(1)}K`} icon="dollar" color="#533483" sub={`${paidPayments.length} payments received`} />
        <StatCard label="Pending Cleaning" value={pendingClean} icon="clean" color="#f5a623" sub={`${upcomingEvents} upcoming events`} />
      </div>

      <div className="grid-2 mb-6" style={{ gridTemplateColumns: "2fr 1fr" }}>
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semi" style={{ fontSize: 15 }}>Room Occupancy Overview</h3>
            <button className="btn btn-secondary btn-sm" onClick={() => dispatch({ type: "SET_MODULE", payload: "rooms" })}>Manage Rooms</button>
          </div>
          {rooms.length === 0 ? (
            <div className="empty-state"><div className="icon">🏠</div><p>No rooms yet</p></div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {rooms.slice(0, 6).map(room => (
                <div key={room.id}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semi text-sm">Room {room.number}</span>
                    <Badge status={room.status} />
                  </div>
                  <OccupancyBar occupied={room.occupied || 0} capacity={room.capacity || 1} />
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="card">
            <h3 className="font-semi mb-3" style={{ fontSize: 14 }}>Recent Payments</h3>
            {payments.slice(0, 4).map(p => (
              <div key={p.id} className="flex items-center justify-between mb-2">
                <span className="text-sm">{p.student?.user?.name || "Student"}</span>
                <Badge status={p.status} />
              </div>
            ))}
            {payments.length === 0 && <p className="text-sm text-muted2">No payments yet</p>}
          </div>
          <div className="card">
            <h3 className="font-semi mb-3" style={{ fontSize: 14 }}>Upcoming Events</h3>
            {events.filter(e => e.status === "UPCOMING").slice(0, 3).map(e => (
              <div key={e.id} className="mb-2">
                <div className="text-sm font-medium">{e.title}</div>
                <div className="text-xs text-muted2">{new Date(e.date).toLocaleDateString()}</div>
              </div>
            ))}
            {events.filter(e => e.status === "UPCOMING").length === 0 && <p className="text-sm text-muted2">No upcoming events</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// ROOMS MODULE
// ─────────────────────────────────────────────
const RoomsModule = () => {
  const { state, dispatch } = useContext(AppContext);
  const { rooms } = state;
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ number: "", type: "SINGLE", floor: 1, capacity: 1, rent: "", amenities: "", status: "AVAILABLE" });

  const filtered = rooms.filter(r => r.number?.toLowerCase().includes(search.toLowerCase()) || r.type?.toLowerCase().includes(search.toLowerCase()));

  const openAdd = () => { setEditing(null); setForm({ number: "", type: "SINGLE", floor: 1, capacity: 1, rent: "", amenities: "", status: "AVAILABLE" }); setShowModal(true); };
  const openEdit = (r) => { setEditing(r); setForm({ number: r.number, type: r.type, floor: r.floor, capacity: r.capacity, rent: r.rent, amenities: typeof r.amenities === "string" ? r.amenities : r.amenities?.join(", ") || "", status: r.status }); setShowModal(true); };

  const handleSave = async () => {
    setLoading(true);
    try {
      const body = { ...form, floor: Number(form.floor), capacity: Number(form.capacity), rent: Number(form.rent) };
      if (editing) {
        const updated = await api.rooms.update(editing.id, body);
        dispatch({ type: "SET_ROOMS", payload: rooms.map(r => r.id === editing.id ? updated : r) });
      } else {
        const created = await api.rooms.create(body);
        dispatch({ type: "SET_ROOMS", payload: [...rooms, created] });
      }
      dispatch({ type: "SHOW_TOAST", payload: { text: editing ? "Room updated!" : "Room created!", type: "success" } });
      setShowModal(false);
    } catch (err) {
      dispatch({ type: "SHOW_TOAST", payload: { text: err.message, type: "error" } });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this room?")) return;
    try {
      await api.rooms.delete(id);
      dispatch({ type: "SET_ROOMS", payload: rooms.filter(r => r.id !== id) });
      dispatch({ type: "SHOW_TOAST", payload: { text: "Room deleted", type: "success" } });
    } catch (err) {
      dispatch({ type: "SHOW_TOAST", payload: { text: err.message, type: "error" } });
    }
  };

  return (
    <div className="animate-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display" style={{ fontSize: 26, fontWeight: 700 }}>Rooms</h1>
          <p className="text-muted text-sm">{rooms.length} rooms total</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}><Icon name="plus" size={16} /> Add Room</button>
      </div>

      <div className="card mb-4">
        <SearchBar value={search} onChange={setSearch} placeholder="Search rooms..." />
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Room</th><th>Type</th><th>Floor</th><th>Occupancy</th><th>Rent</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(room => (
                <tr key={room.id}>
                  <td><span className="font-semi">{room.number}</span></td>
                  <td><Badge status={room.type} /></td>
                  <td>Floor {room.floor}</td>
                  <td><OccupancyBar occupied={room.occupied || 0} capacity={room.capacity} /></td>
                  <td>₹{Number(room.rent).toLocaleString()}/mo</td>
                  <td><Badge status={room.status} /></td>
                  <td>
                    <div className="flex gap-2">
                      <button className="btn btn-ghost btn-icon btn-sm" onClick={() => openEdit(room)}><Icon name="edit" size={14} /></button>
                      <button className="btn btn-danger btn-icon btn-sm" onClick={() => handleDelete(room.id)}><Icon name="trash" size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={7} style={{ textAlign: "center", padding: 32, color: "var(--text3)" }}>No rooms found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editing ? "Edit Room" : "Add Room"}
        footer={<>
          <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={loading}>{loading ? "Saving..." : "Save"}</button>
        </>}>
        <div className="grid-2">
          <div className="form-group"><label className="form-label">Room Number</label><input className="form-input" value={form.number} onChange={e => setForm({ ...form, number: e.target.value })} placeholder="e.g. 101" /></div>
          <div className="form-group"><label className="form-label">Type</label>
            <select className="form-select" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
              <option value="SINGLE">Single</option><option value="DOUBLE">Double</option><option value="SHARED">Shared</option>
            </select>
          </div>
          <div className="form-group"><label className="form-label">Floor</label><input className="form-input" type="number" value={form.floor} onChange={e => setForm({ ...form, floor: e.target.value })} /></div>
          <div className="form-group"><label className="form-label">Capacity</label><input className="form-input" type="number" value={form.capacity} onChange={e => setForm({ ...form, capacity: e.target.value })} /></div>
          <div className="form-group"><label className="form-label">Rent (₹/month)</label><input className="form-input" type="number" value={form.rent} onChange={e => setForm({ ...form, rent: e.target.value })} /></div>
          <div className="form-group"><label className="form-label">Status</label>
            <select className="form-select" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
              <option value="AVAILABLE">Available</option><option value="FULL">Full</option><option value="MAINTENANCE">Maintenance</option>
            </select>
          </div>
        </div>
        <div className="form-group"><label className="form-label">Amenities (comma separated)</label><input className="form-input" value={form.amenities} onChange={e => setForm({ ...form, amenities: e.target.value })} placeholder="AC, WiFi, TV" /></div>
      </Modal>
    </div>
  );
};

// ─────────────────────────────────────────────
// STUDENTS MODULE
// ─────────────────────────────────────────────
const StudentsModule = () => {
  const { state, dispatch } = useContext(AppContext);
  const { students, rooms } = state;
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "", course: "", year: 1, joinDate: "", roomId: "" });

  const filtered = students.filter(s =>
    s.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.user?.email?.toLowerCase().includes(search.toLowerCase()) ||
    s.course?.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => { setEditing(null); setForm({ name: "", email: "", password: "", phone: "", course: "", year: 1, joinDate: new Date().toISOString().split("T")[0], roomId: "" }); setShowModal(true); };
  const openEdit = (s) => { setEditing(s); setForm({ name: s.user?.name || "", email: s.user?.email || "", password: "", phone: s.user?.phone || "", course: s.course || "", year: s.year || 1, joinDate: s.joinDate?.split("T")[0] || "", roomId: s.roomId || "" }); setShowModal(true); };

  const handleSave = async () => {
    setLoading(true);
    try {
      if (editing) {
        const updated = await api.students.update(editing.id, { name: form.name, phone: form.phone, course: form.course, year: Number(form.year), roomId: form.roomId ? Number(form.roomId) : null });
        dispatch({ type: "SET_STUDENTS", payload: students.map(s => s.id === editing.id ? updated : s) });
      } else {
        const created = await api.students.create({ ...form, year: Number(form.year), roomId: form.roomId ? Number(form.roomId) : null });
        dispatch({ type: "SET_STUDENTS", payload: [...students, created] });
      }
      dispatch({ type: "SHOW_TOAST", payload: { text: editing ? "Student updated!" : "Student added!", type: "success" } });
      setShowModal(false);
    } catch (err) {
      dispatch({ type: "SHOW_TOAST", payload: { text: err.message, type: "error" } });
    } finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this student?")) return;
    try {
      await api.students.delete(id);
      dispatch({ type: "SET_STUDENTS", payload: students.filter(s => s.id !== id) });
      dispatch({ type: "SHOW_TOAST", payload: { text: "Student deleted", type: "success" } });
    } catch (err) {
      dispatch({ type: "SHOW_TOAST", payload: { text: err.message, type: "error" } });
    }
  };

  return (
    <div className="animate-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display" style={{ fontSize: 26, fontWeight: 700 }}>Students</h1>
          <p className="text-muted text-sm">{students.length} students enrolled</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}><Icon name="plus" size={16} /> Add Student</button>
      </div>

      <div className="card mb-4"><SearchBar value={search} onChange={setSearch} placeholder="Search students..." /></div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead><tr><th>Name</th><th>Course</th><th>Year</th><th>Room</th><th>Phone</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.id}>
                  <td>
                    <div className="flex items-center gap-2">
                      <Avatar name={s.user?.name || "?"} size={32} />
                      <div><div className="font-semi text-sm">{s.user?.name}</div><div className="text-xs text-muted2">{s.user?.email}</div></div>
                    </div>
                  </td>
                  <td>{s.course}</td>
                  <td>Year {s.year}</td>
                  <td>{s.room ? `Room ${s.room.number}` : <span className="text-muted2">Unassigned</span>}</td>
                  <td>{s.user?.phone || "—"}</td>
                  <td>
                    <div className="flex gap-2">
                      <button className="btn btn-ghost btn-icon btn-sm" onClick={() => openEdit(s)}><Icon name="edit" size={14} /></button>
                      <button className="btn btn-danger btn-icon btn-sm" onClick={() => handleDelete(s.id)}><Icon name="trash" size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={6} style={{ textAlign: "center", padding: 32, color: "var(--text3)" }}>No students found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editing ? "Edit Student" : "Add Student"}
        footer={<>
          <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={loading}>{loading ? "Saving..." : "Save"}</button>
        </>}>
        <div className="grid-2">
          <div className="form-group"><label className="form-label">Full Name</label><input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
          <div className="form-group"><label className="form-label">Email</label><input className="form-input" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} disabled={!!editing} /></div>
          {!editing && <div className="form-group"><label className="form-label">Password</label><input className="form-input" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} /></div>}
          <div className="form-group"><label className="form-label">Phone</label><input className="form-input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
          <div className="form-group"><label className="form-label">Course</label><input className="form-input" value={form.course} onChange={e => setForm({ ...form, course: e.target.value })} /></div>
          <div className="form-group"><label className="form-label">Year</label><input className="form-input" type="number" min={1} max={6} value={form.year} onChange={e => setForm({ ...form, year: e.target.value })} /></div>
          <div className="form-group"><label className="form-label">Join Date</label><input className="form-input" type="date" value={form.joinDate} onChange={e => setForm({ ...form, joinDate: e.target.value })} /></div>
          <div className="form-group"><label className="form-label">Room</label>
            <select className="form-select" value={form.roomId} onChange={e => setForm({ ...form, roomId: e.target.value })}>
              <option value="">No Room</option>
              {rooms.filter(r => r.status !== "FULL" || r.id === editing?.roomId).map(r => <option key={r.id} value={r.id}>Room {r.number} ({r.type})</option>)}
            </select>
          </div>
        </div>
      </Modal>
    </div>
  );
};

// ─────────────────────────────────────────────
// PAYMENTS MODULE
// ─────────────────────────────────────────────
const PaymentsModule = () => {
  const { state, dispatch } = useContext(AppContext);
  const { payments, students } = state;
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ studentId: "", amount: "", type: "MONTHLY", dueDate: "", notes: "" });

  const filtered = payments.filter(p =>
    p.student?.user?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const handleMarkPaid = async (payment) => {
    try {
      const updated = await api.payments.update(payment.id, { status: "PAID", paidDate: new Date().toISOString(), paymentMethod: "Manual" });
      dispatch({ type: "SET_PAYMENTS", payload: payments.map(p => p.id === payment.id ? { ...p, ...updated } : p) });
      dispatch({ type: "SHOW_TOAST", payload: { text: "Payment marked as paid!", type: "success" } });
    } catch (err) {
      dispatch({ type: "SHOW_TOAST", payload: { text: err.message, type: "error" } });
    }
  };

  const handleCreate = async () => {
    setLoading(true);
    try {
      const created = await api.payments.create({ ...form, studentId: Number(form.studentId), amount: Number(form.amount) });
      dispatch({ type: "SET_PAYMENTS", payload: [...payments, created] });
      dispatch({ type: "SHOW_TOAST", payload: { text: "Payment created!", type: "success" } });
      setShowModal(false);
    } catch (err) {
      dispatch({ type: "SHOW_TOAST", payload: { text: err.message, type: "error" } });
    } finally { setLoading(false); }
  };

  const totalPaid = payments.filter(p => p.status === "PAID").reduce((a, p) => a + Number(p.amount), 0);
  const totalPending = payments.filter(p => p.status === "PENDING" || p.status === "OVERDUE").reduce((a, p) => a + Number(p.amount), 0);

  return (
    <div className="animate-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display" style={{ fontSize: 26, fontWeight: 700 }}>Payments</h1>
          <p className="text-muted text-sm">{payments.length} total records</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}><Icon name="plus" size={16} /> Add Payment</button>
      </div>

      <div className="grid-3 mb-6">
        <StatCard label="Total Collected" value={`₹${(totalPaid/1000).toFixed(1)}K`} icon="dollar" color="#06d6a0" sub={`${payments.filter(p=>p.status==="PAID").length} paid`} />
        <StatCard label="Pending Amount" value={`₹${(totalPending/1000).toFixed(1)}K`} icon="clock" color="#f5a623" sub={`${payments.filter(p=>p.status==="PENDING").length} pending`} />
        <StatCard label="Overdue" value={payments.filter(p=>p.status==="OVERDUE").length} icon="alert" color="#e94560" sub="Need attention" />
      </div>

      <div className="card mb-4"><SearchBar value={search} onChange={setSearch} placeholder="Search by student name..." /></div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead><tr><th>Student</th><th>Amount</th><th>Type</th><th>Due Date</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id}>
                  <td><span className="font-semi">{p.student?.user?.name || "—"}</span></td>
                  <td>₹{Number(p.amount).toLocaleString()}</td>
                  <td><Badge status={p.type} /></td>
                  <td>{new Date(p.dueDate).toLocaleDateString()}</td>
                  <td><Badge status={p.status} /></td>
                  <td>
                    {(p.status === "PENDING" || p.status === "OVERDUE") && (
                      <button className="btn btn-success btn-sm" onClick={() => handleMarkPaid(p)}>Mark Paid</button>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={6} style={{ textAlign: "center", padding: 32, color: "var(--text3)" }}>No payments found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Add Payment"
        footer={<>
          <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={handleCreate} disabled={loading}>{loading ? "Saving..." : "Save"}</button>
        </>}>
        <div className="form-group"><label className="form-label">Student</label>
          <select className="form-select" value={form.studentId} onChange={e => setForm({ ...form, studentId: e.target.value })}>
            <option value="">Select student</option>
            {students.map(s => <option key={s.id} value={s.id}>{s.user?.name}</option>)}
          </select>
        </div>
        <div className="grid-2">
          <div className="form-group"><label className="form-label">Amount (₹)</label><input className="form-input" type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} /></div>
          <div className="form-group"><label className="form-label">Type</label>
            <select className="form-select" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
              <option value="MONTHLY">Monthly</option><option value="SEMESTER">Semester</option><option value="ONE_TIME">One Time</option>
            </select>
          </div>
          <div className="form-group"><label className="form-label">Due Date</label><input className="form-input" type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} /></div>
        </div>
        <div className="form-group"><label className="form-label">Notes</label><input className="form-input" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Optional notes" /></div>
      </Modal>
    </div>
  );
};

// ─────────────────────────────────────────────
// EVENTS MODULE
// ─────────────────────────────────────────────
const EventsModule = () => {
  const { state, dispatch } = useContext(AppContext);
  const { events } = state;
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", date: "", category: "GENERAL", organizer: "" });

  const handleCreate = async () => {
    setLoading(true);
    try {
      const created = await api.events.create(form);
      dispatch({ type: "SET_EVENTS", payload: [...events, created] });
      dispatch({ type: "SHOW_TOAST", payload: { text: "Event created!", type: "success" } });
      setShowModal(false);
    } catch (err) {
      dispatch({ type: "SHOW_TOAST", payload: { text: err.message, type: "error" } });
    } finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this event?")) return;
    try {
      await api.events.delete(id);
      dispatch({ type: "SET_EVENTS", payload: events.filter(e => e.id !== id) });
      dispatch({ type: "SHOW_TOAST", payload: { text: "Event deleted", type: "success" } });
    } catch (err) {
      dispatch({ type: "SHOW_TOAST", payload: { text: err.message, type: "error" } });
    }
  };

  return (
    <div className="animate-in">
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="font-display" style={{ fontSize: 26, fontWeight: 700 }}>Events</h1><p className="text-muted text-sm">{events.length} events</p></div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}><Icon name="plus" size={16} /> Add Event</button>
      </div>

      <div className="grid-3">
        {events.map(e => (
          <div key={e.id} className="card animate-in">
            <div className="flex items-center justify-between mb-3">
              <Badge status={e.category} />
              <Badge status={e.status} />
            </div>
            <h3 className="font-semi mb-1">{e.title}</h3>
            <p className="text-sm text-muted2 mb-3">{e.description}</p>
            <div className="flex items-center gap-2 text-xs text-muted2 mb-3">
              <Icon name="calendar" size={13} />
              {new Date(e.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted2 mb-4">
              <Icon name="user" size={13} />{e.organizer}
            </div>
            <div className="flex gap-2">
              <button className="btn btn-danger btn-sm" onClick={() => handleDelete(e.id)}>Delete</button>
            </div>
          </div>
        ))}
        {events.length === 0 && <div className="empty-state" style={{ gridColumn: "1/-1" }}><div className="icon">📅</div><p>No events yet</p></div>}
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Add Event"
        footer={<>
          <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={handleCreate} disabled={loading}>{loading ? "Saving..." : "Save"}</button>
        </>}>
        <div className="form-group"><label className="form-label">Title</label><input className="form-input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
        <div className="form-group"><label className="form-label">Description</label><textarea className="form-input" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} style={{ resize: "vertical" }} /></div>
        <div className="grid-2">
          <div className="form-group"><label className="form-label">Date</label><input className="form-input" type="datetime-local" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></div>
          <div className="form-group"><label className="form-label">Category</label>
            <select className="form-select" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
              <option value="CULTURAL">Cultural</option><option value="SPORTS">Sports</option><option value="MEETING">Meeting</option><option value="GENERAL">General</option>
            </select>
          </div>
        </div>
        <div className="form-group"><label className="form-label">Organizer</label><input className="form-input" value={form.organizer} onChange={e => setForm({ ...form, organizer: e.target.value })} /></div>
      </Modal>
    </div>
  );
};

// ─────────────────────────────────────────────
// FOOD MODULE
// ─────────────────────────────────────────────
const FoodModule = () => {
  const { state, dispatch } = useContext(AppContext);
  const { weeklyMenu, meals } = state;
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const [activeDay, setActiveDay] = useState("Monday");
  const [editing, setEditing] = useState(false);
  const [menuForm, setMenuForm] = useState({ breakfast: "", lunch: "", dinner: "" });

  const dayMenu = weeklyMenu[activeDay] || {};

  const handleEditDay = () => { setMenuForm({ breakfast: dayMenu.breakfast || "", lunch: dayMenu.lunch || "", dinner: dayMenu.dinner || "" }); setEditing(true); };

  const handleSaveMenu = async () => {
    try {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
      await api.food.updateMenu({ day: activeDay, weekStart: weekStart.toISOString(), ...menuForm });
      dispatch({ type: "SET_MENU", payload: { ...weeklyMenu, [activeDay]: menuForm } });
      dispatch({ type: "SHOW_TOAST", payload: { text: "Menu updated!", type: "success" } });
      setEditing(false);
    } catch (err) {
      dispatch({ type: "SHOW_TOAST", payload: { text: err.message, type: "error" } });
    }
  };

  return (
    <div className="animate-in">
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="font-display" style={{ fontSize: 26, fontWeight: 700 }}>Food & Mess</h1><p className="text-muted text-sm">Weekly menu & subscriptions</p></div>
      </div>

      <div className="card mb-6">
        <h3 className="font-semi mb-4">Weekly Menu</h3>
        <div className="tabs mb-4" style={{ overflowX: "auto" }}>
          {days.map(d => <button key={d} className={`tab ${activeDay === d ? "active" : ""}`} onClick={() => setActiveDay(d)}>{d.slice(0, 3)}</button>)}
        </div>
        {editing ? (
          <div>
            <div className="form-group"><label className="form-label">Breakfast</label><input className="form-input" value={menuForm.breakfast} onChange={e => setMenuForm({ ...menuForm, breakfast: e.target.value })} /></div>
            <div className="form-group"><label className="form-label">Lunch</label><input className="form-input" value={menuForm.lunch} onChange={e => setMenuForm({ ...menuForm, lunch: e.target.value })} /></div>
            <div className="form-group"><label className="form-label">Dinner</label><input className="form-input" value={menuForm.dinner} onChange={e => setMenuForm({ ...menuForm, dinner: e.target.value })} /></div>
            <div className="flex gap-2">
              <button className="btn btn-primary" onClick={handleSaveMenu}>Save</button>
              <button className="btn btn-secondary" onClick={() => setEditing(false)}>Cancel</button>
            </div>
          </div>
        ) : (
          <div>
            {["breakfast", "lunch", "dinner"].map(meal => (
              <div key={meal} className="flex items-center justify-between mb-3" style={{ padding: "12px 16px", background: "var(--surface2)", borderRadius: 8 }}>
                <div>
                  <div className="text-xs text-muted2 mb-1" style={{ textTransform: "capitalize" }}>{meal}</div>
                  <div className="font-medium text-sm">{dayMenu[meal] || <span className="text-muted2">Not set</span>}</div>
                </div>
              </div>
            ))}
            <button className="btn btn-secondary btn-sm mt-2" onClick={handleEditDay}><Icon name="edit" size={13} /> Edit {activeDay}</button>
          </div>
        )}
      </div>

      <div className="card">
        <h3 className="font-semi mb-4">Meal Subscriptions</h3>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Student</th><th>Plan</th><th>Amount</th><th>Status</th></tr></thead>
            <tbody>
              {meals.map(m => (
                <tr key={m.id}>
                  <td>{m.student?.user?.name || "—"}</td>
                  <td><Badge status={m.plan} /></td>
                  <td>₹{Number(m.amount).toLocaleString()}</td>
                  <td><Badge status={m.isActive ? "Active" : "Inactive"} /></td>
                </tr>
              ))}
              {meals.length === 0 && <tr><td colSpan={4} style={{ textAlign: "center", padding: 32, color: "var(--text3)" }}>No subscriptions yet</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// CLEANING MODULE
// ─────────────────────────────────────────────
const CleaningModule = () => {
  const { state, dispatch } = useContext(AppContext);
  const { cleaningRequests, students } = state;
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ studentId: "", roomNumber: "", type: "REGULAR", priority: "MEDIUM", notes: "" });

  const handleCreate = async () => {
    setLoading(true);
    try {
      const created = await api.cleaning.create({ ...form, studentId: Number(form.studentId) });
      dispatch({ type: "SET_CLEANING", payload: [...cleaningRequests, created] });
      dispatch({ type: "SHOW_TOAST", payload: { text: "Request created!", type: "success" } });
      setShowModal(false);
    } catch (err) {
      dispatch({ type: "SHOW_TOAST", payload: { text: err.message, type: "error" } });
    } finally { setLoading(false); }
  };

  const handleUpdateStatus = async (req, status) => {
    try {
      const updated = await api.cleaning.update(req.id, { status, completedAt: status === "COMPLETED" ? new Date().toISOString() : null });
      dispatch({ type: "SET_CLEANING", payload: cleaningRequests.map(c => c.id === req.id ? { ...c, ...updated } : c) });
      dispatch({ type: "SHOW_TOAST", payload: { text: "Status updated!", type: "success" } });
    } catch (err) {
      dispatch({ type: "SHOW_TOAST", payload: { text: err.message, type: "error" } });
    }
  };

  return (
    <div className="animate-in">
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="font-display" style={{ fontSize: 26, fontWeight: 700 }}>Cleaning</h1><p className="text-muted text-sm">{cleaningRequests.length} requests</p></div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}><Icon name="plus" size={16} /> New Request</button>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead><tr><th>Student</th><th>Room</th><th>Type</th><th>Priority</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {cleaningRequests.map(req => (
                <tr key={req.id}>
                  <td>{req.student?.user?.name || "—"}</td>
                  <td>Room {req.roomNumber}</td>
                  <td><Badge status={req.type?.replace(/_/g, " ")} /></td>
                  <td><Badge status={req.priority} /></td>
                  <td><Badge status={req.status?.replace(/_/g, " ")} /></td>
                  <td>
                    <div className="flex gap-2">
                      {req.status === "PENDING" && <button className="btn btn-secondary btn-sm" onClick={() => handleUpdateStatus(req, "IN_PROGRESS")}>Start</button>}
                      {req.status === "IN_PROGRESS" && <button className="btn btn-success btn-sm" onClick={() => handleUpdateStatus(req, "COMPLETED")}>Complete</button>}
                    </div>
                  </td>
                </tr>
              ))}
              {cleaningRequests.length === 0 && <tr><td colSpan={6} style={{ textAlign: "center", padding: 32, color: "var(--text3)" }}>No requests yet</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="New Cleaning Request"
        footer={<>
          <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={handleCreate} disabled={loading}>{loading ? "Saving..." : "Submit"}</button>
        </>}>
        <div className="form-group"><label className="form-label">Student</label>
          <select className="form-select" value={form.studentId} onChange={e => setForm({ ...form, studentId: e.target.value })}>
            <option value="">Select student</option>
            {students.map(s => <option key={s.id} value={s.id}>{s.user?.name}</option>)}
          </select>
        </div>
        <div className="grid-2">
          <div className="form-group"><label className="form-label">Room Number</label><input className="form-input" value={form.roomNumber} onChange={e => setForm({ ...form, roomNumber: e.target.value })} placeholder="e.g. 101" /></div>
          <div className="form-group"><label className="form-label">Type</label>
            <select className="form-select" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
              <option value="REGULAR">Regular</option><option value="DEEP_CLEAN">Deep Clean</option><option value="BATHROOM">Bathroom</option><option value="WINDOW">Window</option>
            </select>
          </div>
          <div className="form-group"><label className="form-label">Priority</label>
            <select className="form-select" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
              <option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option>
            </select>
          </div>
        </div>
        <div className="form-group"><label className="form-label">Notes</label><input className="form-input" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Optional notes" /></div>
      </Modal>
    </div>
  );
};

// ─────────────────────────────────────────────
// SPORTS MODULE
// ─────────────────────────────────────────────
const SportsModule = () => {
  const { state, dispatch } = useContext(AppContext);
  const { sportsEquipment, students } = state;
  const [showAddModal, setShowAddModal] = useState(false);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [selectedEquip, setSelectedEquip] = useState(null);
  const [loading, setLoading] = useState(false);
  const [addForm, setAddForm] = useState({ name: "", total: 1, condition: "Good" });
  const [issueForm, setIssueForm] = useState({ studentId: "" });

  const handleAddEquipment = async () => {
    setLoading(true);
    try {
      const created = await api.sports.create({ ...addForm, total: Number(addForm.total) });
      dispatch({ type: "SET_SPORTS", payload: [...sportsEquipment, created] });
      dispatch({ type: "SHOW_TOAST", payload: { text: "Equipment added!", type: "success" } });
      setShowAddModal(false);
    } catch (err) {
      dispatch({ type: "SHOW_TOAST", payload: { text: err.message, type: "error" } });
    } finally { setLoading(false); }
  };

  const handleIssue = async () => {
    setLoading(true);
    try {
      await api.sports.issue({ equipmentId: selectedEquip.id, studentId: Number(issueForm.studentId) });
      const updated = await api.sports.getAll();
      dispatch({ type: "SET_SPORTS", payload: updated });
      dispatch({ type: "SHOW_TOAST", payload: { text: "Equipment issued!", type: "success" } });
      setShowIssueModal(false);
    } catch (err) {
      dispatch({ type: "SHOW_TOAST", payload: { text: err.message, type: "error" } });
    } finally { setLoading(false); }
  };

  const handleReturn = async (equip) => {
    const activeIssue = equip.issues?.find(i => !i.returnedAt);
    if (!activeIssue) return;
    try {
      await api.sports.return(activeIssue.id);
      const updated = await api.sports.getAll();
      dispatch({ type: "SET_SPORTS", payload: updated });
      dispatch({ type: "SHOW_TOAST", payload: { text: "Equipment returned!", type: "success" } });
    } catch (err) {
      dispatch({ type: "SHOW_TOAST", payload: { text: err.message, type: "error" } });
    }
  };

  return (
    <div className="animate-in">
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="font-display" style={{ fontSize: 26, fontWeight: 700 }}>Sports Equipment</h1><p className="text-muted text-sm">{sportsEquipment.length} items</p></div>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}><Icon name="plus" size={16} /> Add Equipment</button>
      </div>

      <div className="grid-3">
        {sportsEquipment.map(equip => {
          const issuedCount = equip.issues?.filter(i => !i.returnedAt).length || 0;
          const pct = equip.total > 0 ? Math.round((equip.available / equip.total) * 100) : 0;
          return (
            <div key={equip.id} className="card animate-in">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semi">{equip.name}</h3>
                <Badge status={equip.condition} />
              </div>
              <div className="grid-2 mb-3">
                <div style={{ textAlign: "center", padding: "12px", background: "var(--surface2)", borderRadius: 8 }}>
                  <div className="font-display" style={{ fontSize: 22, fontWeight: 700 }}>{equip.total}</div>
                  <div className="text-xs text-muted2">Total</div>
                </div>
                <div style={{ textAlign: "center", padding: "12px", background: "var(--surface2)", borderRadius: 8 }}>
                  <div className="font-display" style={{ fontSize: 22, fontWeight: 700, color: "#10b981" }}>{equip.available}</div>
                  <div className="text-xs text-muted2">Available</div>
                </div>
              </div>
              <div className="bar mb-3"><div className="bar-fill" style={{ width: pct + "%", background: pct > 50 ? "#10b981" : pct > 20 ? "#f59e0b" : "#ef4444" }} /></div>
              {issuedCount > 0 && (
                <div className="text-xs text-muted2 mb-3">Issued to {issuedCount} student(s)</div>
              )}
              <div className="flex gap-2">
                <button className="btn btn-primary btn-sm" disabled={equip.available === 0} onClick={() => { setSelectedEquip(equip); setIssueForm({ studentId: "" }); setShowIssueModal(true); }}>Issue</button>
                <button className="btn btn-secondary btn-sm" disabled={issuedCount === 0} onClick={() => handleReturn(equip)}>Return</button>
              </div>
            </div>
          );
        })}
        {sportsEquipment.length === 0 && <div className="empty-state" style={{ gridColumn: "1/-1" }}><div className="icon">🏀</div><p>No equipment yet</p></div>}
      </div>

      <Modal open={showAddModal} onClose={() => setShowAddModal(false)} title="Add Equipment"
        footer={<>
          <button className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={handleAddEquipment} disabled={loading}>{loading ? "Saving..." : "Add"}</button>
        </>}>
        <div className="form-group"><label className="form-label">Name</label><input className="form-input" value={addForm.name} onChange={e => setAddForm({ ...addForm, name: e.target.value })} placeholder="e.g. Basketball" /></div>
        <div className="grid-2">
          <div className="form-group"><label className="form-label">Total Quantity</label><input className="form-input" type="number" value={addForm.total} onChange={e => setAddForm({ ...addForm, total: e.target.value })} /></div>
          <div className="form-group"><label className="form-label">Condition</label>
            <select className="form-select" value={addForm.condition} onChange={e => setAddForm({ ...addForm, condition: e.target.value })}>
              <option>Excellent</option><option>Good</option><option>Fair</option><option>Poor</option>
            </select>
          </div>
        </div>
      </Modal>

      <Modal open={showIssueModal} onClose={() => setShowIssueModal(false)} title={`Issue ${selectedEquip?.name}`}
        footer={<>
          <button className="btn btn-secondary" onClick={() => setShowIssueModal(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={handleIssue} disabled={loading || !issueForm.studentId}>{loading ? "Issuing..." : "Issue"}</button>
        </>}>
        <div className="form-group"><label className="form-label">Select Student</label>
          <select className="form-select" value={issueForm.studentId} onChange={e => setIssueForm({ studentId: e.target.value })}>
            <option value="">Choose student</option>
            {students.map(s => <option key={s.id} value={s.id}>{s.user?.name}</option>)}
          </select>
        </div>
      </Modal>
    </div>
  );
};

// ─────────────────────────────────────────────
// ADMIN MODULE
// ─────────────────────────────────────────────
const AdminModule = () => {
  const { state } = useContext(AppContext);
  const { rooms, students, payments, events, cleaningRequests, sportsEquipment } = state;

  const stats = [
    { label: "Total Rooms", value: rooms.length, icon: "bed", color: "#0f3460" },
    { label: "Total Students", value: students.length, icon: "users", color: "#e94560" },
    { label: "Total Payments", value: payments.length, icon: "dollar", color: "#533483" },
    { label: "Total Events", value: events.length, icon: "calendar", color: "#f5a623" },
    { label: "Cleaning Requests", value: cleaningRequests.length, icon: "clean", color: "#06d6a0" },
    { label: "Sports Items", value: sportsEquipment.length, icon: "basketball", color: "#00b4d8" },
  ];

  return (
    <div className="animate-in">
      <div className="mb-6">
        <h1 className="font-display" style={{ fontSize: 26, fontWeight: 700 }}>Admin Panel</h1>
        <p className="text-muted text-sm">System overview & statistics</p>
      </div>

      <div className="grid-3 mb-6">
        {stats.map(s => <StatCard key={s.label} {...s} sub="Total records in database" />)}
      </div>

      <div className="card">
        <h3 className="font-semi mb-4">System Info</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[
            { label: "Backend URL", value: "http://localhost:5000" },
            { label: "Database", value: "MySQL via Prisma" },
            { label: "Auth", value: "JWT Bearer Token" },
            { label: "Current User", value: state.currentUser?.name + " (" + state.currentUser?.role + ")" },
            { label: "Logged In", value: "Yes ✅" },
          ].map(item => (
            <div key={item.label} className="flex items-center justify-between" style={{ padding: "10px 16px", background: "var(--surface2)", borderRadius: 8 }}>
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
// NOTIFICATIONS PANEL
// ─────────────────────────────────────────────
const NotificationsPanel = ({ onClose }) => {
  const { state, payments } = useContext(AppContext);
  const overdue = state.payments?.filter(p => p.status === "OVERDUE") || [];
  const pendingClean = state.cleaningRequests?.filter(c => c.status === "PENDING") || [];

  const notifications = [
    ...overdue.map(p => ({ id: `pay-${p.id}`, text: `${p.student?.user?.name}'s payment is overdue`, type: "alert" })),
    ...pendingClean.map(c => ({ id: `clean-${c.id}`, text: `Cleaning request for Room ${c.roomNumber} is pending`, type: "info" })),
  ];

  return (
    <div style={{ position: "absolute", top: "64px", right: "16px", width: 320, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-lg)", zIndex: 100, overflow: "hidden" }}>
      <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span className="font-semi">Notifications ({notifications.length})</span>
        <button className="btn btn-ghost btn-icon btn-sm" onClick={onClose}><Icon name="x" size={16} /></button>
      </div>
      {notifications.length === 0 ? (
        <div style={{ padding: 24, textAlign: "center", color: "var(--text3)" }}>All caught up! ✅</div>
      ) : notifications.map(n => (
        <div key={n.id} style={{ padding: "12px 18px", borderBottom: "1px solid var(--border)", display: "flex", gap: 10 }}>
          <Icon name={n.type === "alert" ? "alert" : "info"} size={15} color={n.type === "alert" ? "#ef4444" : "#3b82f6"} />
          <div className="text-sm">{n.text}</div>
        </div>
      ))}
    </div>
  );
};

// ─────────────────────────────────────────────
// MAIN APP
// ─────────────────────────────────────────────
const navItems = [
  { id: "dashboard", label: "Dashboard", icon: "home" },
  { id: "rooms", label: "Rooms", icon: "bed" },
  { id: "students", label: "Students", icon: "users" },
  { id: "payments", label: "Payments", icon: "dollar" },
  { id: "events", label: "Events", icon: "calendar" },
  { id: "food", label: "Food & Mess", icon: "food" },
  { id: "cleaning", label: "Cleaning", icon: "clean" },
  { id: "sports", label: "Sports", icon: "basketball" },
  { id: "admin", label: "Admin Panel", icon: "settings" },
];

export default function App() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [showNotif, setShowNotif] = useState(false);
  const [appLoading, setAppLoading] = useState(true);

  // Load all data on login
  const loadAll = useCallback(async () => {
    if (!getToken()) { setAppLoading(false); return; }
    try {
      const [rooms, students, payments, events, cleaning, sports, meals, menu] = await Promise.allSettled([
        api.rooms.getAll(),
        api.students.getAll(),
        api.payments.getAll(),
        api.events.getAll(),
        api.cleaning.getAll(),
        api.sports.getAll(),
        api.food.getSubscriptions(),
        api.food.getMenu(),
      ]);
      if (rooms.status === "fulfilled") dispatch({ type: "SET_ROOMS", payload: rooms.value });
      if (students.status === "fulfilled") dispatch({ type: "SET_STUDENTS", payload: students.value });
      if (payments.status === "fulfilled") dispatch({ type: "SET_PAYMENTS", payload: payments.value });
      if (events.status === "fulfilled") dispatch({ type: "SET_EVENTS", payload: events.value });
      if (cleaning.status === "fulfilled") dispatch({ type: "SET_CLEANING", payload: cleaning.value });
      if (sports.status === "fulfilled") dispatch({ type: "SET_SPORTS", payload: sports.value });
      if (meals.status === "fulfilled") dispatch({ type: "SET_MEALS", payload: meals.value });
      if (menu.status === "fulfilled") {
        const menuObj = {};
        menu.value.forEach(m => { menuObj[m.day] = { breakfast: m.breakfast, lunch: m.lunch, dinner: m.dinner }; });
        dispatch({ type: "SET_MENU", payload: menuObj });
      }
    } catch (err) {
      console.error("Load error:", err);
    } finally {
      setAppLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  // Toast auto-hide
  useEffect(() => {
    if (state.toast) {
      const t = setTimeout(() => dispatch({ type: "HIDE_TOAST" }), 3000);
      return () => clearTimeout(t);
    }
  }, [state.toast]);

  const handleLogin = (user) => {
    dispatch({ type: "SET_USER", payload: user });
    loadAll();
  };

  const handleLogout = () => {
    removeToken(); removeUser();
    dispatch({ type: "LOGOUT" });
  };

  const moduleComponents = {
    dashboard: <Dashboard />,
    rooms: <RoomsModule />,
    students: <StudentsModule />,
    payments: <PaymentsModule />,
    events: <EventsModule />,
    food: <FoodModule />,
    cleaning: <CleaningModule />,
    sports: <SportsModule />,
    admin: <AdminModule />,
  };

  const overdueCount = state.payments.filter(p => p.status === "OVERDUE").length;
  const pendingCleanCount = state.cleaningRequests.filter(c => c.status === "PENDING").length;
  const notifCount = overdueCount + pendingCleanCount;

  if (appLoading) {
    return (
      <>
        <style>{STYLES}</style>
        <div className="loading-screen">
          <div style={{ fontSize: 40 }}>🏠</div>
          <div className="font-display" style={{ fontSize: 22, fontWeight: 700 }}>HostelPro</div>
          <svg className="spinner" width={32} height={32} viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth={2}>
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
    <AppContext.Provider value={{ state, dispatch }}>
      <style>{STYLES}</style>
      <div className="layout">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="sidebar-logo">
            <div className="font-display" style={{ fontSize: 20, fontWeight: 700, color: "#fff", marginBottom: 2 }}>🏠 HostelPro</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>Management System v2.0</div>
          </div>

          <div style={{ padding: "12px 0", flex: 1 }}>
            <div className="nav-section">Main</div>
            {navItems.slice(0, 4).map(item => (
              <div key={item.id} className={`nav-item ${state.activeModule === item.id ? "active" : ""}`}
                onClick={() => dispatch({ type: "SET_MODULE", payload: item.id })}>
                <Icon name={item.icon} size={17} />
                <span>{item.label}</span>
                {item.id === "payments" && overdueCount > 0 && (
                  <span style={{ marginLeft: "auto", background: "#e94560", color: "#fff", borderRadius: 10, padding: "1px 7px", fontSize: 11, fontWeight: 700 }}>{overdueCount}</span>
                )}
              </div>
            ))}

            <div className="nav-section">Modules</div>
            {navItems.slice(4, 8).map(item => (
              <div key={item.id} className={`nav-item ${state.activeModule === item.id ? "active" : ""}`}
                onClick={() => dispatch({ type: "SET_MODULE", payload: item.id })}>
                <Icon name={item.icon} size={17} />
                <span>{item.label}</span>
              </div>
            ))}

            <div className="nav-section">Admin</div>
            {navItems.slice(8).map(item => (
              <div key={item.id} className={`nav-item ${state.activeModule === item.id ? "active" : ""}`}
                onClick={() => dispatch({ type: "SET_MODULE", payload: item.id })}>
                <Icon name={item.icon} size={17} />
                <span>{item.label}</span>
              </div>
            ))}
          </div>

          <div style={{ padding: "12px 16px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
            <div className="flex items-center gap-2">
              <Avatar name={state.currentUser.name} size={36} color="#e94560" />
              <div style={{ flex: 1, overflow: "hidden" }}>
                <div className="text-sm font-semi truncate" style={{ color: "#fff" }}>{state.currentUser.name}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{state.currentUser.role}</div>
              </div>
              <button className="btn btn-ghost btn-icon" style={{ color: "rgba(255,255,255,0.4)" }} onClick={handleLogout} title="Logout">
                <Icon name="logout" size={16} />
              </button>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="main">
          <div className="topbar">
            <div className="flex items-center gap-3">
              <div style={{ fontSize: 14, color: "var(--text3)" }}>{navItems.find(n => n.id === state.activeModule)?.label}</div>
            </div>
            <div className="flex items-center gap-3">
              <button className="btn btn-secondary btn-sm" onClick={loadAll}><Icon name="refresh" size={14} /> Refresh</button>
              <div style={{ position: "relative" }}>
                <button className="btn btn-ghost btn-icon" onClick={() => setShowNotif(!showNotif)}>
                  <Icon name="bell" size={18} />
                  {notifCount > 0 && <div className="notif-dot" />}
                </button>
                {showNotif && <NotificationsPanel onClose={() => setShowNotif(false)} />}
              </div>
              <div className="flex items-center gap-2" style={{ paddingLeft: 8, borderLeft: "1px solid var(--border)" }}>
                <Avatar name={state.currentUser.name} size={32} color="#e94560" />
                <div style={{ lineHeight: 1.3 }}>
                  <div className="text-sm font-medium">{state.currentUser.name}</div>
                  <div className="text-xs text-muted2 capitalize">{state.currentUser.role?.toLowerCase()}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="content">
            {moduleComponents[state.activeModule] || <Dashboard />}
          </div>
        </main>

        {state.toast && (
          <div className="toast">
            <Icon name={state.toast.type === "success" ? "check" : "alert"} size={16} color={state.toast.type === "success" ? "#10b981" : "#ef4444"} />
            {state.toast.text}
          </div>
        )}
      </div>
    </AppContext.Provider>
  );
}
