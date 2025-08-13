import React, { useState, useEffect } from "react";

export default function AuditLogViewer() {
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await fetch("http://localhost:5001/api/audit-logs");
        const data = await response.json();
        if (data.success) {
          setLogs(data.logs);
        } else {
          setError("Failed to load audit log");
        }
      } catch (err) {
        setError("Failed to connect to server");
      }
    };
    fetchLogs();
  }, []);

  const filtered = logs.filter(
    log =>
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.user.toLowerCase().includes(search.toLowerCase()) ||
      log.doc.toLowerCase().includes(search.toLowerCase()) ||
      (log.status || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-3xl mx-auto mt-8">
      <h2 className="text-xl font-bold mb-4">Audit Log</h2>
      <input
        className="w-full mb-2 p-2 border rounded"
        placeholder="Search logs..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <table className="w-full bg-white rounded shadow">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2">Action</th>
            <th className="p-2">User</th>
            <th className="p-2">Document</th>
            <th className="p-2">Status</th>
            <th className="p-2">Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((log, idx) => (
            <tr key={idx} className="border-t">
              <td className="p-2">{log.action}</td>
              <td className="p-2">{log.user}</td>
              <td className="p-2">{log.doc}</td>
              <td className="p-2">{log.status || ''}</td>
              <td className="p-2">{new Date(log.timestamp).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 