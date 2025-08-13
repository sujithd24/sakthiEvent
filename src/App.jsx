import React, { useState } from "react";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import DocumentUpload from "./components/DocumentUpload";
import DocumentTable from "./components/DocumentTable";
import AuditLogViewer from "./components/AuditLogViewer";
import DashboardPage from "./components/DashboardPage";

export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState("dashboard");
  const [documentUpdateTrigger, setDocumentUpdateTrigger] = useState(0);
  const [showRegister, setShowRegister] = useState(false);

  if (!user) {
    if (showRegister) {
      return <Register onRegister={setUser} onBackToLogin={() => setShowRegister(false)} />;
    }
    return <Login onLogin={setUser} onShowRegister={() => setShowRegister(true)} />;
  }

  const handleDocumentUpload = () => {
    // Increment trigger to force DocumentTable to refresh
    setDocumentUpdateTrigger(prev => prev + 1);
    // Switch to documents view after successful upload
    setView("documents");
  };

  return (
    <div className="app-background">
      <Dashboard user={user} onLogout={() => setUser(null)} setView={setView} />
      <div className="p-6">
        {view === "dashboard" && <DashboardPage user={user} />}
        {view === "documents" && (
          <DocumentTable 
            user={user} 
            key={documentUpdateTrigger} // Force refresh when documents update
          />
        )}
        {view === "upload" && (
          <DocumentUpload 
            user={user}
            onUpload={handleDocumentUpload}
          />
        )}
        {view === "audit" && <AuditLogViewer />}
      </div>
    </div>
  );
} 