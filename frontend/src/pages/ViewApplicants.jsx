import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/api";
import "./ViewApplicants.css";

const canTransition = (currentStatus, nextStatus) => {
  if (currentStatus === "APPLIED") {
    return nextStatus === "REVIEWED" || nextStatus === "REJECTED";
  }
  if (currentStatus === "REVIEWED") {
    return nextStatus === "SELECTED" || nextStatus === "REJECTED";
  }
  if (currentStatus === "SELECTED") {
    return nextStatus === "REVIEWED" || nextStatus === "REJECTED";
  }
  if (currentStatus === "REJECTED") {
    return nextStatus === "REVIEWED";
  }
  return false;
};

const ViewApplicants = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [filter, setFilter] = useState("ALL");
  const [updatingId, setUpdatingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getStatusClass = (status) => {
    switch (status) {
      case "APPLIED":
        return "status applied";
      case "REVIEWED":
        return "status reviewed";
      case "SELECTED":
        return "status selected";
      case "REJECTED":
        return "status rejected";
      default:
        return "status";
    }
  };

  useEffect(() => {
    const fetchApplications = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Unauthorized. Please log in.");
        setLoading(false);
        return;
      }

      try {
        const response = await api.get(`/recruiter/jobs/${jobId}/applications`);

        setApplications(response.data);
      } catch (err) {
  if (err.response?.status === 401) {
    setError("Session expired. Please login again.");
    localStorage.removeItem("token");
    navigate("/login");
  } else if (err.response?.status === 403) {
    setError("Access denied. Recruiter privileges required.");
  } else {
    setError("Failed to fetch applications. Try again later.");
  }
} finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [jobId]);

  const updateStatus = async (id, status) => {
  const application = applications.find(app => app.applicationId === id);
  if (!application || !canTransition(application.status, status)) return;

  setUpdatingId(id);

  const previousApplications = applications.map((app) => ({ ...app }));

  setApplications((prev) =>
    prev.map((app) =>
      app.applicationId === id ? { ...app, status } : app
    )
  );

  try {
    const res = await api.put(`/recruiter/applications/${id}/status`, { status });

    setApplications((prev) =>
      prev.map((app) =>
        app.applicationId === id
          ? { ...app, status: res.data?.status || status }
          : app
      )
    );

  } catch (err) {
    setApplications(previousApplications);

    alert(
      err.response?.data?.message ||
      "Failed to update application status."
    );
  } finally {
    setUpdatingId(null);
  }
};

  if (loading) {
    return <div className="view-applicants loading">Loading applicants...</div>;
  }

  if (error) {
    return <div className="view-applicants error">{error}</div>;
  }

  const filteredApplications =
    filter === "ALL"
      ? applications
      : applications.filter((application) => application.status === filter);

  return (
    <div className="view-applicants">
      <div className="header-row">
        <h1>Applicants</h1>
        <button className="back-btn" onClick={() => navigate(-1)}>
          Back
        </button>
      </div>

      <div style={{ marginBottom: "16px" }}>
        <h2 style={{ marginBottom: "10px" }}>
          Total Applicants: {applications.length}
        </h2>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="ALL">All</option>
          <option value="APPLIED">Applied</option>
          <option value="REVIEWED">Reviewed</option>
          <option value="SELECTED">Selected</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      {filteredApplications.length === 0 ? (
        <p className="empty-state">No applicants found for this job.</p>
      ) : (
        <div className="applicant-list">
          {filteredApplications.map((application) => (
            <div key={application.applicationId} className="applicant-card">
              <div className="applicant-info">
                <h3>{application.name || "Unknown Candidate"}</h3>
                <p>{application.email || "No email available"}</p>
                <p>
                  <strong>Status:</strong>{" "}
                  <span className={getStatusClass(application.status)}>
                    {application.status}
                  </span>
                </p>
                {application.skills && (
                  <p>
                    <strong>Skills:</strong> {application.skills}
                  </p>
                )}
                {application.appliedAt && (
                  <p>
                    <strong>Applied At:</strong> {new Date(application.appliedAt).toLocaleString()}
                  </p>
                )}
                {application.resumeUrl && (
                  <p>
                    <strong>Resume:</strong>{" "}
                    <a href={application.resumeUrl} target="_blank" rel="noreferrer">
                      View / Download
                    </a>
                  </p>
                )}
              </div>

              <div className="action-buttons">
                <button
                  className="select-btn"
                  disabled={
                    !canTransition(application.status, "SELECTED") ||
                    updatingId === application.applicationId
                  }
                  onClick={() => updateStatus(application.applicationId, "SELECTED")}
                >
                  {application.status === "SELECTED"
                    ? "Selected"
                    : updatingId === application.applicationId
                      ? "Updating..."
                      : "Select"}
                </button>
                <button
                  className="review-btn"
                  disabled={
                    !canTransition(application.status, "REVIEWED") ||
                    updatingId === application.applicationId
                  }
                  onClick={() => updateStatus(application.applicationId, "REVIEWED")}
                >
                  {updatingId === application.applicationId ? "Updating..." : "Review"}
                </button>
                <button
                  className="reject-btn"
                  disabled={
                    !canTransition(application.status, "REJECTED") ||
                    updatingId === application.applicationId
                  }
                  onClick={() => updateStatus(application.applicationId, "REJECTED")}
                >
                  {updatingId === application.applicationId ? "Updating..." : "Reject"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ViewApplicants;