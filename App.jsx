import React, { useState } from "react";
import Login from "./src/components/Login";
import Dashboard from "./src/components/Dashboard";
import DocumentUpload from "./src/components/DocumentUpload";
import DocumentTable from "./src/components/DocumentTable";
import AuditLogViewer from "./src/components/AuditLogViewer";

export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState("documents");

  if (!user) return <Login onLogin={setUser} />;

  return (
    <div>
      <Dashboard user={user} onLogout={() => setUser(null)} setView={setView} />
      <div className="p-6">
        {view === "documents" && <DocumentTable user={user} />}
        {view === "upload" && <DocumentUpload onUpload={() => alert("Uploaded!")} />}
        {view === "audit" && <AuditLogViewer />}
      </div>
    </div>
  );
} 