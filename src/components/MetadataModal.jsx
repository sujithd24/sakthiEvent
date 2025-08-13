import React from "react";
import Modal from "./Modal";

export default function MetadataModal({ open, onClose, doc }) {
  if (!doc) return null;
  return (
    <Modal open={open} onClose={onClose} title="Document Metadata">
      <div>
        <div><b>Title:</b> {doc.title}</div>
        <div><b>Category:</b> {doc.category}</div>
        <div><b>Description:</b> {doc.description}</div>
        <div><b>Status:</b> {doc.status || 'active'}</div>
        <div><b>Uploaded By:</b> {doc.uploadedBy}</div>
        <div><b>Date:</b> {doc.uploadedAt}</div>
        {doc.logs && doc.logs.length > 0 && (
          <div style={{ marginTop: '1em' }}>
            <b>Logs:</b>
            <pre style={{ background: '#f4f4f4', padding: '0.5em', borderRadius: '6px', maxHeight: '200px', overflow: 'auto' }}>{doc.logs.join('\n')}</pre>
          </div>
        )}
      </div>
    </Modal>
  );
} 