import React, { useState } from "react";

export default function Register({ onRegister, onBackToLogin }) {
  const [form, setForm] = useState({ 
    username: "", 
    password: "", 
    confirmPassword: "",
    role: "" // Start with empty selection
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validation
    if (!form.username || !form.password || !form.confirmPassword || !form.role) {
      setError("All fields are required");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    try {
      const response = await fetch("http://localhost:5001/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.username,
          password: form.password,
          role: form.role
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess("Registration successful! You can now login.");
        setForm({ username: "", password: "", confirmPassword: "", role: "" });
        setTimeout(() => {
          onBackToLogin();
        }, 2000);
      } else {
        setError(data.error || "Registration failed");
      }
    } catch (err) {
      setError("Server error. Please try again later.");
    }
  };

  return (
    <div className="login-page-background">
      <form className="login-form-glass" onSubmit={handleSubmit}>
        <h2 className="login-title">Register</h2>
        
        <div className="login-input-group">
          <input
            className="login-input-glass"
            name="username"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
            autoComplete="username"
          />
          <span className="login-input-icon"><i className="fa fa-user" /></span>
        </div>
        
        <div className="login-input-group">
          <input
            className="login-input-glass"
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            autoComplete="new-password"
          />
          <span className="login-input-icon"><i className="fa fa-lock" /></span>
        </div>

        <div className="login-input-group">
          <input
            className="login-input-glass"
            name="confirmPassword"
            type="password"
            placeholder="Confirm Password"
            value={form.confirmPassword}
            onChange={handleChange}
            autoComplete="new-password"
          />
          <span className="login-input-icon"><i className="fa fa-lock" /></span>
        </div>

        <div className="login-input-group">
          <select
            className="login-input-glass"
            name="role"
            value={form.role}
            onChange={handleChange}
            required
          >
            <option value="" disabled>Select Role</option>
            <option value="Staff">Staff</option>
            <option value="Viewer">Viewer</option>
          </select>
          <span className="login-input-icon"><i className="fa fa-users" /></span>
        </div>

        {error && <div className="login-error">{error}</div>}
        {success && <div className="login-success">{success}</div>}
        
        <button className="login-btn-glass" type="submit">Register</button>
        
        <div className="login-register-row">
          Already have an account? 
          <button 
            type="button" 
            className="login-register-link"
            onClick={onBackToLogin}
          >
            Login
          </button>
        </div>
      </form>
    </div>
  );
} 