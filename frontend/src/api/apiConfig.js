const envApiUrl = import.meta.env.VITE_API_URL;
export const API_BASE_URL = (envApiUrl || "http://localhost:8081").replace(/\/$/, "");
export const API_URL = `${API_BASE_URL}/api`;
