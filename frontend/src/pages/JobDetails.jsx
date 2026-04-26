import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaMapMarkerAlt, FaRupeeSign, FaArrowLeft } from "react-icons/fa";
import "./JobDetails.css";

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [message, setMessage] = useState("");
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    fetch(`http://localhost:8081/api/jobs/${id}`)
      .then(res => {
        if (!res.ok) {
          throw new Error("Failed to fetch job details");
        }
        return res.json();
      })
      .then(data => setJob(data))
      .catch(() => setMessage("Failed to load job"));

    const authToken = localStorage.getItem("token");

    if (authToken) {
      fetch("http://localhost:8081/api/applications/my-applications", {
        headers: {
          "Authorization": `Bearer ${authToken}`
        }
      })
        .then(res => {
          if (!res.ok) {
            throw new Error("Failed to fetch applications");
          }
          return res.json();
        })
        .then(data => {
          const alreadyApplied = data.some(app => app.jobId === id);
          setApplied(alreadyApplied);
        })
        .catch(() => setMessage("Failed to check application status"));
    }

  }, [id]);

  const applyForJob = () => {
    const authToken = localStorage.getItem("token");

    if (!authToken) {
      setMessage("Please login first to apply.");
      console.log("User not logged in. Redirecting to login page.");
      navigate("/login", { replace: true });
      return;
    }

    fetch(`http://localhost:8081/api/applications/apply/${id}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${authToken}`
      }
    })
      .then(async (res) => {
        console.log("API response status:", res.status);

        const text = await res.text();
        let message = text || "Something went wrong";

        try {
          const parsed = JSON.parse(text);
          message = parsed.message || message;
        } catch {
          // Response was plain text, keep the original message.
        }

        if (res.ok) {
          setApplied(true);
          setMessage("✅ Applied Successfully!");
        } 
        else if (res.status === 400) {
          if (message.toLowerCase().includes("already applied")) {
            setApplied(true);
            setMessage("⚠️ You already applied for this job.");
          } else {
            setMessage(message);
          }
        } 
        else if (res.status === 403) {
          setMessage("❌ You are not authorized.");
        } 
        else {
          setMessage(message);
        }
      })
      .catch(err => {
        console.error("Error during application request:", err);
        setMessage("Something went wrong");
      });
  };

  if (!job) return <div className="loading">Loading...</div>;

  return (
    <div className="job-details-container">
      
      <button className="back-btn" onClick={() => navigate(-1)}>
        <FaArrowLeft /> Back
      </button>

      <div className="job-details-card">
        
        <div className="top-section">
          <img
            src={`http://localhost:8081/logos/${job.company.toLowerCase().replace(/\s+/g, "")}.jpg`}
            alt={job.company}
            className="company-logo"
            onError={(e) => {
              e.target.src = "http://localhost:8081/logos/default.jpg";
            }}
          />

          <div className="job-header-info">
            <h2>{job.title}</h2>
            <p className="company">{job.company}</p>

            <p className="meta">
              <FaMapMarkerAlt /> {job.location}
            </p>

            <p className="salary">
              <FaRupeeSign /> {job.salary || "Not disclosed"}
            </p>
          </div>
        </div>

        <div className="section">
          <h3>Job Description</h3>
          <p>{job.description || "No description provided."}</p>
        </div>

        <div className="section">
          <h3>Skills Required</h3>
          <p>{job.skills || "Not specified"}</p>
        </div>

        <div className="section">
          <h3>Experience</h3>
          <p>{job.experience || "Not specified"}</p>
        </div>

        <div className="apply-section">
          <button 
            className={`apply-btn ${applied ? "applied" : ""}`}
            onClick={applyForJob}
            disabled={applied}
          >
            {applied ? "Applied ✓" : "Apply Now"}
          </button>
        </div>

        
        {message && <div className="message">{message}</div>}
      </div>
    </div>
  );
};

export default JobDetails;