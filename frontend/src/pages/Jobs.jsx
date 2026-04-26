import { useEffect, useState } from "react";
import axios from "axios";
import { FaMapMarkerAlt, FaRupeeSign, FaSearch } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../api/apiConfig";
import { getSavedJobs, saveJob, unsaveJob } from "../api/savedJobsService";
import "./jobs.css";

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savedJobs, setSavedJobs] = useState([]);
  const [search, setSearch] = useState("");

  const navigate = useNavigate();
  const role = localStorage.getItem("role") || "USER";

  useEffect(() => {
    fetchJobs();
    if (role === "USER") {
      fetchSavedJobs();
    }
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/jobs`);
      setJobs(response.data);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedJobs = async () => {
    try {
      const response = await getSavedJobs();
      setSavedJobs(response.data.savedJobs || []);
    } catch (error) {
      console.error("Error fetching saved jobs:", error);
      setSavedJobs([]);
    }
  };

  const toggleSave = async (id) => {
    try {
      if (savedJobs.includes(id)) {
        const response = await unsaveJob(id);
        setSavedJobs(response.data.savedJobs || []);
      } else {
        const response = await saveJob(id);
        setSavedJobs(response.data.savedJobs || []);
      }
    } catch (error) {
      console.error("Error updating saved jobs:", error);
    }
  };

  if (loading) {
    return <p className="status-text">Loading jobs...</p>;
  }

  return (
    <div className="jobs-container">
      <h1 className="jobs-header">Available Jobs</h1>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search jobs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button>
          <FaSearch />
        </button>
      </div>

      <div className="jobs-list">
        {jobs
          .filter((job) =>
            job.title.toLowerCase().includes(search.toLowerCase())
          )
          .map((job) => (
            <div key={job.id} className="job-card">
              <h3>{job.title}</h3>

              <p>{job.company}</p>

              <p>
                <FaMapMarkerAlt /> {job.location}
              </p>

              <p>
                <FaRupeeSign /> {job.salary} LPA
              </p>

              <p>
                <strong>Skills:</strong> {job.skills}
              </p>

              <p>
                <strong>Experience:</strong> {job.experience}
              </p>

              {role === "USER" && (
                <button onClick={() => navigate(`/job-details/${job.id}`)}>
                  Apply Now
                </button>
              )}

              {role === "USER" && (
                <button onClick={() => toggleSave(job.id)}>
                  {savedJobs.includes(job.id) ? "Unsave" : "Save"}
                </button>
              )}

              {role === "RECRUITER" && (
                <div className="recruiter-actions">
                  <button onClick={() => navigate(`/edit-job/${job.id}`)}>
                    Edit
                  </button>

                  <button
                    onClick={() =>
                      navigate(`/view-applicants/${job.id}`)
                    }
                  >
                    View Applicants
                  </button>
                </div>
              )}
            </div>
          ))}
      </div>
    </div>
  );
};

export default Jobs;