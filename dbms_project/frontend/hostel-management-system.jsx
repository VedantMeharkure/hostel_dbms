// ============================================================
// HOSTEL MANAGEMENT SYSTEM
// Full-stack production-ready application
// Tech: React + Tailwind-equivalent CSS + Context API
// Modules: Rooms, Events, Food/Mess, Cleaning, Sports, Admin
// ============================================================

import { useState, useContext, createContext, useReducer, useEffect, useCallback } from "react";

// ─────────────────────────────────────────────
// DESIGN TOKENS & GLOBAL STYLES
// ─────────────────────────────────────────────
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --brand: #1a1a2e;
    --brand-mid: #16213e;
    --accent: #e94560;
    --accent2: #0f3460;
    --accent3: #533483;
    --gold: #f5a623;
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

  /* Scrollbar */
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: var(--surface2); }
  ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }

  /* Animations */
  @keyframes slideIn { from { opacity:0; transform: translateY(8px); } to { opacity:1; transform: translateY(0); } }
  @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.5; } }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }

  .animate-in { animation: slideIn 0.25s ease; }
  .animate-pulse { animation: pulse 2s infinite; }

  /* Layout */
  .layout { display: flex; min-height: 100vh; }
  .sidebar {
    width: 260px; min-width: 260px; background: var(--brand);
    display: flex; flex-direction: column;
    position: sticky; top: 0; height: 100vh; overflow-y: auto;
  }
  .sidebar-collapsed { width: 72px; min-width: 72px; }
  .main { flex: 1; overflow: hidden; display: flex; flex-direction: column; }
  .topbar {
    background: var(--surface); border-bottom: 1px solid var(--border);
    padding: 0 28px; height: 64px; display: flex; align-items: center;
    justify-content: space-between; position: sticky; top: 0; z-index: 10;
  }
  .content { flex: 1; padding: 28px; overflow-y: auto; }

  /* Sidebar items */
  .sidebar-logo {
    padding: 20px 20px 16px; border-bottom: 1px solid rgba(255,255,255,0.08);
  }
  .nav-item {
    display: flex; align-items: center; gap: 12px; padding: 10px 20px;
    color: rgba(255,255,255,0.6); cursor: pointer; transition: all 0.2s;
    border-left: 3px solid transparent; font-size: 14px; font-weight: 500;
    text-decoration: none; user-select: none;
  }
  .nav-item:hover { color: #fff; background: rgba(255,255,255,0.06); }
  .nav-item.active {
    color: #fff; background: rgba(233,69,96,0.15);
    border-left-color: var(--accent); font-weight: 600;
  }
  .nav-section {
    padding: 16px 20px 8px; font-size: 10px; font-weight: 700;
    color: rgba(255,255,255,0.3); letter-spacing: 1.2px; text-transform: uppercase;
  }

  /* Cards */
  .card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: var(--radius-lg); padding: 20px; box-shadow: var(--shadow);
  }
  .card-sm { padding: 16px; border-radius: var(--radius); }

  /* Stats cards */
  .stat-card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: var(--radius-lg); padding: 20px 24px; box-shadow: var(--shadow);
    position: relative; overflow: hidden; transition: transform 0.2s, box-shadow 0.2s;
  }
  .stat-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-lg); }
  .stat-card .accent-bar {
    position: absolute; top: 0; left: 0; right: 0; height: 3px;
  }

  /* Buttons */
  .btn {
    display: inline-flex; align-items: center; gap: 6px; padding: 9px 18px;
    border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer;
    transition: all 0.15s; border: none; text-decoration: none;
    font-family: 'DM Sans', sans-serif; white-space: nowrap;
  }
  .btn-primary { background: var(--accent); color: #fff; }
  .btn-primary:hover { background: #c73652; transform: translateY(-1px); }
  .btn-secondary {
    background: var(--surface); color: var(--text);
    border: 1px solid var(--border);
  }
  .btn-secondary:hover { background: var(--surface3); }
  .btn-ghost { background: transparent; color: var(--text2); }
  .btn-ghost:hover { background: var(--surface3); color: var(--text); }
  .btn-sm { padding: 6px 12px; font-size: 13px; }
  .btn-danger { background: #fee2e2; color: #dc2626; }
  .btn-danger:hover { background: #fecaca; }
  .btn-success { background: #d1fae5; color: #065f46; }
  .btn-success:hover { background: #a7f3d0; }
  .btn-icon { padding: 8px; border-radius: 8px; }

  /* Badges */
  .badge {
    display: inline-flex; align-items: center; padding: 3px 10px;
    border-radius: 20px; font-size: 12px; font-weight: 600;
  }
  .badge-green { background: #d1fae5; color: #065f46; }
  .badge-red { background: #fee2e2; color: #dc2626; }
  .badge-yellow { background: #fef3c7; color: #92400e; }
  .badge-blue { background: #dbeafe; color: #1e40af; }
  .badge-purple { background: #ede9fe; color: #5b21b6; }
  .badge-gray { background: var(--surface3); color: var(--text2); }
  .badge-orange { background: #ffedd5; color: #9a3412; }

  /* Forms */
  .form-group { margin-bottom: 16px; }
  .form-label { display: block; font-size: 13px; font-weight: 600; color: var(--text2); margin-bottom: 6px; }
  .form-input {
    width: 100%; padding: 10px 14px; border: 1.5px solid var(--border);
    border-radius: 8px; font-size: 14px; color: var(--text);
    background: var(--surface); transition: border-color 0.15s;
    font-family: 'DM Sans', sans-serif; outline: none;
  }
  .form-input:focus { border-color: var(--accent); }
  .form-select {
    width: 100%; padding: 10px 14px; border: 1.5px solid var(--border);
    border-radius: 8px; font-size: 14px; color: var(--text);
    background: var(--surface); cursor: pointer; outline: none;
    font-family: 'DM Sans', sans-serif;
  }
  .form-select:focus { border-color: var(--accent); }

  /* Table */
  .table-wrap { overflow-x: auto; }
  table { width: 100%; border-collapse: collapse; font-size: 14px; }
  th {
    text-align: left; padding: 12px 16px; font-size: 12px; font-weight: 700;
    color: var(--text3); text-transform: uppercase; letter-spacing: 0.6px;
    background: var(--surface2); border-bottom: 1px solid var(--border);
  }
  td { padding: 13px 16px; border-bottom: 1px solid var(--border); color: var(--text); vertical-align: middle; }
  tr:last-child td { border-bottom: none; }
  tr:hover td { background: var(--surface2); }

  /* Modal */
  .modal-overlay {
    position: fixed; inset: 0; background: rgba(26,26,46,0.5);
    display: flex; align-items: center; justify-content: center;
    z-index: 1000; padding: 20px; backdrop-filter: blur(2px);
  }
  .modal {
    background: var(--surface); border-radius: var(--radius-lg);
    width: 100%; max-width: 520px; max-height: 90vh;
    overflow-y: auto; box-shadow: var(--shadow-lg);
    animation: slideIn 0.2s ease;
  }
  .modal-header {
    padding: 20px 24px 0; display: flex; align-items: center;
    justify-content: space-between;
  }
  .modal-body { padding: 20px 24px; }
  .modal-footer {
    padding: 16px 24px; border-top: 1px solid var(--border);
    display: flex; justify-content: flex-end; gap: 10px;
  }

  /* Charts */
  .bar { height: 8px; background: var(--surface3); border-radius: 4px; overflow: hidden; }
  .bar-fill { height: 100%; border-radius: 4px; transition: width 0.8s ease; }

  /* Grid helpers */
  .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
  .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; }
  .grid-4 { display: grid; grid-template-columns: repeat(4,1fr); gap: 20px; }
  @media(max-width:1200px) { .grid-4 { grid-template-columns: 1fr 1fr; } }
  @media(max-width:900px) { .grid-3,.grid-2 { grid-template-columns: 1fr; } }
  @media(max-width:768px) { .grid-4 { grid-template-columns: 1fr 1fr; } .sidebar { position: fixed; z-index: 100; transform: translateX(-100%); } }

  /* Tabs */
  .tabs { display: flex; gap: 2px; background: var(--surface3); padding: 4px; border-radius: 10px; }
  .tab {
    flex: 1; padding: 8px 14px; border-radius: 7px; font-size: 13px;
    font-weight: 500; cursor: pointer; color: var(--text2);
    transition: all 0.15s; text-align: center; border: none; background: transparent;
  }
  .tab.active { background: var(--surface); color: var(--text); box-shadow: var(--shadow); }

  /* Avatar */
  .avatar {
    width: 36px; height: 36px; border-radius: 50%; display: flex;
    align-items: center; justify-content: center; font-size: 13px;
    font-weight: 700; flex-shrink: 0;
  }

  /* Progress ring */
  .progress-ring { transform: rotate(-90deg); }

  /* Search bar */
  .search-bar {
    display: flex; align-items: center; gap: 8px; padding: 8px 14px;
    background: var(--surface2); border: 1.5px solid var(--border);
    border-radius: 8px; flex: 1; max-width: 320px;
  }
  .search-bar input {
    border: none; background: transparent; font-size: 14px; color: var(--text);
    outline: none; width: 100%; font-family: 'DM Sans', sans-serif;
  }

  /* Notification dot */
  .notif-dot {
    width: 8px; height: 8px; background: var(--accent); border-radius: 50%;
    position: absolute; top: 6px; right: 6px;
  }

  /* Empty state */
  .empty-state {
    text-align: center; padding: 48px 24px; color: var(--text3);
  }
  .empty-state .icon { font-size: 48px; margin-bottom: 12px; }

  /* Kanban card */
  .kanban-col { background: var(--surface2); border-radius: var(--radius); padding: 14px; min-width: 220px; flex: 1; }
  .kanban-card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: var(--radius); padding: 12px 14px; margin-bottom: 10px;
    box-shadow: var(--shadow); cursor: pointer;
  }

  /* Mini chart */
  .sparkline { display: flex; align-items: flex-end; gap: 3px; height: 40px; }
  .spark-bar { flex: 1; border-radius: 2px 2px 0 0; transition: height 0.5s ease; }

  /* Toast */
  .toast {
    position: fixed; bottom: 24px; right: 24px; z-index: 9999;
    background: var(--brand); color: #fff; padding: 12px 18px;
    border-radius: 10px; font-size: 14px; font-weight: 500;
    box-shadow: var(--shadow-lg); animation: slideIn 0.25s ease;
    display: flex; align-items: center; gap: 10px; min-width: 240px;
  }

  /* Misc utilities */
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
  .rounded { border-radius: var(--radius); }
  .rounded-full { border-radius: 9999px; }
  .overflow-hidden { overflow: hidden; }
`;

// ─────────────────────────────────────────────
// ICONS (inline SVG)
// ─────────────────────────────────────────────
const Icon = ({ name, size = 18, color = "currentColor", className = "" }) => {
  const icons = {
    home: <path d="M3 12L12 3l9 9M5 10v9h5v-5h4v5h5v-9"/>,
    bed: <><path d="M2 4v16M22 4v16M2 12h20M7 4v8M17 4v8"/><path d="M5 20h14"/></>,
    users: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></>,
    star: <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>,
    food: <><path d="M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8zM6 1v3M10 1v3M14 1v3"/></>,
    clean: <><path d="M3 3h18M3 3l4 18M21 3l-4 18M9 21h6"/><path d="M9 9h6M10 15h4"/></>,
    sports: <circle cx="12" cy="12" r="10"/>,
    calendar: <><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93A10 10 0 0 0 4.93 19.07M4.93 4.93A10 10 0 0 0 19.07 19.07"/></>,
    bell: <><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"/></>,
    search: <><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></>,
    plus: <><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>,
    edit: <><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></>,
    trash: <><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></>,
    x: <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>,
    check: <polyline points="20 6 9 17 4 12"/>,
    chevron: <polyline points="9 18 15 12 9 6"/>,
    menu: <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>,
    logout: <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></>,
    dollar: <><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></>,
    chart: <><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></>,
    alert: <><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></>,
    user: <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>,
    key: <><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></>,
    download: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></>,
    filter: <><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></>,
    activity: <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>,
    basketball: <><circle cx="12" cy="12" r="10"/><path d="M4.93 4.93a12 12 0 0 0 14.14 14.14M4.93 19.07A12 12 0 0 1 19.07 4.93"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="12" y1="2" x2="12" y2="22"/></>,
    flag: <><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></>,
    clock: <><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>,
    mail: <><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></>,
    info: <><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></>,
    refresh: <><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.49"/></>,
    image: <><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></>,
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
// DATA STORE & CONTEXT
// ─────────────────────────────────────────────
const initialState = {
  currentUser: { id: 1, name: "Admin User", role: "admin", email: "admin@hostel.com", avatar: "AU" },
  activeModule: "dashboard",
  rooms: [
    { id: 1, number: "101", type: "Single", floor: 1, capacity: 1, occupied: 1, status: "Full", amenities: ["AC","WiFi"], rent: 8000 },
    { id: 2, number: "102", type: "Double", floor: 1, capacity: 2, occupied: 1, status: "Available", amenities: ["AC","WiFi","TV"], rent: 6000 },
    { id: 3, number: "201", type: "Shared", floor: 2, capacity: 4, occupied: 3, status: "Available", amenities: ["WiFi","Fan"], rent: 3500 },
    { id: 4, number: "202", type: "Single", floor: 2, capacity: 1, occupied: 0, status: "Available", amenities: ["AC","WiFi"], rent: 8000 },
    { id: 5, number: "301", type: "Double", floor: 3, capacity: 2, occupied: 2, status: "Full", amenities: ["AC","WiFi","TV"], rent: 6000 },
    { id: 6, number: "302", type: "Shared", floor: 3, capacity: 4, occupied: 4, status: "Full", amenities: ["WiFi"], rent: 3500 },
    { id: 7, number: "401", type: "Single", floor: 4, capacity: 1, occupied: 1, status: "Full", amenities: ["AC","WiFi","Balcony"], rent: 9500 },
    { id: 8, number: "402", type: "Double", floor: 4, capacity: 2, occupied: 0, status: "Available", amenities: ["AC","WiFi","TV","Balcony"], rent: 7500 },
  ],
  students: [
    { id: 1, name: "Arjun Sharma", email: "arjun@email.com", phone: "9876543210", roomId: 1, course: "B.Tech CSE", year: 3, joinDate: "2023-07-01", avatar: "AS", paymentStatus: "Paid" },
    { id: 2, name: "Priya Mehta", email: "priya@email.com", phone: "9876543211", roomId: 2, course: "MBA", year: 1, joinDate: "2024-01-10", avatar: "PM", paymentStatus: "Overdue" },
    { id: 3, name: "Rahul Verma", email: "rahul@email.com", phone: "9876543212", roomId: 3, course: "B.Tech ECE", year: 2, joinDate: "2023-07-15", avatar: "RV", paymentStatus: "Paid" },
    { id: 4, name: "Sneha Patel", email: "sneha@email.com", phone: "9876543213", roomId: 3, course: "BCA", year: 1, joinDate: "2024-01-05", avatar: "SP", paymentStatus: "Pending" },
    { id: 5, name: "Vikram Singh", email: "vikram@email.com", phone: "9876543214", roomId: 5, course: "B.Tech ME", year: 4, joinDate: "2021-07-01", avatar: "VS", paymentStatus: "Paid" },
    { id: 6, name: "Ananya Roy", email: "ananya@email.com", phone: "9876543215", roomId: 7, course: "M.Tech", year: 2, joinDate: "2023-01-20", avatar: "AR", paymentStatus: "Paid" },
  ],
  payments: [
    { id: 1, studentId: 1, studentName: "Arjun Sharma", amount: 8000, type: "Monthly", status: "Paid", date: "2024-12-01", dueDate: "2024-12-05", method: "UPI" },
    { id: 2, studentId: 2, studentName: "Priya Mehta", amount: 6000, type: "Monthly", status: "Overdue", date: null, dueDate: "2024-11-05", method: null },
    { id: 3, studentId: 3, studentName: "Rahul Verma", amount: 3500, type: "Monthly", status: "Paid", date: "2024-12-03", dueDate: "2024-12-05", method: "Bank Transfer" },
    { id: 4, studentId: 4, studentName: "Sneha Patel", amount: 3500, type: "Monthly", status: "Pending", date: null, dueDate: "2024-12-10", method: null },
    { id: 5, studentId: 5, studentName: "Vikram Singh", amount: 6000, type: "Semester", status: "Paid", date: "2024-08-01", dueDate: "2024-08-05", method: "Card" },
    { id: 6, studentId: 6, studentName: "Ananya Roy", amount: 8000, type: "Monthly", status: "Paid", date: "2024-12-02", dueDate: "2024-12-05", method: "UPI" },
  ],
  events: [
    { id: 1, title: "Annual Sports Meet", date: "2024-12-20", time: "09:00", category: "Sports", description: "Annual inter-hostel sports competition", image: "🏆", rsvp: { going: 45, notGoing: 12 }, status: "Upcoming", organizer: "Admin" },
    { id: 2, title: "Cultural Night", date: "2024-12-25", time: "18:00", category: "Cultural", description: "Celebrate the festive season with music and dance", image: "🎭", rsvp: { going: 78, notGoing: 5 }, status: "Upcoming", organizer: "Student Council" },
    { id: 3, title: "Warden's Meeting", date: "2024-12-15", time: "10:00", category: "Meeting", description: "Monthly hostel management meeting", image: "📋", rsvp: { going: 12, notGoing: 3 }, status: "Upcoming", organizer: "Warden" },
    { id: 4, title: "Freshers Welcome", date: "2024-11-01", time: "17:00", category: "Cultural", description: "Welcome party for new students", image: "🎉", rsvp: { going: 120, notGoing: 8 }, status: "Completed", organizer: "Student Council" },
  ],
  meals: [
    { id: 1, studentId: 1, studentName: "Arjun Sharma", plan: "Monthly", status: "Active", amount: 3000, paid: true },
    { id: 2, studentId: 2, studentName: "Priya Mehta", plan: "Daily", status: "Active", amount: 150, paid: false },
    { id: 3, studentId: 3, studentName: "Rahul Verma", plan: "Monthly", status: "Active", amount: 3000, paid: true },
    { id: 4, studentId: 4, studentName: "Sneha Patel", plan: "One-time", status: "Active", amount: 80, paid: true },
  ],
  weeklyMenu: {
    Monday: { breakfast: "Poha, Tea", lunch: "Dal Tadka, Rice, Roti, Sabzi", dinner: "Paneer Butter Masala, Naan" },
    Tuesday: { breakfast: "Idli, Sambar", lunch: "Rajma, Rice, Roti, Raita", dinner: "Chicken Curry, Rice (optional veg)" },
    Wednesday: { breakfast: "Upma, Juice", lunch: "Kadai Paneer, Dal, Rice, Roti", dinner: "Chole Bhature" },
    Thursday: { breakfast: "Paratha, Curd", lunch: "Aloo Gobi, Dal, Rice, Roti", dinner: "Palak Paneer, Roti" },
    Friday: { breakfast: "Dosa, Chutney", lunch: "Matar Paneer, Rice, Roti, Raita", dinner: "Special Biryani" },
    Saturday: { breakfast: "Bread, Eggs, Tea", lunch: "Mix Veg, Dal, Rice, Roti", dinner: "Shahi Paneer, Naan" },
    Sunday: { breakfast: "Puri Bhaji", lunch: "Special Sunday Thali", dinner: "Pasta / Chinese" },
  },
  cleaningRequests: [
    { id: 1, studentId: 1, studentName: "Arjun Sharma", room: "101", type: "Deep Clean", priority: "High", status: "Completed", date: "2024-12-10", assignedTo: "Ramu Kumar", feedback: 5 },
    { id: 2, studentId: 2, studentName: "Priya Mehta", room: "102", type: "Regular", priority: "Medium", status: "In Progress", date: "2024-12-12", assignedTo: "Shyam Lal", feedback: null },
    { id: 3, studentId: 3, studentName: "Rahul Verma", room: "201", type: "Bathroom", priority: "High", status: "Pending", date: "2024-12-13", assignedTo: null, feedback: null },
    { id: 4, studentId: 4, studentName: "Sneha Patel", room: "201", type: "Regular", priority: "Low", status: "Pending", date: "2024-12-13", assignedTo: null, feedback: null },
    { id: 5, studentId: 5, studentName: "Vikram Singh", room: "301", type: "Deep Clean", priority: "Medium", status: "Completed", date: "2024-12-08", assignedTo: "Ramu Kumar", feedback: 4 },
  ],
  sportsEquipment: [
    { id: 1, name: "Basketball", total: 6, available: 4, issuedTo: ["Arjun Sharma", "Rahul Verma"], condition: "Good" },
    { id: 2, name: "Football", total: 4, available: 2, issuedTo: ["Vikram Singh", "Sneha Patel"], condition: "Good" },
    { id: 3, name: "Cricket Bat", total: 8, available: 5, issuedTo: ["Priya Mehta", "Ananya Roy", "Rahul Verma"], condition: "Fair" },
    { id: 4, name: "Table Tennis Bat", total: 4, available: 4, issuedTo: [], condition: "Excellent" },
    { id: 5, name: "Badminton Racket", total: 6, available: 3, issuedTo: ["Arjun Sharma", "Sneha Patel", "Vikram Singh"], condition: "Good" },
    { id: 6, name: "Volleyball", total: 3, available: 1, issuedTo: ["Priya Mehta", "Ananya Roy"], condition: "Fair" },
  ],
  notifications: [
    { id: 1, text: "Priya Mehta's payment is overdue", type: "alert", time: "2h ago", read: false },
    { id: 2, text: "Cleaning request #3 needs assignment", type: "info", time: "4h ago", read: false },
    { id: 3, text: "Cultural Night event - 78 RSVPs", type: "success", time: "6h ago", read: true },
    { id: 4, text: "Room 302 is at full capacity", type: "info", time: "1d ago", read: true },
  ],
  toast: null,
};

const AppContext = createContext(null);

function reducer(state, action) {
  switch (action.type) {
    case "SET_MODULE": return { ...state, activeModule: action.payload };
    case "ADD_ROOM": return { ...state, rooms: [...state.rooms, { ...action.payload, id: Date.now() }] };
    case "UPDATE_ROOM": return { ...state, rooms: state.rooms.map(r => r.id === action.payload.id ? action.payload : r) };
    case "DELETE_ROOM": return { ...state, rooms: state.rooms.filter(r => r.id !== action.payload) };
    case "ADD_STUDENT": return { ...state, students: [...state.students, { ...action.payload, id: Date.now() }] };
    case "UPDATE_STUDENT": return { ...state, students: state.students.map(s => s.id === action.payload.id ? action.payload : s) };
    case "DELETE_STUDENT": return { ...state, students: state.students.filter(s => s.id !== action.payload) };
    case "ADD_EVENT": return { ...state, events: [...state.events, { ...action.payload, id: Date.now() }] };
    case "DELETE_EVENT": return { ...state, events: state.events.filter(e => e.id !== action.payload) };
    case "ADD_CLEANING": return { ...state, cleaningRequests: [...state.cleaningRequests, { ...action.payload, id: Date.now() }] };
    case "UPDATE_CLEANING": return { ...state, cleaningRequests: state.cleaningRequests.map(c => c.id === action.payload.id ? action.payload : c) };
    case "ISSUE_EQUIPMENT": return { ...state, sportsEquipment: state.sportsEquipment.map(e => e.id === action.payload.id ? action.payload : e) };
    case "UPDATE_MENU": return { ...state, weeklyMenu: { ...state.weeklyMenu, [action.payload.day]: action.payload.meals } };
    case "SHOW_TOAST": return { ...state, toast: action.payload };
    case "HIDE_TOAST": return { ...state, toast: null };
    case "MARK_NOTIF_READ": return { ...state, notifications: state.notifications.map(n => n.id === action.payload ? { ...n, read: true } : n) };
    case "RSVP_EVENT": return { ...state, events: state.events.map(e => e.id === action.payload.id ? { ...e, rsvp: { ...e.rsvp, going: e.rsvp.going + (action.payload.going ? 1 : 0), notGoing: e.rsvp.notGoing + (!action.payload.going ? 1 : 0) } } : e) };
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

const StatCard = ({ label, value, icon, color, trend, sub }) => (
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
    {trend && <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 6, fontSize: 12 }}>
      <span style={{ color: trend > 0 ? "#059669" : "#dc2626" }}>{trend > 0 ? "↑" : "↓"} {Math.abs(trend)}%</span>
      <span className="text-muted2">vs last month</span>
    </div>}
  </div>
);

const Avatar = ({ name = "?", size = 36, color = "#e94560" }) => {
  const initials = name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: color + "22", color: color, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: size * 0.35, flexShrink: 0 }}>
      {initials}
    </div>
  );
};

const Badge = ({ status }) => {
  const map = {
    Paid: "badge-green", Active: "badge-green", Available: "badge-green", Going: "badge-green",
    Completed: "badge-green", Excellent: "badge-green",
    Pending: "badge-yellow", "In Progress": "badge-blue", Upcoming: "badge-blue", Fair: "badge-yellow",
    Overdue: "badge-red", Full: "badge-red", "Not Going": "badge-red",
    Good: "badge-purple", Monthly: "badge-purple", Semester: "badge-blue",
    High: "badge-red", Medium: "badge-yellow", Low: "badge-blue",
    Cultural: "badge-purple", Sports: "badge-green", Meeting: "badge-blue",
    Single: "badge-blue", Double: "badge-purple", Shared: "badge-orange",
  };
  return <span className={`badge ${map[status] || "badge-gray"}`}>{status}</span>;
};

const SearchBar = ({ value, onChange, placeholder = "Search..." }) => (
  <div className="search-bar">
    <Icon name="search" size={15} color="var(--text3)" />
    <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
    {value && <button onClick={() => onChange("")} style={{ border: "none", background: "none", cursor: "pointer", color: "var(--text3)" }}>×</button>}
  </div>
);

const OccupancyBar = ({ occupied, capacity, color }) => {
  const pct = Math.round((occupied / capacity) * 100);
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-muted">{occupied}/{capacity} beds</span>
        <span style={{ color }}>{pct}%</span>
      </div>
      <div className="bar"><div className="bar-fill" style={{ width: pct + "%", background: pct === 100 ? "#ef4444" : pct > 70 ? "#f59e0b" : "#10b981" }} /></div>
    </div>
  );
};

// ─────────────────────────────────────────────
// MODULE: DASHBOARD
// ─────────────────────────────────────────────
const Dashboard = () => {
  const { state, dispatch } = useContext(AppContext);
  const { rooms, students, payments, events, cleaningRequests, sportsEquipment } = state;

  const totalBeds = rooms.reduce((a, r) => a + r.capacity, 0);
  const occupiedBeds = rooms.reduce((a, r) => a + r.occupied, 0);
  const paidPayments = payments.filter(p => p.status === "Paid");
  const totalRevenue = paidPayments.reduce((a, p) => a + p.amount, 0);
  const pendingClean = cleaningRequests.filter(c => c.status === "Pending").length;
  const upcomingEvents = events.filter(e => e.status === "Upcoming").length;

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const sparkData = [65, 72, 68, 80, 75, 90, 85];

  return (
    <div className="animate-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display" style={{ fontSize: 26, fontWeight: 700, marginBottom: 4 }}>Dashboard</h1>
          <p className="text-muted text-sm">Welcome back, {state.currentUser.name} • {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
        </div>
        <button className="btn btn-primary" onClick={() => dispatch({ type: "SET_MODULE", payload: "rooms" })}>
          <Icon name="plus" size={16} /> Add Room
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid-4 mb-6">
        <StatCard label="Total Students" value={students.length} icon="users" color="#e94560" trend={12} sub="6 rooms occupied" />
        <StatCard label="Room Occupancy" value={`${Math.round((occupiedBeds/totalBeds)*100)}%`} icon="bed" color="#0f3460" sub={`${occupiedBeds}/${totalBeds} beds filled`} trend={5} />
        <StatCard label="Revenue (Dec)" value={`₹${(totalRevenue/1000).toFixed(1)}K`} icon="dollar" color="#533483" trend={8} sub={`${paidPayments.length} payments received`} />
        <StatCard label="Pending Cleaning" value={pendingClean} icon="clean" color="#f5a623" sub={`${cleaningRequests.filter(c => c.status === "In Progress").length} in progress`} trend={-15} />
      </div>

      <div className="grid-2 mb-6" style={{ gridTemplateColumns: "2fr 1fr" }}>
        {/* Occupancy by Room */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semi" style={{ fontSize: 15 }}>Room Occupancy Overview</h3>
            <button className="btn btn-secondary btn-sm" onClick={() => dispatch({ type: "SET_MODULE", payload: "rooms" })}>
              Manage Rooms
            </button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {rooms.map(room => (
              <div key={room.id}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semi text-sm">Room {room.number}</span>
                    <Badge status={room.type} />
                  </div>
                  <Badge status={room.status} />
                </div>
                <OccupancyBar occupied={room.occupied} capacity={room.capacity} />
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats & Activity */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="card">
            <h3 className="font-semi mb-3" style={{ fontSize: 15 }}>Weekly Check-ins</h3>
            <div className="sparkline">
              {sparkData.map((v, i) => (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <div className="spark-bar" style={{ height: v * 0.4 + "px", background: `hsl(${220 + i * 10},70%,55%)`, borderRadius: "3px 3px 0 0", width: "100%" }} />
                  <span style={{ fontSize: 10, color: "var(--text3)" }}>{days[i]}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h3 className="font-semi mb-3" style={{ fontSize: 15 }}>Payment Summary</h3>
            {[["Paid", payments.filter(p=>p.status==="Paid").length, "#10b981"],
              ["Pending", payments.filter(p=>p.status==="Pending").length, "#f59e0b"],
              ["Overdue", payments.filter(p=>p.status==="Overdue").length, "#ef4444"]
            ].map(([label, count, color]) => (
              <div key={label} className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: color }} />
                  <span className="text-sm">{label}</span>
                </div>
                <span className="font-semi text-sm">{count}</span>
              </div>
            ))}
          </div>

          <div className="card">
            <h3 className="font-semi mb-3" style={{ fontSize: 15 }}>Upcoming Events</h3>
            {events.filter(e=>e.status==="Upcoming").slice(0,3).map(ev => (
              <div key={ev.id} className="flex items-center gap-2 mb-2">
                <span style={{ fontSize: 20 }}>{ev.image}</span>
                <div>
                  <div className="text-sm font-medium truncate" style={{ maxWidth: 140 }}>{ev.title}</div>
                  <div className="text-xs text-muted2">{ev.date}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semi" style={{ fontSize: 15 }}>Recent Students</h3>
          <button className="btn btn-ghost btn-sm" onClick={() => dispatch({ type: "SET_MODULE", payload: "students" })}>View All</button>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Student</th><th>Course</th><th>Room</th><th>Join Date</th><th>Payment</th></tr>
            </thead>
            <tbody>
              {students.map(s => (
                <tr key={s.id}>
                  <td><div className="flex items-center gap-2">
                    <Avatar name={s.name} size={32} />
                    <div>
                      <div className="font-medium text-sm">{s.name}</div>
                      <div className="text-xs text-muted2">{s.email}</div>
                    </div>
                  </div></td>
                  <td className="text-sm">{s.course}</td>
                  <td><Badge status={rooms.find(r=>r.id===s.roomId)?.number || "N/A"} /></td>
                  <td className="text-sm text-muted">{s.joinDate}</td>
                  <td><Badge status={s.paymentStatus} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// MODULE: ROOMS
// ─────────────────────────────────────────────
const RoomModal = ({ room, onClose, onSave }) => {
  const [form, setForm] = useState(room || { number: "", type: "Single", floor: 1, capacity: 1, occupied: 0, status: "Available", amenities: [], rent: 5000 });
  const amenityOptions = ["AC", "WiFi", "TV", "Balcony", "Fan", "Geyser"];
  return (
    <Modal open title={room ? "Edit Room" : "Add New Room"} onClose={onClose}
      footer={<>
        <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={() => onSave(form)}>
          {room ? "Update" : "Add"} Room
        </button>
      </>}>
      <div className="grid-2">
        <div className="form-group"><label className="form-label">Room Number</label>
          <input className="form-input" value={form.number} onChange={e => setForm({...form, number: e.target.value})} placeholder="101" /></div>
        <div className="form-group"><label className="form-label">Floor</label>
          <input className="form-input" type="number" value={form.floor} onChange={e => setForm({...form, floor: +e.target.value})} /></div>
      </div>
      <div className="grid-2">
        <div className="form-group"><label className="form-label">Type</label>
          <select className="form-select" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
            {["Single","Double","Shared"].map(t => <option key={t}>{t}</option>)}
          </select></div>
        <div className="form-group"><label className="form-label">Capacity</label>
          <input className="form-input" type="number" value={form.capacity} onChange={e => setForm({...form, capacity: +e.target.value})} /></div>
      </div>
      <div className="form-group"><label className="form-label">Monthly Rent (₹)</label>
        <input className="form-input" type="number" value={form.rent} onChange={e => setForm({...form, rent: +e.target.value})} /></div>
      <div className="form-group"><label className="form-label">Amenities</label>
        <div className="flex" style={{ flexWrap: "wrap", gap: 8 }}>
          {amenityOptions.map(a => (
            <label key={a} style={{ display: "flex", alignItems: "center", gap: 4, cursor: "pointer", fontSize: 13 }}>
              <input type="checkbox" checked={form.amenities.includes(a)}
                onChange={e => setForm({...form, amenities: e.target.checked ? [...form.amenities, a] : form.amenities.filter(x => x !== a)})} />
              {a}
            </label>
          ))}
        </div>
      </div>
    </Modal>
  );
};

const RoomsModule = () => {
  const { state, dispatch } = useContext(AppContext);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [modal, setModal] = useState(null);
  const [view, setView] = useState("grid");

  const filtered = state.rooms.filter(r =>
    (filter === "All" || r.type === filter || r.status === filter) &&
    r.number.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = (form) => {
    if (modal === "add") dispatch({ type: "ADD_ROOM", payload: form });
    else dispatch({ type: "UPDATE_ROOM", payload: { ...form, id: modal.id } });
    dispatch({ type: "SHOW_TOAST", payload: { text: modal === "add" ? "Room added!" : "Room updated!", type: "success" } });
    setTimeout(() => dispatch({ type: "HIDE_TOAST" }), 3000);
    setModal(null);
  };

  return (
    <div className="animate-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display" style={{ fontSize: 26, fontWeight: 700, marginBottom: 4 }}>Room Management</h1>
          <p className="text-muted text-sm">{state.rooms.length} rooms • {state.rooms.filter(r=>r.status==="Available").length} available</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal("add")}><Icon name="plus" size={16} />Add Room</button>
      </div>

      <div className="flex items-center gap-3 mb-6" style={{ flexWrap: "wrap" }}>
        <SearchBar value={search} onChange={setSearch} placeholder="Search rooms..." />
        <div className="tabs" style={{ flex: "none" }}>
          {["All","Single","Double","Shared","Available","Full"].map(f => (
            <button key={f} className={`tab ${filter===f?"active":""}`} onClick={() => setFilter(f)}>{f}</button>
          ))}
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
          <button className={`btn btn-${view==="grid"?"primary":"secondary"} btn-icon`} onClick={() => setView("grid")}>⊞</button>
          <button className={`btn btn-${view==="list"?"primary":"secondary"} btn-icon`} onClick={() => setView("list")}>☰</button>
        </div>
      </div>

      {view === "grid" ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 16 }}>
          {filtered.map(room => (
            <div key={room.id} className="card animate-in" style={{ cursor: "pointer" }}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="font-display font-bold" style={{ fontSize: 22 }}>Room {room.number}</div>
                  <div className="text-muted text-sm">Floor {room.floor}</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                  <Badge status={room.type} />
                  <Badge status={room.status} />
                </div>
              </div>
              <OccupancyBar occupied={room.occupied} capacity={room.capacity} />
              <div className="flex items-center justify-between mt-3">
                <div>
                  <div className="text-xs text-muted2 mb-1">Amenities</div>
                  <div className="flex gap-1" style={{ flexWrap: "wrap" }}>
                    {room.amenities.map(a => <span key={a} style={{ fontSize: 11, background: "var(--surface3)", padding: "2px 8px", borderRadius: 20, color: "var(--text2)" }}>{a}</span>)}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div className="text-xs text-muted2">Rent/month</div>
                  <div className="font-bold text-accent">₹{room.rent.toLocaleString()}</div>
                </div>
              </div>
              <div className="flex gap-2 mt-3" style={{ borderTop: "1px solid var(--border)", paddingTop: 12 }}>
                <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={() => setModal(room)}><Icon name="edit" size={14}/>Edit</button>
                <button className="btn btn-danger btn-sm" onClick={() => { dispatch({ type: "DELETE_ROOM", payload: room.id }); }}>
                  <Icon name="trash" size={14}/>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead><tr><th>Room</th><th>Type</th><th>Floor</th><th>Occupancy</th><th>Rent</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {filtered.map(room => (
                  <tr key={room.id}>
                    <td><span className="font-semi">Room {room.number}</span></td>
                    <td><Badge status={room.type} /></td>
                    <td>Floor {room.floor}</td>
                    <td style={{ minWidth: 150 }}><OccupancyBar occupied={room.occupied} capacity={room.capacity} /></td>
                    <td>₹{room.rent.toLocaleString()}</td>
                    <td><Badge status={room.status} /></td>
                    <td>
                      <div className="flex gap-2">
                        <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setModal(room)}><Icon name="edit" size={14}/></button>
                        <button className="btn btn-danger btn-icon btn-sm" onClick={() => dispatch({ type: "DELETE_ROOM", payload: room.id })}><Icon name="trash" size={14}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {(modal === "add" || (modal && modal.id)) && (
        <RoomModal room={modal === "add" ? null : modal} onClose={() => setModal(null)} onSave={handleSave} />
      )}
    </div>
  );
};

// ─────────────────────────────────────────────
// MODULE: STUDENTS
// ─────────────────────────────────────────────
const StudentsModule = () => {
  const { state, dispatch } = useContext(AppContext);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", course: "", year: 1, roomId: "", joinDate: "", paymentStatus: "Pending" });

  const filtered = state.students.filter(s =>
    (filter === "All" || s.paymentStatus === filter) &&
    (s.name.toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase()))
  );

  const handleSave = () => {
    if (modal === "add") dispatch({ type: "ADD_STUDENT", payload: { ...form, avatar: form.name.split(" ").map(n=>n[0]).join("").slice(0,2) } });
    else dispatch({ type: "UPDATE_STUDENT", payload: { ...modal, ...form } });
    dispatch({ type: "SHOW_TOAST", payload: { text: "Student saved successfully!", type: "success" } });
    setTimeout(() => dispatch({ type: "HIDE_TOAST" }), 3000);
    setModal(null);
  };

  return (
    <div className="animate-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display" style={{ fontSize: 26, fontWeight: 700, marginBottom: 4 }}>Students</h1>
          <p className="text-muted text-sm">{state.students.length} registered residents</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setForm({ name:"",email:"",phone:"",course:"",year:1,roomId:"",joinDate:"",paymentStatus:"Pending"}); setModal("add"); }}>
          <Icon name="plus" size={16}/>Add Student
        </button>
      </div>

      <div className="flex items-center gap-3 mb-6" style={{ flexWrap: "wrap" }}>
        <SearchBar value={search} onChange={setSearch} placeholder="Search by name or email..." />
        <div className="tabs" style={{ flex: "none" }}>
          {["All","Paid","Pending","Overdue"].map(f => (
            <button key={f} className={`tab ${filter===f?"active":""}`} onClick={() => setFilter(f)}>{f}</button>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead><tr><th>Student</th><th>Contact</th><th>Course / Year</th><th>Room</th><th>Join Date</th><th>Payment</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.length === 0 && <tr><td colSpan={7}><div className="empty-state"><div className="icon">👤</div><div>No students found</div></div></td></tr>}
              {filtered.map(s => (
                <tr key={s.id}>
                  <td><div className="flex items-center gap-2">
                    <Avatar name={s.name} size={36} color={s.paymentStatus === "Overdue" ? "#ef4444" : s.paymentStatus === "Pending" ? "#f59e0b" : "#10b981"} />
                    <div><div className="font-semi text-sm">{s.name}</div><div className="text-xs text-muted2">{s.email}</div></div>
                  </div></td>
                  <td className="text-sm">{s.phone}</td>
                  <td><div className="font-medium text-sm">{s.course}</div><div className="text-xs text-muted2">Year {s.year}</div></td>
                  <td><Badge status={state.rooms.find(r=>r.id===s.roomId)?.number || "Unassigned"} /></td>
                  <td className="text-sm text-muted">{s.joinDate}</td>
                  <td><Badge status={s.paymentStatus} /></td>
                  <td>
                    <div className="flex gap-1">
                      <button className="btn btn-ghost btn-icon btn-sm" onClick={() => { setForm({...s}); setModal(s); }}><Icon name="edit" size={14}/></button>
                      <button className="btn btn-danger btn-icon btn-sm" onClick={() => dispatch({ type: "DELETE_STUDENT", payload: s.id })}><Icon name="trash" size={14}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <Modal open title={modal==="add"?"Add Student":"Edit Student"} onClose={() => setModal(null)}
          footer={<>
            <button className="btn btn-secondary" onClick={() => setModal(null)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave}>Save Student</button>
          </>}>
          <div className="grid-2">
            <div className="form-group"><label className="form-label">Full Name</label><input className="form-input" value={form.name} onChange={e => setForm({...form,name:e.target.value})} /></div>
            <div className="form-group"><label className="form-label">Email</label><input className="form-input" type="email" value={form.email} onChange={e => setForm({...form,email:e.target.value})} /></div>
          </div>
          <div className="grid-2">
            <div className="form-group"><label className="form-label">Phone</label><input className="form-input" value={form.phone} onChange={e => setForm({...form,phone:e.target.value})} /></div>
            <div className="form-group"><label className="form-label">Course</label><input className="form-input" value={form.course} onChange={e => setForm({...form,course:e.target.value})} /></div>
          </div>
          <div className="grid-2">
            <div className="form-group"><label className="form-label">Year</label><input className="form-input" type="number" value={form.year} onChange={e => setForm({...form,year:+e.target.value})} /></div>
            <div className="form-group"><label className="form-label">Room</label>
              <select className="form-select" value={form.roomId} onChange={e => setForm({...form,roomId:+e.target.value})}>
                <option value="">Select Room</option>
                {state.rooms.filter(r=>r.status==="Available").map(r => <option key={r.id} value={r.id}>Room {r.number} ({r.type})</option>)}
              </select>
            </div>
          </div>
          <div className="grid-2">
            <div className="form-group"><label className="form-label">Join Date</label><input className="form-input" type="date" value={form.joinDate} onChange={e => setForm({...form,joinDate:e.target.value})} /></div>
            <div className="form-group"><label className="form-label">Payment Status</label>
              <select className="form-select" value={form.paymentStatus} onChange={e => setForm({...form,paymentStatus:e.target.value})}>
                {["Paid","Pending","Overdue"].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────
// MODULE: PAYMENTS
// ─────────────────────────────────────────────
const PaymentsModule = () => {
  const { state } = useContext(AppContext);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = state.payments.filter(p =>
    (filter === "All" || p.status === filter) &&
    p.studentName.toLowerCase().includes(search.toLowerCase())
  );

  const totalPaid = state.payments.filter(p=>p.status==="Paid").reduce((a,p)=>a+p.amount,0);
  const totalPending = state.payments.filter(p=>p.status!=="Paid").reduce((a,p)=>a+p.amount,0);

  return (
    <div className="animate-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display" style={{ fontSize: 26, fontWeight: 700, marginBottom: 4 }}>Payments</h1>
          <p className="text-muted text-sm">Track hostel fee payments and dues</p>
        </div>
        <button className="btn btn-primary"><Icon name="download" size={16}/>Export Report</button>
      </div>

      <div className="grid-3 mb-6">
        <div className="card" style={{ borderLeft: "3px solid #10b981" }}>
          <div className="text-sm text-muted mb-1">Total Collected</div>
          <div className="font-display" style={{ fontSize: 28, fontWeight: 700, color: "#10b981" }}>₹{totalPaid.toLocaleString()}</div>
          <div className="text-xs text-muted2 mt-1">{state.payments.filter(p=>p.status==="Paid").length} payments</div>
        </div>
        <div className="card" style={{ borderLeft: "3px solid #f59e0b" }}>
          <div className="text-sm text-muted mb-1">Pending Amount</div>
          <div className="font-display" style={{ fontSize: 28, fontWeight: 700, color: "#f59e0b" }}>₹{totalPending.toLocaleString()}</div>
          <div className="text-xs text-muted2 mt-1">{state.payments.filter(p=>p.status!=="Paid").length} outstanding</div>
        </div>
        <div className="card" style={{ borderLeft: "3px solid #e94560" }}>
          <div className="text-sm text-muted mb-1">Overdue</div>
          <div className="font-display" style={{ fontSize: 28, fontWeight: 700, color: "#e94560" }}>₹{state.payments.filter(p=>p.status==="Overdue").reduce((a,p)=>a+p.amount,0).toLocaleString()}</div>
          <div className="text-xs text-muted2 mt-1">{state.payments.filter(p=>p.status==="Overdue").length} accounts</div>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-4" style={{ flexWrap: "wrap" }}>
        <SearchBar value={search} onChange={setSearch} placeholder="Search by student name..." />
        <div className="tabs" style={{ flex: "none" }}>
          {["All","Paid","Pending","Overdue"].map(f => (
            <button key={f} className={`tab ${filter===f?"active":""}`} onClick={() => setFilter(f)}>{f}</button>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead><tr><th>Student</th><th>Amount</th><th>Type</th><th>Due Date</th><th>Paid Date</th><th>Method</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id}>
                  <td className="font-medium text-sm">{p.studentName}</td>
                  <td><span className="font-bold">₹{p.amount.toLocaleString()}</span></td>
                  <td><Badge status={p.type} /></td>
                  <td className="text-sm">{p.dueDate}</td>
                  <td className="text-sm text-muted">{p.date || "—"}</td>
                  <td className="text-sm">{p.method || "—"}</td>
                  <td><Badge status={p.status} /></td>
                  <td>
                    <button className="btn btn-ghost btn-sm">
                      <Icon name="download" size={14}/> Invoice
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// MODULE: EVENTS
// ─────────────────────────────────────────────
const EventsModule = () => {
  const { state, dispatch } = useContext(AppContext);
  const [filter, setFilter] = useState("All");
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ title:"",date:"",time:"",category:"Cultural",description:"",image:"🎉",status:"Upcoming",organizer:"Admin",rsvp:{going:0,notGoing:0} });

  const filtered = state.events.filter(e => filter==="All" || e.category===filter || e.status===filter);

  const catColors = { Cultural: "#7c3aed", Sports: "#059669", Meeting: "#1d4ed8" };

  return (
    <div className="animate-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display" style={{ fontSize: 26, fontWeight: 700, marginBottom: 4 }}>Events</h1>
          <p className="text-muted text-sm">{state.events.length} events • {state.events.filter(e=>e.status==="Upcoming").length} upcoming</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal(true)}><Icon name="plus" size={16}/>Create Event</button>
      </div>

      <div className="tabs mb-6" style={{ maxWidth: 480 }}>
        {["All","Upcoming","Completed","Cultural","Sports","Meeting"].map(f => (
          <button key={f} className={`tab ${filter===f?"active":""}`} onClick={() => setFilter(f)}>{f}</button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 20 }}>
        {filtered.map(ev => (
          <div key={ev.id} className="card animate-in" style={{ overflow: "hidden" }}>
            <div style={{ height: 100, background: `linear-gradient(135deg, ${catColors[ev.category]}22, ${catColors[ev.category]}44)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48, borderRadius: "8px 8px 0 0", margin: "-20px -20px 0" }}>
              {ev.image}
            </div>
            <div style={{ paddingTop: 16 }}>
              <div className="flex items-center gap-2 mb-2">
                <Badge status={ev.category} />
                <Badge status={ev.status} />
              </div>
              <h3 className="font-semi mb-1" style={{ fontSize: 16 }}>{ev.title}</h3>
              <p className="text-sm text-muted mb-3" style={{ lineHeight: 1.5 }}>{ev.description}</p>
              <div className="flex items-center gap-3 mb-3 text-xs text-muted2">
                <span>📅 {ev.date}</span>
                <span>⏰ {ev.time}</span>
                <span>👤 {ev.organizer}</span>
              </div>
              <div style={{ background: "var(--surface2)", borderRadius: 8, padding: "10px 14px", marginBottom: 12 }}>
                <div className="flex justify-between text-sm">
                  <span className="text-green font-medium">✓ Going: {ev.rsvp.going}</span>
                  <span style={{ color: "var(--text3)" }}>✗ Not Going: {ev.rsvp.notGoing}</span>
                </div>
                <div className="bar mt-2"><div className="bar-fill" style={{ width: `${(ev.rsvp.going/(ev.rsvp.going+ev.rsvp.notGoing+1))*100}%`, background: catColors[ev.category] }} /></div>
              </div>
              <div className="flex gap-2">
                <button className="btn btn-success btn-sm" style={{ flex: 1 }} onClick={() => dispatch({ type: "RSVP_EVENT", payload: { id: ev.id, going: true } })}>Going ✓</button>
                <button className="btn btn-secondary btn-sm" onClick={() => dispatch({ type: "DELETE_EVENT", payload: ev.id })}><Icon name="trash" size={14}/></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal open={modal} title="Create New Event" onClose={() => setModal(false)}
        footer={<>
          <button className="btn btn-secondary" onClick={() => setModal(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={() => {
            dispatch({ type: "ADD_EVENT", payload: form });
            dispatch({ type: "SHOW_TOAST", payload: { text: "Event created!", type: "success" } });
            setTimeout(() => dispatch({ type: "HIDE_TOAST" }), 3000);
            setModal(false);
          }}>Create Event</button>
        </>}>
        <div className="form-group"><label className="form-label">Event Title</label><input className="form-input" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="Annual Sports Meet" /></div>
        <div className="grid-2">
          <div className="form-group"><label className="form-label">Date</label><input className="form-input" type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})} /></div>
          <div className="form-group"><label className="form-label">Time</label><input className="form-input" type="time" value={form.time} onChange={e=>setForm({...form,time:e.target.value})} /></div>
        </div>
        <div className="grid-2">
          <div className="form-group"><label className="form-label">Category</label>
            <select className="form-select" value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>
              {["Cultural","Sports","Meeting"].map(c=><option key={c}>{c}</option>)}
            </select></div>
          <div className="form-group"><label className="form-label">Emoji Icon</label><input className="form-input" value={form.image} onChange={e=>setForm({...form,image:e.target.value})} /></div>
        </div>
        <div className="form-group"><label className="form-label">Description</label>
          <textarea className="form-input" rows={3} value={form.description} onChange={e=>setForm({...form,description:e.target.value})} style={{ resize: "vertical" }} /></div>
      </Modal>
    </div>
  );
};

// ─────────────────────────────────────────────
// MODULE: FOOD / MESS
// ─────────────────────────────────────────────
const FoodModule = () => {
  const { state, dispatch } = useContext(AppContext);
  const [tab, setTab] = useState("menu");
  const days = Object.keys(state.weeklyMenu);
  const [selectedDay, setSelectedDay] = useState(days[0]);
  const [editModal, setEditModal] = useState(false);
  const [editForm, setEditForm] = useState({});

  const mealColors = { breakfast: "#f59e0b", lunch: "#10b981", dinner: "#6366f1" };

  return (
    <div className="animate-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display" style={{ fontSize: 26, fontWeight: 700, marginBottom: 4 }}>Food & Mess</h1>
          <p className="text-muted text-sm">Menu management and meal subscriptions</p>
        </div>
      </div>

      <div className="tabs mb-6" style={{ maxWidth: 360 }}>
        {["menu","subscriptions"].map(t => (
          <button key={t} className={`tab ${tab===t?"active":""}`} onClick={() => setTab(t)}>{t === "menu" ? "Weekly Menu" : "Subscriptions"}</button>
        ))}
      </div>

      {tab === "menu" && (
        <div className="animate-in">
          <div className="flex gap-2 mb-4" style={{ flexWrap: "wrap" }}>
            {days.map(d => (
              <button key={d} className={`btn ${selectedDay===d?"btn-primary":"btn-secondary"} btn-sm`} onClick={() => setSelectedDay(d)}>{d}</button>
            ))}
          </div>
          <div className="grid-3 animate-in">
            {Object.entries(state.weeklyMenu[selectedDay]).map(([meal, items]) => (
              <div key={meal} className="card" style={{ borderTop: `3px solid ${mealColors[meal]}` }}>
                <div className="flex items-center gap-2 mb-3">
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: mealColors[meal] }} />
                  <span className="font-semi" style={{ textTransform: "capitalize", fontSize: 15 }}>{meal}</span>
                </div>
                <p className="text-sm" style={{ lineHeight: 1.7, color: "var(--text)" }}>{items}</p>
                <button className="btn btn-ghost btn-sm mt-3 w-full" onClick={() => { setEditForm({ day: selectedDay, meal, items }); setEditModal(true); }}>
                  <Icon name="edit" size={13}/>Edit Menu
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "subscriptions" && (
        <div className="animate-in">
          <div className="grid-4 mb-6">
            {[["Monthly", "#7c3aed", state.meals.filter(m=>m.plan==="Monthly").length],
              ["Daily", "#059669", state.meals.filter(m=>m.plan==="Daily").length],
              ["One-time", "#1d4ed8", state.meals.filter(m=>m.plan==="One-time").length],
              ["Unpaid", "#dc2626", state.meals.filter(m=>!m.paid).length]
            ].map(([l,c,v]) => (
              <div key={l} className="card" style={{ borderLeft: `3px solid ${c}` }}>
                <div className="text-sm text-muted mb-1">{l}</div>
                <div className="font-display" style={{ fontSize: 28, fontWeight: 700, color: c }}>{v}</div>
              </div>
            ))}
          </div>
          <div className="card">
            <div className="table-wrap">
              <table>
                <thead><tr><th>Student</th><th>Plan</th><th>Amount</th><th>Status</th><th>Action</th></tr></thead>
                <tbody>
                  {state.meals.map(m => (
                    <tr key={m.id}>
                      <td className="font-medium text-sm">{m.studentName}</td>
                      <td><Badge status={m.plan} /></td>
                      <td className="font-bold">₹{m.amount}</td>
                      <td><Badge status={m.paid?"Paid":"Overdue"} /></td>
                      <td><button className={`btn btn-${m.paid?"secondary":"success"} btn-sm`}>{m.paid?"✓ Paid":"Mark Paid"}</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      <Modal open={editModal} title={`Edit ${editForm.meal} - ${editForm.day}`} onClose={() => setEditModal(false)}
        footer={<>
          <button className="btn btn-secondary" onClick={() => setEditModal(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={() => {
            dispatch({ type: "UPDATE_MENU", payload: { day: editForm.day, meals: { ...state.weeklyMenu[editForm.day], [editForm.meal]: editForm.items } } });
            setEditModal(false);
          }}>Save</button>
        </>}>
        <div className="form-group"><label className="form-label">Menu Items</label>
          <textarea className="form-input" rows={3} value={editForm.items} onChange={e=>setEditForm({...editForm,items:e.target.value})} /></div>
      </Modal>
    </div>
  );
};

// ─────────────────────────────────────────────
// MODULE: CLEANING
// ─────────────────────────────────────────────
const CleaningModule = () => {
  const { state, dispatch } = useContext(AppContext);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ studentId:"",studentName:"",room:"",type:"Regular",priority:"Medium",status:"Pending",date:new Date().toISOString().split("T")[0],assignedTo:null,feedback:null });
  const staff = ["Ramu Kumar","Shyam Lal","Gopi Das","Mohan Singh"];

  const cols = ["Pending","In Progress","Completed"];
  const colColors = { Pending: "#f59e0b", "In Progress": "#3b82f6", Completed: "#10b981" };

  return (
    <div className="animate-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display" style={{ fontSize: 26, fontWeight: 700, marginBottom: 4 }}>Cleaning Management</h1>
          <p className="text-muted text-sm">{state.cleaningRequests.filter(c=>c.status==="Pending").length} pending requests</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal(true)}><Icon name="plus" size={16}/>New Request</button>
      </div>

      <div className="grid-3 mb-6">
        {cols.map(col => (
          <div key={col} className="stat-card">
            <div className="accent-bar" style={{ background: colColors[col] }} />
            <div className="flex justify-between items-center">
              <span className="text-muted text-sm">{col}</span>
              <span className="font-display" style={{ fontSize: 32, fontWeight: 700, color: colColors[col] }}>
                {state.cleaningRequests.filter(c=>c.status===col).length}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Kanban Board */}
      <div style={{ display: "flex", gap: 16, overflowX: "auto" }}>
        {cols.map(col => (
          <div key={col} className="kanban-col">
            <div className="flex items-center gap-2 mb-3">
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: colColors[col] }} />
              <span className="font-semi text-sm">{col}</span>
              <span style={{ marginLeft: "auto", background: "var(--border)", borderRadius: 12, padding: "1px 8px", fontSize: 12 }}>
                {state.cleaningRequests.filter(c=>c.status===col).length}
              </span>
            </div>
            {state.cleaningRequests.filter(c => c.status === col).map(req => (
              <div key={req.id} className="kanban-card">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semi text-sm">Room {req.room}</span>
                  <Badge status={req.priority} />
                </div>
                <div className="text-xs text-muted mb-1">{req.studentName}</div>
                <div className="flex gap-1 mb-2">
                  <span style={{ fontSize: 11, background: "var(--surface2)", padding: "2px 8px", borderRadius: 20, color: "var(--text2)" }}>{req.type}</span>
                </div>
                <div className="text-xs text-muted2 mb-2">📅 {req.date}</div>
                {req.assignedTo ? (
                  <div className="flex items-center gap-1 text-xs" style={{ color: "#3b82f6" }}>
                    <Icon name="user" size={12} color="#3b82f6"/>{req.assignedTo}
                  </div>
                ) : (
                  <select className="form-select" style={{ fontSize: 12, padding: "4px 8px" }}
                    onChange={e => {
                      if (e.target.value) dispatch({ type: "UPDATE_CLEANING", payload: { ...req, assignedTo: e.target.value, status: "In Progress" } });
                    }}>
                    <option value="">Assign Staff...</option>
                    {staff.map(s => <option key={s}>{s}</option>)}
                  </select>
                )}
                {req.feedback && (
                  <div className="mt-2 text-xs" style={{ color: "#f59e0b" }}>{"★".repeat(req.feedback)}{"☆".repeat(5-req.feedback)}</div>
                )}
                {col === "In Progress" && (
                  <button className="btn btn-success btn-sm mt-2 w-full" onClick={() => dispatch({ type: "UPDATE_CLEANING", payload: { ...req, status: "Completed", feedback: 5 } })}>
                    Mark Completed ✓
                  </button>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>

      <Modal open={modal} title="New Cleaning Request" onClose={() => setModal(false)}
        footer={<>
          <button className="btn btn-secondary" onClick={() => setModal(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={() => {
            dispatch({ type: "ADD_CLEANING", payload: form });
            dispatch({ type: "SHOW_TOAST", payload: { text: "Request submitted!", type: "success" } });
            setTimeout(() => dispatch({ type: "HIDE_TOAST" }), 3000);
            setModal(false);
          }}>Submit Request</button>
        </>}>
        <div className="grid-2">
          <div className="form-group"><label className="form-label">Student Name</label><input className="form-input" value={form.studentName} onChange={e=>setForm({...form,studentName:e.target.value})} /></div>
          <div className="form-group"><label className="form-label">Room Number</label><input className="form-input" value={form.room} onChange={e=>setForm({...form,room:e.target.value})} /></div>
        </div>
        <div className="grid-2">
          <div className="form-group"><label className="form-label">Type</label>
            <select className="form-select" value={form.type} onChange={e=>setForm({...form,type:e.target.value})}>
              {["Regular","Deep Clean","Bathroom","Window"].map(t=><option key={t}>{t}</option>)}
            </select></div>
          <div className="form-group"><label className="form-label">Priority</label>
            <select className="form-select" value={form.priority} onChange={e=>setForm({...form,priority:e.target.value})}>
              {["Low","Medium","High"].map(p=><option key={p}>{p}</option>)}
            </select></div>
        </div>
      </Modal>
    </div>
  );
};

// ─────────────────────────────────────────────
// MODULE: SPORTS
// ─────────────────────────────────────────────
const SportsModule = () => {
  const { state, dispatch } = useContext(AppContext);
  const [modal, setModal] = useState(null);
  const [issueForm, setIssueForm] = useState({ issueTo: "" });
  const condColors = { Excellent: "#10b981", Good: "#3b82f6", Fair: "#f59e0b", Poor: "#ef4444" };

  return (
    <div className="animate-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display" style={{ fontSize: 26, fontWeight: 700, marginBottom: 4 }}>Sports Equipment</h1>
          <p className="text-muted text-sm">Track equipment availability and issues</p>
        </div>
      </div>

      <div className="grid-4 mb-6">
        {[["Total Items", state.sportsEquipment.reduce((a,e)=>a+e.total,0),"basketball","#533483"],
          ["Available", state.sportsEquipment.reduce((a,e)=>a+e.available,0),"check","#10b981"],
          ["Issued", state.sportsEquipment.reduce((a,e)=>a+(e.total-e.available),0),"flag","#f59e0b"],
          ["Categories", state.sportsEquipment.length,"star","#e94560"]
        ].map(([l,v,icon,c])=>(
          <div key={l} className="stat-card"><div className="accent-bar" style={{ background: c }}/>
            <div className="text-sm text-muted mb-1">{l}</div>
            <div className="font-display" style={{ fontSize: 32, fontWeight: 700, color: c }}>{v}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 16 }}>
        {state.sportsEquipment.map(eq => {
          const pct = Math.round((eq.available/eq.total)*100);
          return (
            <div key={eq.id} className="card animate-in">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semi" style={{ fontSize: 16 }}>{eq.name}</h3>
                <span className="badge" style={{ background: condColors[eq.condition]+"22", color: condColors[eq.condition] }}>{eq.condition}</span>
              </div>
              <div className="grid-2 mb-3" style={{ gap: 8 }}>
                <div className="card-sm" style={{ background: "var(--surface2)", textAlign: "center" }}>
                  <div style={{ fontSize: 22, fontWeight: 700 }}>{eq.total}</div>
                  <div className="text-xs text-muted2">Total</div>
                </div>
                <div className="card-sm" style={{ background: "var(--surface2)", textAlign: "center" }}>
                  <div style={{ fontSize: 22, fontWeight: 700, color: eq.available > 0 ? "#10b981" : "#ef4444" }}>{eq.available}</div>
                  <div className="text-xs text-muted2">Available</div>
                </div>
              </div>
              <div className="bar mb-3"><div className="bar-fill" style={{ width: pct+"%", background: pct > 50 ? "#10b981" : pct > 20 ? "#f59e0b" : "#ef4444" }} /></div>
              {eq.issuedTo.length > 0 && (
                <div className="mb-3">
                  <div className="text-xs text-muted2 mb-1">Issued to:</div>
                  <div className="flex" style={{ flexWrap: "wrap", gap: 4 }}>
                    {eq.issuedTo.map(name => (
                      <span key={name} style={{ fontSize: 11, background: "var(--surface3)", padding: "2px 8px", borderRadius: 20, color: "var(--text2)" }}>{name}</span>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex gap-2">
                <button className="btn btn-primary btn-sm" style={{ flex: 1 }} disabled={eq.available === 0}
                  onClick={() => setModal(eq)}>
                  Issue Equipment
                </button>
                {eq.issuedTo.length > 0 && (
                  <button className="btn btn-secondary btn-sm"
                    onClick={() => dispatch({ type: "ISSUE_EQUIPMENT", payload: { ...eq, available: eq.available + 1, issuedTo: eq.issuedTo.slice(1) } })}>
                    Return
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <Modal open={!!modal} title={`Issue: ${modal?.name}`} onClose={() => setModal(null)}
        footer={<>
          <button className="btn btn-secondary" onClick={() => setModal(null)}>Cancel</button>
          <button className="btn btn-primary" disabled={!issueForm.issueTo} onClick={() => {
            dispatch({ type: "ISSUE_EQUIPMENT", payload: { ...modal, available: modal.available-1, issuedTo: [...modal.issuedTo, issueForm.issueTo] } });
            dispatch({ type: "SHOW_TOAST", payload: { text: `${modal.name} issued to ${issueForm.issueTo}`, type: "success" } });
            setTimeout(() => dispatch({ type: "HIDE_TOAST" }), 3000);
            setModal(null); setIssueForm({ issueTo: "" });
          }}>Confirm Issue</button>
        </>}>
        <div className="form-group"><label className="form-label">Issue To (Student Name)</label>
          <select className="form-select" value={issueForm.issueTo} onChange={e => setIssueForm({ issueTo: e.target.value })}>
            <option value="">Select Student...</option>
            {state.students.map(s => <option key={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div className="card" style={{ background: "var(--surface2)" }}>
          <div className="text-sm text-muted">Available: <strong>{modal?.available}</strong> of <strong>{modal?.total}</strong></div>
        </div>
      </Modal>
    </div>
  );
};

// ─────────────────────────────────────────────
// MODULE: ADMIN / SETTINGS
// ─────────────────────────────────────────────
const AdminModule = () => {
  const { state } = useContext(AppContext);
  const [tab, setTab] = useState("overview");

  const analytics = [
    { label: "Room Utilization", value: Math.round((state.rooms.reduce((a,r)=>a+r.occupied,0)/state.rooms.reduce((a,r)=>a+r.capacity,0))*100), max: 100, color: "#7c3aed" },
    { label: "Payment Collection", value: Math.round((state.payments.filter(p=>p.status==="Paid").length/state.payments.length)*100), max: 100, color: "#10b981" },
    { label: "Cleaning SLA", value: Math.round((state.cleaningRequests.filter(c=>c.status==="Completed").length/state.cleaningRequests.length)*100), max: 100, color: "#3b82f6" },
    { label: "Event Participation", value: 75, max: 100, color: "#f59e0b" },
  ];

  return (
    <div className="animate-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display" style={{ fontSize: 26, fontWeight: 700, marginBottom: 4 }}>Admin Panel</h1>
          <p className="text-muted text-sm">System overview and controls</p>
        </div>
        <button className="btn btn-primary"><Icon name="download" size={16}/>Export Reports</button>
      </div>

      <div className="tabs mb-6" style={{ maxWidth: 480 }}>
        {["overview","users","audit"].map(t => (
          <button key={t} className={`tab ${tab===t?"active":""}`} onClick={() => setTab(t)}>{t.charAt(0).toUpperCase()+t.slice(1)}</button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="animate-in">
          <div className="grid-2 mb-6">
            <div className="card">
              <h3 className="font-semi mb-4" style={{ fontSize: 15 }}>Module Performance</h3>
              {analytics.map(({ label, value, color }) => (
                <div key={label} className="mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span>{label}</span>
                    <span className="font-bold" style={{ color }}>{value}%</span>
                  </div>
                  <div className="bar"><div className="bar-fill" style={{ width: value+"%", background: color }} /></div>
                </div>
              ))}
            </div>
            <div className="card">
              <h3 className="font-semi mb-4" style={{ fontSize: 15 }}>System Stats</h3>
              {[
                ["Registered Students", state.students.length, "#7c3aed"],
                ["Total Rooms", state.rooms.length, "#10b981"],
                ["Active Events", state.events.filter(e=>e.status==="Upcoming").length, "#3b82f6"],
                ["Cleaning Requests", state.cleaningRequests.length, "#f59e0b"],
                ["Sports Items", state.sportsEquipment.reduce((a,e)=>a+e.total,0), "#e94560"],
                ["Mess Subscriptions", state.meals.length, "#533483"],
              ].map(([label, value, color]) => (
                <div key={label} className="flex items-center justify-between py-2" style={{ borderBottom: "1px solid var(--border)" }}>
                  <span className="text-sm">{label}</span>
                  <span className="font-bold" style={{ color, fontSize: 18 }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === "users" && (
        <div className="card animate-in">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semi">System Users</h3>
          </div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>User</th><th>Role</th><th>Status</th><th>Last Active</th><th>Actions</th></tr></thead>
              <tbody>
                {[
                  { name: "Admin User", role: "Admin", email: "admin@hostel.com", status: "Active", last: "Now" },
                  { name: "Warden Singh", role: "Staff", email: "warden@hostel.com", status: "Active", last: "2h ago" },
                  { name: "Cleaner Team", role: "Staff", email: "clean@hostel.com", status: "Active", last: "1d ago" },
                  ...state.students.map(s => ({ name: s.name, role: "Student", email: s.email, status: "Active", last: "Today" }))
                ].map((u, i) => (
                  <tr key={i}>
                    <td><div className="flex items-center gap-2">
                      <Avatar name={u.name} size={32} color={u.role==="Admin"?"#e94560":u.role==="Staff"?"#7c3aed":"#10b981"} />
                      <div><div className="font-medium text-sm">{u.name}</div><div className="text-xs text-muted2">{u.email}</div></div>
                    </div></td>
                    <td><Badge status={u.role} /></td>
                    <td><Badge status={u.status} /></td>
                    <td className="text-sm text-muted">{u.last}</td>
                    <td><button className="btn btn-ghost btn-sm"><Icon name="edit" size={14}/></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "audit" && (
        <div className="card animate-in">
          <h3 className="font-semi mb-4">Audit Log</h3>
          {[
            { action: "Room 402 added", user: "Admin", time: "5 min ago", type: "success" },
            { action: "Student Arjun Sharma payment marked paid", user: "Admin", time: "1h ago", type: "success" },
            { action: "Cleaning request #3 assigned to Ramu Kumar", user: "Warden Singh", time: "2h ago", type: "info" },
            { action: "Event 'Cultural Night' created", user: "Admin", time: "5h ago", type: "success" },
            { action: "Football issued to Vikram Singh", user: "Admin", time: "1d ago", type: "info" },
            { action: "Room 201 occupancy updated", user: "Warden Singh", time: "2d ago", type: "info" },
            { action: "Payment overdue alert sent to Priya Mehta", user: "System", time: "3d ago", type: "alert" },
          ].map((log, i) => (
            <div key={i} className="flex items-start gap-3 py-3" style={{ borderBottom: "1px solid var(--border)" }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: log.type==="success"?"#10b981":log.type==="alert"?"#ef4444":"#3b82f6", marginTop: 6, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div className="text-sm font-medium">{log.action}</div>
                <div className="text-xs text-muted2">{log.user} • {log.time}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────
// NOTIFICATIONS PANEL
// ─────────────────────────────────────────────
const NotificationsPanel = ({ onClose }) => {
  const { state, dispatch } = useContext(AppContext);
  const typeIcons = { alert: { icon: "alert", color: "#ef4444" }, info: { icon: "info", color: "#3b82f6" }, success: { icon: "check", color: "#10b981" } };

  return (
    <div style={{ position: "absolute", top: "64px", right: "16px", width: 320, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-lg)", zIndex: 100, overflow: "hidden" }}>
      <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span className="font-semi">Notifications</span>
        <button className="btn btn-ghost btn-icon btn-sm" onClick={onClose}><Icon name="x" size={16}/></button>
      </div>
      {state.notifications.map(n => {
        const { icon, color } = typeIcons[n.type] || typeIcons.info;
        return (
          <div key={n.id} onClick={() => dispatch({ type: "MARK_NOTIF_READ", payload: n.id })}
            style={{ padding: "12px 18px", borderBottom: "1px solid var(--border)", cursor: "pointer", background: n.read ? "transparent" : "var(--surface2)", display: "flex", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: color+"20", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Icon name={icon} size={15} color={color} />
            </div>
            <div>
              <div className="text-sm">{n.text}</div>
              <div className="text-xs text-muted2 mt-1">{n.time}</div>
            </div>
            {!n.read && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#e94560", marginLeft: "auto", flexShrink: 0, marginTop: 6 }} />}
          </div>
        );
      })}
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
  const unreadCount = state.notifications.filter(n => !n.read).length;

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

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      <style>{STYLES}</style>
      <div className="layout">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="sidebar-logo">
            <div className="font-display" style={{ fontSize: 20, fontWeight: 700, color: "#fff", marginBottom: 2 }}>
              🏠 HostelPro
            </div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>Management System v2.0</div>
          </div>

          <div style={{ padding: "12px 0", flex: 1 }}>
            <div className="nav-section">Main</div>
            {navItems.slice(0, 4).map(item => (
              <div key={item.id} className={`nav-item ${state.activeModule === item.id ? "active" : ""}`}
                onClick={() => dispatch({ type: "SET_MODULE", payload: item.id })}>
                <Icon name={item.icon} size={17} />
                <span>{item.label}</span>
                {item.id === "payments" && state.payments.filter(p=>p.status==="Overdue").length > 0 && (
                  <span style={{ marginLeft: "auto", background: "#e94560", color: "#fff", borderRadius: 10, padding: "1px 7px", fontSize: 11, fontWeight: 700 }}>
                    {state.payments.filter(p=>p.status==="Overdue").length}
                  </span>
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

          {/* User Profile */}
          <div style={{ padding: "12px 16px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
            <div className="flex items-center gap-2">
              <Avatar name={state.currentUser.name} size={36} color="#e94560" />
              <div style={{ flex: 1, overflow: "hidden" }}>
                <div className="text-sm font-semi truncate" style={{ color: "#fff" }}>{state.currentUser.name}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{state.currentUser.role}</div>
              </div>
              <button className="btn btn-ghost btn-icon" style={{ color: "rgba(255,255,255,0.4)" }} title="Logout">
                <Icon name="logout" size={16} />
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="main">
          {/* Topbar */}
          <div className="topbar">
            <div className="flex items-center gap-3">
              <div style={{ fontSize: 14, color: "var(--text3)" }}>
                {navItems.find(n => n.id === state.activeModule)?.label}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="search-bar" style={{ maxWidth: 240 }}>
                <Icon name="search" size={15} color="var(--text3)" />
                <input placeholder="Quick search..." />
              </div>

              <div style={{ position: "relative" }}>
                <button className="btn btn-ghost btn-icon" onClick={() => setShowNotif(!showNotif)}>
                  <Icon name="bell" size={18} />
                  {unreadCount > 0 && <div className="notif-dot" />}
                </button>
                {showNotif && <NotificationsPanel onClose={() => setShowNotif(false)} />}
              </div>

              <div className="flex items-center gap-2" style={{ paddingLeft: 8, borderLeft: "1px solid var(--border)" }}>
                <Avatar name={state.currentUser.name} size={32} color="#e94560" />
                <div style={{ lineHeight: 1.3 }}>
                  <div className="text-sm font-medium">{state.currentUser.name}</div>
                  <div className="text-xs text-muted2 capitalize">{state.currentUser.role}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Page Content */}
          <div className="content">
            {moduleComponents[state.activeModule] || <Dashboard />}
          </div>
        </main>

        {/* Toast */}
        {state.toast && (
          <div className="toast">
            <Icon name={state.toast.type === "success" ? "check" : "info"} size={16} color={state.toast.type === "success" ? "#10b981" : "#3b82f6"} />
            {state.toast.text}
          </div>
        )}
      </div>
    </AppContext.Provider>
  );
}
