import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../api/apiConfig";
import "./PostJob.css";

const PostJob = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    company: "",
    skills: "",
    salary: "",
    experience: ""
  });

  const [loading, setLoading] = useState(false);
  

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setLoading(true);

      await axios.post(
        `${API_BASE_URL}/api/recruiter/jobs`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      alert("Job posted successfully!");
      navigate("/dashboard");

    } catch (err) {
      console.log(err);
      alert("Failed to post job");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="post-job-container">
      <h2>Post a Job</h2>
      <form className="post-job-form" onSubmit={handleSubmit}>
        <input
          type="text"
          name="title"
          placeholder="Job Title"
          value={formData.title}
          onChange={handleChange}
        />
        <textarea
          name="description"
          placeholder="Job Description"
          value={formData.description}
          onChange={handleChange}
        />
        <input
          type="text"
          name="location"
          placeholder="Location"
          value={formData.location}
          onChange={handleChange}
        />
        <input
          type="text"
          name="company"
          placeholder="Company"
          value={formData.company}
          onChange={handleChange}
        />
        <input
          type="text"
          name="skills"
          placeholder="Required Skills"
          value={formData.skills}
          onChange={handleChange}
        />
        <input
          type="text"
          name="salary"
          placeholder="Salary"
          value={formData.salary}
          onChange={handleChange}
        />
        <input
          type="text"
          name="experience"
          placeholder="Experience"
          value={formData.experience}
          onChange={handleChange}
        />
        <button type="submit" disabled={loading}>
          {loading ? "Posting..." : "Post Job"}
        </button>
      </form>
    </div>
  );
};

export default PostJob;