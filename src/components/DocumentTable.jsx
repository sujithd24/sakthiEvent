import React, { useState, useEffect } from "react";
import MetadataModal from "./MetadataModal";
import VersionHistoryModal from "./VersionHistoryModal";

export default function DocumentTable({ user }) {
  const [documents, setDocuments] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState({ category: "", user: "" });
  const [metaOpen, setMetaOpen] = useState(false);
  const [versionOpen, setVersionOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [error, setError] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [editDoc, setEditDoc] = useState(null);

  // Handle preview
  const handlePreview = (doc) => {
    setSelectedDoc(doc);
    setPreviewOpen(true);
  };

  // Function to get file type from base64
  const getFileType = (base64String) => {
    const match = base64String.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,/);
    return match ? match[1] : '';
  };

  // Preview Modal Component
  const PreviewModal = ({ open, onClose, document }) => {
    if (!open || !document) return null;

    const fileType = getFileType(document.file);
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl p-6 relative max-h-[90vh] overflow-auto">
          <button 
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl font-bold"
            onClick={onClose}
          >
            ×
          </button>
          <h2 className="text-xl font-semibold mb-4">Preview: {document.title}</h2>
          <div className="preview-content">
            {fileType.startsWith('image/') ? (
              <img 
                src={document.file} 
                alt={document.title}
                className="max-w-full h-auto"
              />
            ) : fileType.startsWith('text/') || fileType.includes('pdf') ? (
              <iframe
                src={document.file}
                title={document.title}
                className="w-full h-[70vh] border-0"
              />
            ) : (
              <div className="text-center p-4">
                <p>Preview not available for this file type ({fileType})</p>
                <a 
                  href={document.file}
                  download={document.title}
                  className="text-blue-500 hover:text-blue-700 underline mt-2 inline-block"
                >
                  Download to view
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Edit modal logic
  const handleEdit = (doc) => {
    setEditDoc({ ...doc, logs: (doc.logs || []).join('\n') });
    setEditOpen(true);
  };
  const handleEditChange = e => {
    setEditDoc({ ...editDoc, [e.target.name]: e.target.value });
  };
  const handleEditSave = async () => {
    try {
      const response = await fetch(`http://localhost:5001/api/documents/${editDoc.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editDoc.title,
          category: editDoc.category,
          description: editDoc.description,
          status: editDoc.status,
          logs: editDoc.logs ? editDoc.logs.split('\n') : [],
          user: user.username,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setEditOpen(false);
        setEditDoc(null);
        fetchDocuments();
      } else {
        alert(data.message || "Failed to update document");
      }
    } catch (err) {
      alert("Failed to connect to server");
    }
  };

  // Fetch documents from backend
  const fetchDocuments = async () => {
    try {
      const response = await fetch("http://localhost:5001/api/documents");
      const data = await response.json();
      
      if (data.success) {
        setDocuments(data.documents);
      } else {
        setError("Failed to load documents");
      }
    } catch (err) {
      setError("Failed to connect to server");
    }
  };

  // Delete document
  const handleDelete = async (docId) => {
    if (!window.confirm("Are you sure you want to delete this document?")) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5001/api/documents/${docId}?role=${user.role}&user=${user.username}`, {
        method: "DELETE"
      });
      
      const data = await response.json();
      
      if (data.success) {
        fetchDocuments(); // Refresh the list
      } else {
        setError(data.message || "Failed to delete document");
      }
    } catch (err) {
      setError("Failed to connect to server");
    }
  };

  // Fetch documents on component mount
  useEffect(() => {
    fetchDocuments();
  }, []);

  const filteredDocs = documents.filter(doc =>
    doc.title.toLowerCase().includes(search.toLowerCase()) &&
    (!filter.category || doc.category === filter.category) &&
    (!filter.user || doc.uploadedBy === filter.user)
  );

  const categories = [...new Set(documents.map(d => d.category))];
  const users = [...new Set(documents.map(d => d.uploadedBy))];

  return (
    <div className="doc-table-container">
      {error && <div className="doc-table-error">{error}</div>}
      <div className="doc-table-filters">
        <input
          className="doc-table-input"
          placeholder="Search documents..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select
          className="doc-table-select"
          value={filter.category}
          onChange={e => setFilter(f => ({ ...f, category: e.target.value }))}
        >
          <option value="">All Categories</option>
          {categories.map(c => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <select
          className="doc-table-select"
          value={filter.user}
          onChange={e => setFilter(f => ({ ...f, user: e.target.value }))}
        >
          <option value="">All Users</option>
          {users.map(u => (
            <option key={u}>{u}</option>
          ))}
        </select>
      </div>
      <table className="doc-table">
        <thead>
          <tr className="doc-table-header-row">
            <th className="doc-table-header">Title</th>
            <th className="doc-table-header">Category</th>
            <th className="doc-table-header">Uploaded By</th>
            <th className="doc-table-header">Date</th>
            <th className="doc-table-header">Status</th>
            <th className="doc-table-header">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredDocs.map(doc => (
            <tr key={doc.id} className="doc-table-row">
              <td className="doc-table-cell">{doc.title}</td>
              <td className="doc-table-cell">{doc.category}</td>
              <td className="doc-table-cell">{doc.uploadedBy}</td>
              <td className="doc-table-cell">{new Date(doc.uploadedAt).toLocaleDateString()}</td>
              <td className="doc-table-cell">{doc.status || 'active'}</td>
              <td className="doc-table-actions">
                <button
                  className="doc-table-action-btn doc-table-action-metadata"
                  onClick={() => {
                    setSelectedDoc(doc);
                    setMetaOpen(true);
                  }}
                >
                  Metadata
                </button>
                <button
                  className="doc-table-action-btn doc-table-action-versions"
                  onClick={() => {
                    setSelectedDoc(doc);
                    setVersionOpen(true);
                  }}
                >
                  Versions
                </button>
                <button 
                  className="doc-table-action-btn doc-table-action-preview"
                  onClick={() => handlePreview(doc)}
                >
                  Preview
                </button>
                <button 
                  className="doc-table-action-btn doc-table-action-download"
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = doc.file;
                    link.download = doc.title;
                    link.click();
                  }}
                >
                  Download
                </button>
                {user.role === "Admin" || user.role === "Staff" ? (
                  <button
                    className="doc-table-action-btn doc-table-action-edit"
                    onClick={() => handleEdit(doc)}
                  >
                    Edit
                  </button>
                ) : null}
                {user.role === "Admin" && (
                  <>
                    <button 
                      className="doc-table-action-btn doc-table-action-delete"
                      onClick={() => handleDelete(doc.id)}
                    >
                      Delete
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <MetadataModal
        open={metaOpen}
        onClose={() => setMetaOpen(false)}
        doc={selectedDoc}
      />
      <VersionHistoryModal
        open={versionOpen}
        onClose={() => setVersionOpen(false)}
        versions={selectedDoc?.versions || []}
      />
      <PreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        document={selectedDoc}
      />
      {/* Edit Modal */}
      {editOpen && editDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 relative">
            <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl font-bold" onClick={() => setEditOpen(false)}>×</button>
            <h2 className="text-xl font-semibold mb-4">Edit Document</h2>
            <div className="mb-3">
              <label className="block mb-1 font-semibold">Title</label>
              <input className="w-full p-2 border rounded" name="title" value={editDoc.title} onChange={handleEditChange} />
            </div>
            <div className="mb-3">
              <label className="block mb-1 font-semibold">Description</label>
              <textarea className="w-full p-2 border rounded" name="description" value={editDoc.description} onChange={handleEditChange} />
            </div>
            <div className="mb-3">
              <label className="block mb-1 font-semibold">Status</label>
              {editDoc.category === "Embedded System Design" ? (
                <select className="w-full p-2 border rounded" name="status" value={editDoc.status} onChange={handleEditChange}>
                  <option value="">Select Step</option>
                  <option value="Requirement Analysis">Requirement Analysis</option>
                  <option value="System Specification">System Specification</option>
                  <option value="Architecture Design">Architecture Design</option>
                  <option value="Hardware/Software Partitioning">Hardware/Software Partitioning</option>
                  <option value="Detailed Design">Detailed Design</option>
                  <option value="Implementation">Implementation</option>
                  <option value="Testing & Validation">Testing & Validation</option>
                </select>
              ) : (
                <input className="w-full p-2 border rounded" name="status" value={editDoc.status} onChange={handleEditChange} />
              )}
            </div>
            <div className="mb-3">
              <label className="block mb-1 font-semibold">Logs</label>
              <textarea className="w-full p-2 border rounded" name="logs" value={editDoc.logs} onChange={handleEditChange} />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300" onClick={() => setEditOpen(false)}>Cancel</button>
              <button className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700" onClick={handleEditSave}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 