import React, { useEffect, useState } from "react";
import "./Sidebar.css";
import { useNavigate, useLocation } from "react-router-dom";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [role, setRole] = useState("USER");
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    const storedRole = localStorage.getItem("role");

    if (!storedRole || storedRole === "null" || storedRole === "") {
      localStorage.setItem("role", "USER");
      setRole("USER");
    } else {
      setRole(storedRole);
    }
  }, []);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!isMobileOpen) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileOpen]);

  const isActive = (path) => location.pathname === path;

  const goTo = (path) => {
    navigate(path);
    setIsMobileOpen(false);
  };

  return (
    <>
      <button
        className="sidebar-toggle"
        type="button"
        onClick={() => setIsMobileOpen((prev) => !prev)}
        aria-label="Toggle navigation menu"
        aria-expanded={isMobileOpen}
      >
        {isMobileOpen ? "✕" : "☰"} Menu
      </button>

      <div
        className={`sidebar-overlay ${isMobileOpen ? "show" : ""}`}
        onClick={() => setIsMobileOpen(false)}
      />

      <aside className={`sidebar ${isMobileOpen ? "mobile-open" : ""}`}>
        <div className="sidebar-title">Navigation</div>

        <div
          className={`sidebar-item ${isActive("/dashboard") ? "active" : ""}`}
          onClick={() => goTo("/dashboard")}
        >
          🏠 Dashboard
        </div>

        {role === "USER" && (
          <>
            <div
              className={`sidebar-item ${isActive("/jobs") ? "active" : ""}`}
              onClick={() => goTo("/jobs")}
            >
              💼 Jobs
            </div>

            <div
              className={`sidebar-item ${
                isActive("/my-applications") ? "active" : ""
              }`}
              onClick={() => goTo("/my-applications")}
            >
              📄 My Applications
            </div>
          </>
        )}

        {role === "RECRUITER" && (
          <>
            <div
              className={`sidebar-item ${isActive("/post-job") ? "active" : ""}`}
              onClick={() => goTo("/post-job")}
            >
              ➕ Post Job
            </div>

            <div
              className={`sidebar-item ${isActive("/my-jobs") ? "active" : ""}`}
              onClick={() => goTo("/my-jobs")}
            >
              📋 My Jobs
            </div>
          </>
        )}

        <div
          className={`sidebar-item ${isActive("/profile") ? "active" : ""}`}
          onClick={() => goTo("/profile")}
        >
          👤 Profile
        </div>
      </aside>
    </>
  );
};

export default Sidebar;