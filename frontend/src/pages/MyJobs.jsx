import React, { useEffect, useState } from "react";
import api from "../api/api";
import { useNavigate } from "react-router-dom";
import "./MyJobs.css";

const MyJobs = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingJob, setEditingJob] = useState(null); // Track the job being edited

  useEffect(() => {
    const fetchJobs = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Unauthorized. Please log in.");
        setLoading(false);
        return;
      }

      try {
        const response = await api.get("/recruiter/jobs");
        setJobs(response.data);
      } catch (err) {
        if (err.response && err.response.status === 403) {
          setError("Access denied. Please log in as a recruiter.");
        } else {
          setError("Failed to fetch jobs. Please try again later.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const handleDelete = async (id) => {
    try {
      await api.delete(`/recruiter/jobs/${id}`);
      setJobs(jobs.filter((job) => job.id !== id));
    } catch (err) {
      alert("Failed to delete job. Please try again.");
    }
  };

  const handleEdit = (job) => {
    setEditingJob(job); // Set the job to be edited
  };

  const handleUpdate = async (updatedJob) => {
    if (!localStorage.getItem("token")) {
      alert("Unauthorized. Please log in.");
      return;
    }

    console.log("Updated Job Payload:", updatedJob); // Log the payload to verify the data

    try {
      const response = await api.put(`/recruiter/jobs/${updatedJob.id}`, updatedJob);

      setJobs(jobs.map((job) => (job.id === updatedJob.id ? response.data : job)));
      setEditingJob(null); // Exit editing mode
      alert("Job updated successfully!");
    } catch (err) {
      alert("Failed to update job. Please try again.");
    }
  };

  if (loading) {
    return <div>Loading jobs...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="my-jobs">
      <h1>My Jobs</h1>
      {jobs.length === 0 ? (
        <p>No jobs posted yet</p>
      ) : (
        <div className="job-cards">
          {jobs.map((job) => (
            <div key={job.id} className="job-card">
              <h2>{job.title}</h2>
              <p><strong>Company:</strong> {job.company}</p>
              <p><strong>Location:</strong> {job.location}</p>
              <p><strong>Salary:</strong> {job.salary}</p>
              <p><strong>Experience:</strong> {job.experience} years</p>
              <p><strong>Skills:</strong> {job.skills}</p>
              <p><strong>Status:</strong> <span className={`status ${job.status.toLowerCase()}`}>{job.status}</span></p>
              <p><strong>Posted on:</strong> {new Date(job.createdAt).toLocaleDateString()}</p>
              <div className="actions">
                <button className="edit-btn" onClick={() => handleEdit(job)}>
                  Edit
                </button>
                <button className="delete-btn" onClick={() => handleDelete(job.id)}>
                  Delete
                </button>
                <button
                  className="view-btn"
                  onClick={() => navigate(`/view-applicants/${job.id}`)}
                >
                  View Applicants
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {editingJob && (
        <div className="edit-form">
          <h2>Edit Job</h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleUpdate(editingJob);
            }}
          >
            <label>
              Title:
              <input
                type="text"
                value={editingJob.title}
                onChange={(e) =>
                  setEditingJob((prev) => ({ ...prev, title: e.target.value }))
                }
              />
            </label>
            <label>
              Company:
              <input
                type="text"
                value={editingJob.company}
                onChange={(e) =>
                  setEditingJob((prev) => ({ ...prev, company: e.target.value }))
                }
              />
            </label>
            <label>
              Location:
              <input
                type="text"
                value={editingJob.location}
                onChange={(e) =>
                  setEditingJob((prev) => ({ ...prev, location: e.target.value }))
                }
              />
            </label>
            <label>
              Salary:
              <input
                type="text" // Changed from "number" to "text" to allow ranges like "5-6 LPA"
                value={editingJob.salary}
                onChange={(e) =>
                  setEditingJob((prev) => ({ ...prev, salary: e.target.value }))
                }
              />
            </label>
            <label>
              Experience:
              <input
                type="number"
                value={editingJob.experience}
                onChange={(e) =>
                  setEditingJob((prev) => ({ ...prev, experience: e.target.value }))
                }
              />
            </label>
            <label>
              Skills:
              <input
                type="text"
                value={editingJob.skills}
                onChange={(e) =>
                  setEditingJob((prev) => ({ ...prev, skills: e.target.value }))
                }
              />
            </label>
            <label>
              Status:
              <select
                value={editingJob.status}
                onChange={(e) =>
                  setEditingJob((prev) => ({ ...prev, status: e.target.value }))
                }
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="CLOSED">CLOSED</option>
              </select>
            </label>
            <button type="submit">Save</button>
            <button type="button" onClick={() => setEditingJob(null)}>
              Cancel
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default MyJobs;