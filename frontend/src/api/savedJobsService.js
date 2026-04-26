import api from "./api";

export const getSavedJobs = () => api.get("/saved-jobs");

export const saveJob = (jobId) => api.post(`/saved-jobs/${jobId}`);

export const unsaveJob = (jobId) => api.delete(`/saved-jobs/${jobId}`);
