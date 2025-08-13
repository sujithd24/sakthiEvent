import React, { useState } from "react";

export default function Login({ onLogin, onShowRegister }) {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const fpAlert = () => {
    window.alert("Contact Admin to change Password.\nAdmin contact : kavya.al23@bitsathy.ac.in");
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("http://localhost:5001/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (data.success) {
        onLogin(data.user);
      } else {
        setError(data.message || "Invalid credentials");
      }
    } catch (err) {
      setError("Server error. Please try again later.");
    }
  };

  return (
    <div className="login-page-background">
      <form className="login-form-glass" onSubmit={handleSubmit}>
        <h2 className="login-title">Login</h2>
        
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
            autoComplete="current-password"
          />
          <span className="login-input-icon"><i className="fa fa-lock" /></span>
        </div>

        {error && <div className="login-error">{error}</div>}
        
        <div className="login-options-row">
          <label className="login-remember">
            <input type="checkbox" /> Remember me
          </label>
          <a href="#" onClick={fpAlert} className="login-forgot">Forgot password?</a>
        </div>
        
        <button className="login-btn-glass">Login</button>
        
        <div className="login-register-row">
          Don't have an account? 
          <button 
            type="button" 
            className="login-register-link"
            onClick={onShowRegister}
          >
            Register
          </button>
        </div>
      </form>
    </div>
  );
} 