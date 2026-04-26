import { useState } from "react";
import { Link } from "react-router-dom";
import "./login.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    // Password reset backend endpoint is not available yet.
    setMessage(
      "If this email is registered, password reset instructions will be sent once reset service is enabled."
    );
  };

  return (
    <div className="login-page">
      <Link to="/login" className="back-btn">
        ← Back to Login
      </Link>

      <div className="login-container">
        <div className="login-header">
          <h2>Forgot Password</h2>
          <p>Enter your email to reset your password</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {message && <p className="error-msg">{message}</p>}

          <button type="submit" className="login-btn">
            Send Reset Link
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
