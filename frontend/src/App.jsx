import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";

import Home from "./pages/Home";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Jobs from "./pages/Jobs";
import Profile from "./pages/Profile";
import MyApplications from "./pages/MyApplications";
import JobDetails from "./pages/JobDetails";
import PostJob from "./pages/PostJob";
import MyJobs from "./pages/MyJobs";
import ViewApplicants from "./pages/ViewApplicants";

import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("token")
  );
  const role = localStorage.getItem("role") || "USER"; // Retrieve role

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />

        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login setIsLoggedIn={setIsLoggedIn} />
            </PublicRoute>
          }
        />

        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />

        <Route
          path="/forgot-password"
          element={
            <PublicRoute>
              <ForgotPassword />
            </PublicRoute>
          }
        />

        {/* Protected Routes */}
        <Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <Dashboard setIsLoggedIn={setIsLoggedIn} />
    </ProtectedRoute>
  }
/>

        <Route
          path="/jobs"
          element={
            <ProtectedRoute>
              <Jobs />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-applications"
          element={
            role === "USER" ? (
              <ProtectedRoute>
                <MyApplications />
              </ProtectedRoute>
            ) : (
              <Navigate to="/" />
            )
          }
        />

        <Route
          path="/post-job"
          element={
            role === "RECRUITER" ? (
              <ProtectedRoute>
                <PostJob />
              </ProtectedRoute>
            ) : (
              <Navigate to="/" />
            )
          }
        />

        <Route
  path="/my-jobs"
  element={
    role === "RECRUITER" ? (
      <ProtectedRoute>
        <MyJobs />
      </ProtectedRoute>
    ) : (
      <Navigate to="/" />
    )
  }
/>

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/job-details/:id"
          element={
            <ProtectedRoute>
              <JobDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/view-applicants/:jobId"
          element={
            role === "RECRUITER" ? (
              <ProtectedRoute>
                <ViewApplicants />
              </ProtectedRoute>
            ) : (
              <Navigate to="/" />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;