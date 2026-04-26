import { createContext, useContext, useEffect, useRef, useState } from "react";
import { getNotifications, markAllAsRead, markAsRead } from "../api/notificationService";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const hasFetchedRef = useRef(false);

  const fetchNotifications = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setNotifications([]);
      return;
    }

    try {
      const res = await getNotifications();
      setNotifications(res.data);
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        setNotifications([]);
        return;
      }
      console.error("Failed to fetch notifications", err);
    }
  };

  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    fetchNotifications();
  }, []);

  const readNotification = async (id) => {
    try {
      await markAsRead(id);
      setNotifications((prev) =>
        prev.map((item) => (item.id === id ? { ...item, read: true } : item))
      );
    } catch (error) {
      console.error("Failed to mark notification as read", error);
    }
  };

  const readAllNotifications = async () => {
    try {
      await markAllAsRead();
      setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
    } catch (error) {
      console.error("Failed to mark all notifications as read", error);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        setNotifications,
        fetchNotifications,
        readNotification,
        readAllNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
