import React, { useEffect, useState } from "react";
import "./Sidebar.css";
import { useNavigate, useLocation } from "react-router-dom";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [role, setRole] = useState("USER");

  useEffect(() => {
    const storedRole = localStorage.getItem("role");

    if (!storedRole || storedRole === "null" || storedRole === "") {
      localStorage.setItem("role", "USER");
      setRole("USER");
    } else {
      setRole(storedRole);
    }
  }, []);

  const isActive = (path) => location.pathname === path;

  return (
    <div className="sidebar">
      <div className="sidebar-title">Navigation</div>

      <div
        className={`sidebar-item ${isActive("/dashboard") ? "active" : ""}`}
        onClick={() => navigate("/dashboard")}
      >
        🏠 Dashboard
      </div>

      {role === "USER" && (
        <>
          <div
            className={`sidebar-item ${isActive("/jobs") ? "active" : ""}`}
            onClick={() => navigate("/jobs")}
          >
            💼 Jobs
          </div>

          <div
            className={`sidebar-item ${
              isActive("/my-applications") ? "active" : ""
            }`}
            onClick={() => navigate("/my-applications")}
          >
            📄 My Applications
          </div>
        </>
      )}

      {role === "RECRUITER" && (
        <>
          <div
            className={`sidebar-item ${isActive("/post-job") ? "active" : ""}`}
            onClick={() => navigate("/post-job")}
          >
            ➕ Post Job
          </div>

          <div
            className={`sidebar-item ${isActive("/my-jobs") ? "active" : ""}`}
            onClick={() => navigate("/my-jobs")}
          >
            📋 My Jobs
          </div>
        </>
      )}

      <div
        className={`sidebar-item ${isActive("/profile") ? "active" : ""}`}
        onClick={() => navigate("/profile")}
      >
        👤 Profile
      </div>
    </div>
  );
};

export default Sidebar;