import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import { getSavedJobs, saveJob, unsaveJob } from "../api/savedJobsService";
import "./MyApplications.css";

const FILTER_OPTIONS = ["ALL", "APPLIED", "REVIEWED", "SELECTED", "REJECTED"];

const normalizeStatus = (status) =>
  String(status || "")
    .trim()
    .toUpperCase();

const extractFileName = (url) => {
  if (!url) return "Resume";

  try {
    return decodeURIComponent(url.split("/").pop() || "Resume");
  } catch {
    return "Resume";
  }
};

const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [filter, setFilter] = useState("ALL");
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchSavedJobs();
  }, []);

  const fetchSavedJobs = async () => {
    try {
      const response = await getSavedJobs();
      setSavedJobs(response.data.savedJobs || []);
    } catch (error) {
      console.error("Error fetching saved jobs:", error);
      setSavedJobs([]);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token) {
      console.log("No token found. Redirecting to login.");
      navigate("/login");
      return;
    }

    if (role !== "USER") {
      console.log("Unauthorized role. Redirecting to dashboard.");
      navigate("/dashboard");
      return;
    }

    const fetchApplications = async () => {
      try {
        const res = await api.get("/applications/my-applications-details");
        setApplications(res.data);
      } catch (error) {
        if (error.response?.status === 401) {
          console.log("Unauthorized. Clearing localStorage and redirecting to login.");
          localStorage.clear();
          navigate("/login");
          return;
        }

        if (error.response?.status === 403) {
          console.log("Forbidden access. Redirecting to dashboard.");
          alert("You are not allowed to access this page.");
          navigate("/dashboard");
          return;
        }

        console.error("Error fetching applications:", error);
        setError("Failed to load applications. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [navigate]);

  const filteredApps =
    filter === "ALL"
      ? applications
      : applications.filter((app) => normalizeStatus(app.status) === filter);

  const statusCounts = applications.reduce(
    (acc, app) => {
      const normalized = normalizeStatus(app.status);
      if (acc[normalized] !== undefined) {
        acc[normalized] += 1;
      }
      return acc;
    },
    { APPLIED: 0, REVIEWED: 0, SELECTED: 0, REJECTED: 0 }
  );

  const getStatusClass = (status) => {
  const normalized = normalizeStatus(status);
  if (normalized === "APPLIED") return "status applied";
  if (normalized === "REVIEWED") return "status reviewed";
  if (normalized === "SELECTED") return "status selected";
  if (normalized === "REJECTED") return "status rejected";
  return "status";
};

  const toggleSaveJob = async (jobId) => {
    try {
      if (savedJobs.includes(jobId)) {
        const response = await unsaveJob(jobId);
        setSavedJobs(response.data.savedJobs || []);
      } else {
        const response = await saveJob(jobId);
        setSavedJobs(response.data.savedJobs || []);
      }
    } catch (error) {
      console.error("Error updating saved jobs:", error);
    }
  };

  return (
    <div className="myapps-container">
      <h2 className="myapps-title">My Applications</h2>

      {loading && <div className="no-data">Loading applications...</div>}
      {!loading && error && <div className="no-data">{error}</div>}

      {/* Filters */}
      {!loading && !error && (
        <div className="filters">
          {FILTER_OPTIONS.map(f => (
          <button
            key={f}
            className={`filter-btn ${filter === f ? "active" : ""}`}
            onClick={() => setFilter(f)}
          >
            {f} {f !== "ALL" ? `(${statusCounts[f]})` : `(${applications.length})`}
          </button>
          ))}
        </div>
      )}

      {/* List */}
      {!loading && !error && filteredApps.length === 0 ? (
        <div className="no-data">
          {filter === "ALL"
            ? "No applications found"
            : `No ${filter} applications found`}
        </div>
      ) : !loading && !error ? (
        filteredApps.map((app, index) => (
          <div className="app-card" key={index}>
            <div className="app-left">
              <div className="job-title">{app.title}</div>
              <div className="company">{app.company}</div>
              <div className="location">{app.location}</div>
              {app.resumeUrl && (
                <div className="applied-at">
                  Resume: 
                  <a href={app.resumeUrl} target="_blank" rel="noreferrer">
                    {extractFileName(app.resumeUrl)}
                  </a>
                </div>
              )}
              {app.appliedAt && (
                <div className="applied-at">
                  Applied on {new Date(app.appliedAt).toLocaleDateString()}
                </div>
              )}
            </div>

            <div className="app-right">
              <span className={getStatusClass(app.status)}>
                {normalizeStatus(app.status) || "UNKNOWN"}
              </span>

              {!app.jobId ? (
                <div className="job-deleted">Job deleted by recruiter</div>
              ) : (
                <>
                  <button
                    className="view-btn"
                    onClick={() => navigate(`/job-details/${app.jobId}`)}
                  >
                    View
                  </button>
                  <button
                    className={`save-btn ${savedJobs.includes(app.jobId) ? "saved" : ""}`}
                    onClick={() => toggleSaveJob(app.jobId)}
                  >
                    {savedJobs.includes(app.jobId) ? "Saved ✓" : "Save"}
                  </button>
                </>
              )}
            </div>
          </div>
        ))
      ) : null}
    </div>
  );
};

export default MyApplications;