import React, { useState, useEffect } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#a4de6c', '#d0ed57', '#8dd1e1'];

const StatCard = ({ title, value, icon, color }) => (
  <div className={`stat-card ${color}`}>
    <div className="stat-icon">{icon}</div>
    <div className="stat-value">{value}</div>
    <div className="stat-title">{title}</div>
  </div>
);

export default function DashboardPage({ user }) {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("http://localhost:5001/api/dashboard-stats");
        const data = await response.json();
        if (data.success) {
          setStats(data.stats);
        } else {
          setError("Failed to load dashboard stats.");
        }
      } catch (err) {
        setError("Failed to connect to the server.");
      }
    };
    fetchStats();
  }, []);

  if (error) {
    return <div className="dashboard-error">{error}</div>;
  }

  if (!stats) {
    return <div className="dashboard-loading">Loading dashboard...</div>;
  }

  const chartData = Object.keys(stats.documentsByCategory).map((key, idx) => ({
    name: key,
    value: stats.documentsByCategory[key],
    color: COLORS[idx % COLORS.length],
  }));

  return (
    <div className="dashboard-page">
      <h1 className="dashboard-main-title">Dashboard</h1>
      <div className="stats-grid">
        <StatCard title="Total Documents" value={stats.documentCount} icon={<i className="fa fa-file-alt"></i>} color="blue" />
        {user.role === "Admin" && (
          <StatCard title="Total Users" value={stats.userCount} icon={<i className="fa fa-users"></i>} color="green" />
        )}
        <StatCard title="Recent Uploads (5)" value={stats.recentUploads.length} icon={<i className="fa fa-history"></i>} color="purple" />
      </div>

      <div className="dashboard-section">
        <h2 className="section-title">Documents by Category</h2>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="dashboard-section">
        <h2 className="section-title">Recent Uploads</h2>
        <ul className="recent-uploads-list">
          {stats.recentUploads.map(doc => (
            <li key={doc.id} className="recent-upload-item">
              <span className="upload-title">{doc.title}</span>
              <span className="upload-by">by {doc.uploadedBy}</span>
              <span className="upload-date">{new Date(doc.uploadedAt).toLocaleDateString()}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
} 