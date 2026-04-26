import React, { useEffect, useState } from "react";
import axios from "axios";
import "../pages/Profile.css";
const defaultProfilePic = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

const Profile = () => {
  const [profile, setProfile] = useState({
    name: "",
    headline: "",
    phone: "",
    location: "",
    experience: [],
    education: [],
    skills: [],
    about: "",
    email: "",
    projects: [],
    profilePic: "", // ✅ Added profilePic field
    resumeUrl: "",
  });

  const [isEditing, setIsEditing] = useState(false); // Add state for editing mode
  const [resumeMessage, setResumeMessage] = useState("");

  const email = localStorage.getItem("userEmail");
  const token = localStorage.getItem("token");

  const fetchProfile = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8081/users/profile/${email}`,
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
);
      if (res.data) {
        setProfile({
          name: res.data.name || "",
          headline: res.data.headline || "",
          phone: res.data.phone || "",
          location: res.data.location || "",
          about: res.data.about || "",
          email: res.data.email || "",
          profilePic: res.data.profilePic || "",
          resumeUrl: res.data.resumeUrl || "",
          skills: res.data.skills || [],
          experience: (res.data.experience || []).map((exp) => ({
            role: exp?.role || "",
            company: exp?.company || "",
            duration: exp?.duration || "",
            description: exp?.description || "",
          })),
          education: (res.data.education || []).map((edu) => ({
            degree: edu?.degree || "",
            college: edu?.college || "",
            year: edu?.year || "",
          })),
          projects: (res.data.projects || []).map((proj) => ({
            title: proj?.title || "",
            description: proj?.description || "",
            link: proj?.link || "",
          })),
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const updateProfile = async () => {
    try {
      await axios.post(
  "http://localhost:8081/users/profile/update",
  {
    email,
    ...profile,
  },
  {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  }
);
      alert("Profile updated!");
      setIsEditing(false);
    } catch (err) {
      console.error("Error updating profile:", err.response?.data || err.message);
      alert("Failed to update profile. Please check the console for details.");
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const email = localStorage.getItem("userEmail");

    console.log("EMAIL:", email);
    console.log("FILE:", file);

    if (!email) {
      alert("User email not found. Please login again.");
      return;
    }

    const formData = new FormData();
    formData.append("profilePic", file);
    formData.append("email", email);

    try {
      const res = await axios.post(
        "http://localhost:8081/users/upload-profile-pic",
        formData,
        {
          headers: {
           Authorization: `Bearer ${token}`,
           "Content-Type": "multipart/form-data"
         }
        }
      );

      console.log("UPLOAD RESPONSE:", res.data);

      setProfile((prev) => ({
        ...prev,
        profilePic: res.data.imageUrl,
      }));

      alert("Image uploaded successfully!");

    } catch (err) {
      console.error("UPLOAD ERROR:", err.response?.data || err.message);
      alert("Upload failed");
    }
  };

  const getResumeFileName = (url) => {
    if (!url) return "resume.pdf";

    try {
      const fileName = url.split("/").pop() || "resume.pdf";
      return decodeURIComponent(fileName);
    } catch {
      return "resume.pdf";
    }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setResumeMessage("");

    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setResumeMessage("Only PDF files are allowed.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setResumeMessage("Resume size must be 2MB or less.");
      return;
    }

    const formData = new FormData();
    formData.append("resume", file);

    try {
      const res = await axios.post(
        "http://localhost:8081/users/upload-resume",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setProfile((prev) => ({
        ...prev,
        resumeUrl: res.data.resumeUrl,
      }));

      setResumeMessage(`${getResumeFileName(res.data.resumeUrl)} uploaded successfully.`);
      e.target.value = "";
    } catch (err) {
      const responseData = err.response?.data;
      const message =
        typeof responseData === "string"
          ? responseData
          : responseData?.message || err.message || "Resume upload failed";
      setResumeMessage(message);
    }
  };

  const skillSuggestions = [
    "React", "Node.js", "MongoDB", "Express",
    "JavaScript", "Python", "Java", "C++",
    "HTML", "CSS", "Tailwind", "Git", "SQL"
  ];

  const [newSkill, setNewSkill] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const completion =
    (profile.name ? 1 : 0) +
    (profile.headline ? 1 : 0) +
    (profile.about ? 1 : 0) +
    (profile.skills.length ? 1 : 0) +
    (profile.experience.length ? 1 : 0) +
    (profile.education.length ? 1 : 0) +
    (profile.projects.length ? 1 : 0) +
    (profile.profilePic ? 1 : 0) +
    (profile.resumeUrl ? 1 : 0);

  const percentage = Math.round((completion / 9) * 100);

  return (
    <div className="profile-page">

      {/* Cover Section */}
      <div className="cover-section"></div>

      <div className="profile-card">
        {/* Updated profile header with image wrapper and other sections */}
        <div className="profile-header">

          <div className="profile-image-wrapper">
            <img
              src={profile.profilePic || defaultProfilePic}
              alt="Profile"
              className="profile-picture"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = defaultProfilePic;
              }}
            />

            {isEditing && (
              <label className="upload-btn">
                Change
                <input type="file" hidden onChange={handleImageUpload} />
              </label>
            )}
          </div>

          <div className="profile-info">
            {isEditing ? (
              <input
                className="input-name"
                value={profile.name || ""}
                onChange={(e) =>
                  setProfile({ ...profile, name: e.target.value })
                }
              />
            ) : (
              <h1>{profile.name || "Your Name"}</h1>
            )}

            <p className="headline">{profile.headline || "Your Headline"}</p>
            <p className="location">📍 {profile.location || "Your Location"}</p>
          </div>

          <div className="profile-actions">
            <button
              className="edit-btn"
              onClick={() => {
                isEditing ? updateProfile() : setIsEditing(true);
              }}
            >
              {isEditing ? "Save" : "Edit Profile"}
            </button>
          </div>

        </div>

        {/* Updated About section to use consistent layout */}
        <div className="profile-section">
          <div className="section-header">
            <h2>About</h2>
          </div>

          <div className="section-content">
            {isEditing ? (
              <textarea
                value={profile.about || ""} // Ensure value is never null
                onChange={(e) =>
                  setProfile({ ...profile, about: e.target.value })
                }
              />
            ) : (
              <p>{profile.about || "Write something about yourself..."}</p>
            )}
          </div>
        </div>

        {/* Updated Contact section to include clickable links and editing functionality */}
        <div className="profile-section">
          <div className="section-header">
            <h2>Contact</h2>
          </div>

          <div className="section-content contact-grid">

            {/* Email */}
            <div className="contact-item">
              <span className="contact-icon">📧</span>

              {isEditing ? (
                <input
                  type="email"
                  value={profile.email || ""}
                  placeholder="Enter email"
                  onChange={(e) =>
                    setProfile({ ...profile, email: e.target.value })
                  }
                />
              ) : profile.email ? (
                <a href={`mailto:${profile.email}`} className="contact-link">
                  {profile.email}
                </a>
              ) : (
                "Email not added"
              )}
            </div>

            {/* Phone */}
            <div className="contact-item">
              <span className="contact-icon">📞</span>

              {isEditing ? (
                <input
                  type="tel"
                  value={profile.phone || ""}
                  placeholder="Enter phone"
                  onChange={(e) =>
                    setProfile({ ...profile, phone: e.target.value })
                  }
                />
              ) : profile.phone ? (
                <a href={`tel:${profile.phone}`} className="contact-link">
                  {profile.phone}
                </a>
              ) : (
                "Phone not added"
              )}
            </div>

            {/* Location */}
            <div className="contact-item">
              <span className="contact-icon">📍</span>

              {isEditing ? (
                <input
                  type="text"
                  value={profile.location || ""}
                  placeholder="Enter location"
                  onChange={(e) =>
                    setProfile({ ...profile, location: e.target.value })
                  }
                />
              ) : profile.location ? (
                <span>{profile.location}</span>
              ) : (
                "Location not added"
              )}
            </div>

          </div>
        </div>

        <div className="profile-section">
          <div className="section-header">
            <h2>Resume</h2>
          </div>

          <div className="section-content resume-section">
            {profile.resumeUrl ? (
              <a
                href={profile.resumeUrl}
                target="_blank"
                rel="noreferrer"
                className="contact-link resume-link"
              >
                {getResumeFileName(profile.resumeUrl)}
              </a>
            ) : (
              <p className="empty-state">No resume uploaded yet</p>
            )}

            {isEditing && (
              <div className="resume-upload">
                <input
                  type="file"
                  accept="application/pdf,.pdf"
                  onChange={handleResumeUpload}
                />
                <p className="resume-hint">PDF only, max 2MB</p>
                {resumeMessage && <p className="resume-message">{resumeMessage}</p>}
              </div>
            )}
          </div>
        </div>

        {/* Updated experience section with timeline and editing functionality */}
        <div className="profile-section">
          <div className="section-header">
            <h2>Experience</h2>

            {isEditing && (
              <button
                className="add-btn"
                onClick={() =>
                  setProfile({
                    ...profile,
                    experience: [
                      ...profile.experience,
                      { role: "", company: "", duration: "", description: "" }
                    ]
                  })
                }
              >
                + Add
              </button>
            )}
          </div>

          {profile.experience?.length > 0 ? (
            <div className="timeline">
              {profile.experience.map((exp, i) => (
                <div key={i} className="timeline-item">

                  <div className="timeline-dot"></div>

                  <div className="exp-card">

                    {isEditing ? (
                      <>
                        <input
                          placeholder="Role (Frontend Developer)"
                          value={exp.role || ""}
                          onChange={(e) => {
                            const updated = [...profile.experience];
                            updated[i].role = e.target.value;
                            setProfile({ ...profile, experience: updated });
                          }}
                        />

                        <input
                          placeholder="Company (Google)"
                          value={exp.company || ""}
                          onChange={(e) => {
                            const updated = [...profile.experience];
                            updated[i].company = e.target.value;
                            setProfile({ ...profile, experience: updated });
                          }}
                        />

                        <input
                          placeholder="Duration (Jan 2023 - Present)"
                          value={exp.duration || ""}
                          onChange={(e) => {
                            const updated = [...profile.experience];
                            updated[i].duration = e.target.value;
                            setProfile({ ...profile, experience: updated });
                          }}
                        />

                        <textarea
                          placeholder="Describe your work..."
                          value={exp.description || ""}
                          onChange={(e) => {
                            const updated = [...profile.experience];
                            updated[i].description = e.target.value;
                            setProfile({ ...profile, experience: updated });
                          }}
                        />

                        <button
                          className="delete-btn"
                          onClick={() => {
                            const updated = profile.experience.filter((_, index) => index !== i);
                            setProfile({ ...profile, experience: updated });
                          }}
                        >
                          Delete
                        </button>
                      </>
                    ) : (
                      <>
                        <h3>{exp.role}</h3>
                        <p className="company">{exp.company}</p>
                        <span className="duration">{exp.duration}</span>
                        <p className="desc">{exp.description}</p>
                      </>
                    )}

                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-state">No experience added yet</p>
          )}
        </div>

        {/* Updated education section with add, edit, and delete functionality */}
        <div className="profile-section">
          <div className="section-header">
            <h2>Education</h2>

            {isEditing && (
              <button
                className="add-btn"
                onClick={() =>
                  setProfile({
                    ...profile,
                    education: [
                      ...profile.education,
                      { degree: "", college: "", year: "" }
                    ]
                  })
                }
              >
                + Add
              </button>
            )}
          </div>

          {profile.education?.length > 0 ? (
            profile.education.map((edu, i) => (
              <div key={i} className="edu-card">

                {isEditing ? (
                  <>
                    <input
                      placeholder="Degree (B.Tech CSE)"
                      value={edu.degree || ""}
                      onChange={(e) => {
                        const updated = [...profile.education];
                        updated[i].degree = e.target.value;
                        setProfile({ ...profile, education: updated });
                      }}
                    />

                    <input
                      placeholder="College"
                      value={edu.college || ""}
                      onChange={(e) => {
                        const updated = [...profile.education];
                        updated[i].college = e.target.value;
                        setProfile({ ...profile, education: updated });
                      }}
                    />

                    <input
                      placeholder="Year (2021 - 2025)"
                      value={edu.year || ""}
                      onChange={(e) => {
                        const updated = [...profile.education];
                        updated[i].year = e.target.value;
                        setProfile({ ...profile, education: updated });
                      }}
                    />

                    <button
                      className="delete-btn"
                      onClick={() => {
                        const updated = profile.education.filter((_, index) => index !== i);
                        setProfile({ ...profile, education: updated });
                      }}
                    >
                      Delete
                    </button>
                  </>
                ) : (
                  <>
                    <h3>{edu.degree}</h3>
                    <p>{edu.college}</p>
                    <span>{edu.year}</span>
                  </>
                )}

              </div>
            ))
          ) : (
            <p className="empty-state">No education added yet</p>
          )}
        </div>

        {/* Updated projects section with add, edit, and delete functionality */}
        <div className="profile-section">
          <div className="section-header">
            <h2>Projects</h2>

            {isEditing && (
              <button
                className="add-btn"
                onClick={() =>
                  setProfile({
                    ...profile,
                    projects: [
                      ...profile.projects,
                      { title: "", description: "", link: "" }
                    ]
                  })
                }
              >
                + Add
              </button>
            )}
          </div>

          {profile.projects?.length > 0 ? (
            profile.projects.map((proj, i) => (
              <div key={i} className="project-card">

                {isEditing ? (
                  <>
                    <input
                      placeholder="Project Title"
                      value={proj.title || ""}
                      onChange={(e) => {
                        const updated = [...profile.projects];
                        updated[i].title = e.target.value;
                        setProfile({ ...profile, projects: updated });
                      }}
                    />

                    <textarea
                      placeholder="Description"
                      value={proj.description || ""}
                      onChange={(e) => {
                        const updated = [...profile.projects];
                        updated[i].description = e.target.value;
                        setProfile({ ...profile, projects: updated });
                      }}
                    />

                    <input
                      placeholder="Project Link (GitHub / Live)"
                      value={proj.link || ""}
                      onChange={(e) => {
                        const updated = [...profile.projects];
                        updated[i].link = e.target.value;
                        setProfile({ ...profile, projects: updated });
                      }}
                    />

                    <button
                      className="delete-btn"
                      onClick={() => {
                        const updated = profile.projects.filter((_, index) => index !== i);
                        setProfile({ ...profile, projects: updated });
                      }}
                    >
                      Delete
                    </button>
                  </>
                ) : (
                  <>
                    <h3>{proj.title}</h3>
                    <p>{proj.description}</p>

                    {proj.link && (
                      <a
                        href={proj.link}
                        target="_blank"
                        rel="noreferrer"
                        className="project-link"
                      >
                        🔗 View Project
                      </a>
                    )}
                  </>
                )}

              </div>
            ))
          ) : (
            <p className="empty-state">No projects added yet</p>
          )}
        </div>

        {/* Updated Skills section to include suggestions and add button */}
        <div className="profile-section">
          <div className="section-header">
            <h2>Skills</h2>
          </div>

          <div className="section-content">
            <div className="skills-container">
              {profile.skills.length > 0 ? (
                profile.skills.map((skill, index) => (
                  <div key={index} className="skill-chip">
                    {skill}
                  </div>
                ))
              ) : (
                <p className="empty-state">No skills added yet</p>
              )}
            </div>

            {isEditing && (
              <div className="skill-input-container">
                <input
                  type="text"
                  placeholder="Add skill and press Enter"
                  className="skill-input"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && newSkill.trim()) {
                      e.preventDefault();
                      setProfile({
                        ...profile,
                        skills: [...profile.skills, newSkill.trim()]
                      });
                      setNewSkill("");
                    }
                  }}
                />
                <button
                  className="add-skill-button"
                  onClick={() => {
                    if (newSkill.trim()) {
                      setProfile({
                        ...profile,
                        skills: [...profile.skills, newSkill.trim()]
                      });
                      setNewSkill("");
                    }
                  }}
                >
                  Add
                </button>
              </div>
            )}

            {isEditing && (
              <div className="skill-suggestions">
                {skillSuggestions
                  .filter((suggestion) => !profile.skills.includes(suggestion))
                  .map((suggestion, index) => (
                    <span
                      key={index}
                      className="skill-suggestion"
                      onClick={() => {
                        setProfile({
                          ...profile,
                          skills: [...profile.skills, suggestion]
                        });
                      }}
                    >
                      {suggestion}
                    </span>
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* Updated Profile Completion section to use consistent layout */}
        <div className="profile-section">
          <div className="section-header">
            <h2>Profile Completion</h2>
          </div>

          <div className="section-content">
            <p>{percentage}% completed</p>

            <div className="progress-bar">
              <div style={{ width: `${percentage}%` }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Profile;