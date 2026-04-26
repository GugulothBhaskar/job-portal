import api from "./api";

export const sendNotification = (data) => {
  return api.post("/notifications", data);
};

export const getNotifications = () => {
  const userId = localStorage.getItem("userEmail");
  return api.get("/notifications", { params: { userId } });
};

export const markAsRead = (id) => {
  return api.put(`/notifications/${id}/read`);
};

export const markAllAsRead = () => {
  return api.put("/notifications/read-all");
};
