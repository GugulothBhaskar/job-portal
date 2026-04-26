import { useState } from "react";
import { useNotifications } from "../context/NotificationContext";
import "./NotificationBell.css";

const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const { notifications, readNotification, readAllNotifications } = useNotifications();

  const unreadCount = notifications.filter((n) => !n.read).length;

  const toggleDropdown = async () => {
    const nextOpen = !open;
    setOpen(nextOpen);

    if (nextOpen && unreadCount > 0) {
      await readAllNotifications();
    }
  };

  return (
    <div className="notification-bell">
      <button
        type="button"
        className="notification-bell-btn"
        onClick={toggleDropdown}
      >
        🔔 {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
      </button>

      {open && (
        <div className="dropdown">
          {notifications.length === 0 ? (
            <p>No notifications</p>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={`item ${n.read ? "" : "unread"}`}
                onClick={() => !n.read && readNotification(n.id)}
                role="button"
                tabIndex={0}
              >
                <strong>{n.title || "Notification"}</strong>
                <div>{n.message}</div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
