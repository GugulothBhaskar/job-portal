
package com.bhaskar.jobportal.model;
import java.util.List;
import java.util.Map;

public class UserProfile {

    private String headline;
    private String about;
    private String phone;
    private String location;

    private List<String> skills;

    // ✅ FIXED
    private List<Map<String, String>> experience;
    private List<Map<String, String>> education;
    private List<Map<String, String>> projects;

    private String resumeUrl;
    private String profilePic;

    public UserProfile() {}

    // Getters & Setters

    public String getHeadline() { return headline; }
    public void setHeadline(String headline) { this.headline = headline; }

    public String getAbout() { return about; }
    public void setAbout(String about) { this.about = about; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public List<String> getSkills() { return skills; }
    public void setSkills(List<String> skills) { this.skills = skills; }

    // ✅ EXPERIENCE
    public List<Map<String, String>> getExperience() { return experience; }
    public void setExperience(List<Map<String, String>> experience) {
        this.experience = experience;
    }

    // ✅ EDUCATION
    public List<Map<String, String>> getEducation() { return education; }
    public void setEducation(List<Map<String, String>> education) {
        this.education = education;
    }

    // ✅ PROJECTS
    public List<Map<String, String>> getProjects() { return projects; }
    public void setProjects(List<Map<String, String>> projects) {
        this.projects = projects;
    }

    public String getResumeUrl() { return resumeUrl; }
    public void setResumeUrl(String resumeUrl) { this.resumeUrl = resumeUrl; }

    public String getProfilePic() { return profilePic; }
    public void setProfilePic(String profilePic) { this.profilePic = profilePic; }
}