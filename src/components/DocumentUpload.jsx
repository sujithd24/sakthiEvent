import React, { useRef, useState } from "react";

export default function DocumentUpload({ user, onUpload }) {
  const [file, setFile] = useState(null);
  const [meta, setMeta] = useState({ title: "", category: "Normal File", description: "", status: "", logs: "" });
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const inputRef = useRef();

  const handleDrop = e => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.size > 5 * 1024 * 1024) {
      setError("File size exceeds 5MB limit.");
      setFile(null);
      return;
    }
    setError("");
    setFile(droppedFile);
  };

  const handleChange = e => setMeta({ ...meta, [e.target.name]: e.target.value });

  const handleFileChange = e => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.size > 5 * 1024 * 1024) {
      setError("File size exceeds 5MB limit.");
      setFile(null);
      return;
    }
    setError("");
    setFile(selectedFile);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setProgress(0);
    setError("");
    if (!file) {
      setError("Please select a file to upload.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("File size exceeds 5MB limit.");
      return;
    }

    try {
      // Convert file to base64 for demo purposes
      // In a real app, you'd use FormData and proper file upload
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const fileData = reader.result;
        
        // Simulate upload progress
        const interval = setInterval(() => {
          setProgress(p => {
            if (p >= 90) {
              clearInterval(interval);
              return 90;
            }
            return p + 10;
          });
        }, 200);

        try {
          const response = await fetch("http://localhost:5001/api/documents", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...meta,
              file: fileData,
              uploadedBy: user.username,
              logs: meta.logs ? meta.logs.split('\n') : [],
            }),
          });

          const data = await response.json();
          
          if (data.success) {
            setProgress(100);
            setTimeout(() => {
              setFile(null);
              setMeta({ title: "", category: "Normal File", description: "", status: "", logs: "" });
              setProgress(0);
              if (onUpload) onUpload(data.document);
            }, 500);
          } else {
            console.error("Backend upload error:", data.message);
            setError(data.message || "Upload failed from backend");
            setProgress(0);
          }
        } catch (err) {
          console.error("Fetch/upload error:", err);
          setError("Upload failed due to a network or server error.");
          setProgress(0);
        }

        clearInterval(interval);
      };
    } catch (err) {
      setError("File reading failed. Please try again.");
      setProgress(0);
    }
  };

  return (
    <form className="doc-upload-form" onSubmit={handleUpload}>
      <h2 className="doc-upload-title">Upload Document</h2>
      <div
        className="doc-upload-drop"
        onDrop={handleDrop}
        onDragOver={e => e.preventDefault()}
        onClick={() => inputRef.current.click()}
      >
        {file ? (
          <span className="doc-upload-filename">{file.name}</span>
        ) : (
          <span className="doc-upload-placeholder">Drag & drop a file here, or click to select</span>
        )}
        <input
          type="file"
          className="doc-upload-input"
          ref={inputRef}
          onChange={handleFileChange}
        />
      </div>
      {error && <div className="doc-upload-error">{error}</div>}
      <input
        className="doc-upload-input-text"
        name="title"
        placeholder="Title"
        value={meta.title}
        onChange={handleChange}
        required
      />
      <select
        className="doc-upload-input-text"
        name="category"
        value={meta.category}
        onChange={e => {
          setMeta({ ...meta, category: e.target.value, status: "" });
        }}
        required
      >
        <option value="Normal File">Normal File</option>
        <option value="Embedded System Design">Embedded System Design</option>
      </select>
      {meta.category === "Embedded System Design" ? (
        <select
          className="doc-upload-input-text"
          name="status"
          value={meta.status}
          onChange={handleChange}
          required
        >
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
        <input
          className="doc-upload-input-text"
          name="status"
          placeholder="Status (e.g., active, archived, etc.)"
          value={meta.status}
          onChange={handleChange}
          required
        />
      )}
      <textarea
        className="doc-upload-input-text"
        name="logs"
        placeholder="Logs (optional, plain text)"
        value={meta.logs}
        onChange={handleChange}
      />
      <textarea
        className="doc-upload-input-text"
        name="description"
        placeholder="Description"
        value={meta.description}
        onChange={handleChange}
        required
      />
      {progress > 0 && (
        <div className="doc-upload-progress-bar-bg">
          <div
            className="doc-upload-progress-bar"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
      <button
        className="doc-upload-btn"
        disabled={!file}
      >
        Upload
      </button>
    </form>
  );
} 