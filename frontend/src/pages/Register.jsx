import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./register.css";
import apiClient from "../api/apiClient";

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "USER",
    registrationCode: "",
  });

  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password.length < 6) {
      setSuccess(false);
      setMessage("Password must be at least 6 characters.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setSuccess(false);
      setMessage("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const response = await apiClient.post("/users/register", {
        name: formData.username,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        registrationCode: formData.registrationCode,
      });

      setSuccess(true);
      setMessage(response.data.message || "Registration successful!");

      setFormData({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "USER",
        registrationCode: "",
      });

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error) {
      setSuccess(false);
      setMessage(
        error.response?.data?.message ||
          "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <div className="register-header">
          <h2>Create Account</h2>
          <p>Join our job portal and start your career journey</p>
        </div>

        <form onSubmit={handleSubmit} className="register-form">
          <div className="input-group">
            <label>Full Name</label>
            <input
              type="text"
              name="username"
              placeholder="Enter your full name"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="Create password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label>Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          <p className="login-link" style={{ marginTop: "-6px" }}>
            New accounts are created as job seekers by default.
          </p>

          <div className="input-group">
            <label>
              <input
                type="checkbox"
                checked={formData.role === "RECRUITER"}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    role: e.target.checked ? "RECRUITER" : "USER",
                    registrationCode: e.target.checked ? prev.registrationCode : "",
                  }))
                }
                style={{ width: "auto", marginRight: "8px" }}
              />
              Register as recruiter
            </label>
          </div>

          {formData.role === "RECRUITER" && (
            <div className="input-group">
              <label>Recruiter Invite Code</label>
              <input
                type="password"
                name="registrationCode"
                placeholder="Enter invite code"
                value={formData.registrationCode}
                onChange={handleChange}
                required={formData.role === "RECRUITER"}
              />
            </div>
          )}

          <button type="submit" className="register-btn" disabled={loading}>
            {loading ? "Creating Account..." : "Register"}
          </button>

          {message && (
            <p className={success ? "msg success" : "msg error"}>
              {message}
            </p>
          )}

          <p className="login-link">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;