import React from "react";

export default function Dashboard({ user, onLogout, setView }) {
  const menu = [
    { label: "Dashboard", view: "dashboard" },
    { label: "Documents", view: "documents" },
    { label: "Upload", view: "upload", roles: ["Admin", "Staff"] },
    { label: "Audit Log", view: "audit", roles: ["Admin"] },
  ];
  return (
    <div className="dashboard-header">
      <div className="dashboard-title">DDRM – SH18</div>
      <div className="dashboard-menu">
        {menu
          .filter(item => !item.roles || item.roles.includes(user.role))
          .map(item => (
            <button
              key={item.view}
              className="dashboard-menu-btn"
              onClick={() => setView(item.view)}
            >
              {item.label}
            </button>
          ))}
      </div>
      <div className="dashboard-user">
        <span className="dashboard-role">{user.role}</span>
        <button onClick={onLogout} className="dashboard-logout-btn">
          Logout
        </button>
      </div>
    </div>
  );
} 