import React, { useEffect, useState } from 'react';
import './Dashboard.css';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Card from '../components/Card';
import apiClient from '../api/apiClient';
import { useNavigate } from 'react-router-dom';

const Dashboard = ({ setIsLoggedIn }) => {
  const navigate = useNavigate();

  const [userName, setUserName] = useState('');
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(true);
  const normalizeRole = (role) =>
  role?.replace("ROLE_", "").toUpperCase();

  const [stats, setStats] = useState({
  appliedJobs: 0,
  availableJobs: 0,
  profilePercentage: 0,
  savedJobs: 0,
  myJobs: 0,
  applications: 0,
  jobs: 0,
  candidates: 0
});

  useEffect(() => {
    const name = localStorage.getItem("username") || "User";
    setUserName(name);

    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    apiClient.get("/api/dashboard")
      .then(res => {
        console.log("API Response:", res.data);
        const roleFromApi = normalizeRole(res.data.role);
        setRole(roleFromApi);

        if (roleFromApi === "USER") {
          setStats({
            appliedJobs: res.data.appliedJobs || 0,
            availableJobs: res.data.availableJobs || 0,
            profilePercentage: res.data.profileCompletion || 0,
            savedJobs: res.data.savedJobs || 0,
            myJobs: 0,
            applications: 0,
            jobs: 0,
            candidates: 0
          });
        } 
        else if (roleFromApi === "RECRUITER") {
          setStats({
            appliedJobs: 0,
            availableJobs: 0,
            profilePercentage: res.data.profileCompletion || 0,
            savedJobs: 0,
            myJobs: res.data.myJobs || 0,
            applications: res.data.applications || 0,
            jobs: res.data.jobs || 0,
            candidates: res.data.candidates || 0
          });
        }
      })
      .catch(err => {
        console.error("Error fetching dashboard data:", err);
        if (err.response && err.response.status === 403) {
          console.error("Access forbidden: Invalid or expired token.");
          localStorage.clear();
          setIsLoggedIn(false);
          navigate("/login");
        } else {
          setStats({
            appliedJobs: 0,
            availableJobs: 0,
            profilePercentage: 0,
            savedJobs: 0,
            myJobs: 0,
            applications: 0,
            jobs: 0,
            candidates: 0
          });
        }
      })
      .finally(() => setLoading(false));
  }, [navigate, setIsLoggedIn]);

  const getLogo = (logoName) => {
    const availableLogos = ["cognizant.jpg", "default.jpg", "ltmindtree.jpg", "ltmindtree.png", "tcs.jpg"];
    return availableLogos.includes(logoName) ? logoName : "default.jpg";
  };

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    navigate("/");
  };

  return (
    <div className="dashboard-container">
      <Navbar onLogout={handleLogout} />

      <div className="dashboard-layout">
        <Sidebar />

        <div className="dashboard-main">

          {/* HERO */}
          <div className="dashboard-hero">
            <h2>Welcome back, {userName} 👋</h2>
            <p>
              {role === "RECRUITER"
                ? "Manage your job posts and applicants"
                : "Find and track your job applications"}
            </p>
          </div>

          {loading ? (
            <div className="loading-box">Loading dashboard...</div>
          ) : (
            <div className="card-grid">

              {role === "USER" && (
                <>
                  <Card title="Applied Jobs" number={stats.appliedJobs} icon="📄" />
                  <Card title="Available Jobs" number={stats.availableJobs} icon="💼" />
                  <Card title="Profile Status" number={`${stats.profilePercentage}%`} icon="👤" />
                  <Card title="Saved Jobs" number={stats.savedJobs} icon="⭐" />
                </>
              )}

              {role === "RECRUITER" && (
                <>
                  <Card title="My Jobs" number={stats.myJobs} icon="📌" />
                  <Card title="Applications" number={stats.applications} icon="📄" />
                  <Card title="Active Jobs" number={stats.jobs} icon="💼" />
                  <Card title="Candidates" number={stats.candidates} icon="👥" />
                  <Card title="Profile Status" number={`${stats.profilePercentage}%`} icon="👤" />
                </>
              )}

            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Dashboard;