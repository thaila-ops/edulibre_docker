import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  fetchNotifications,
  markNotificationAsRead,
} from '../services/http';
import { Notification } from '../types';

function NotificationBell() {
  const { token } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (!token) {
      setNotifications([]);
      return;
    }

    fetchNotifications()
      .then(setNotifications)
      .catch(() => setNotifications([]));
  }, [token]);

  const unreadCount = notifications.filter(
    (notification) => !notification.lida,
  ).length;

  async function handleNotificationClick(notification: Notification) {
    if (!notification.lida) {
      try {
        const updatedNotification = await markNotificationAsRead(
          notification.id,
        );

        setNotifications((current) =>
          current.map((item) =>
            item.id === updatedNotification.id ? updatedNotification : item,
          ),
        );
      } catch {
        return;
      }
    }

    setIsOpen(false);
  }

  return (
    <div className="notification-bell">
      <button
        className="notification-button"
        type="button"
        aria-label="Abrir notificações"
        onClick={() => setIsOpen((current) => !current)}
      >
        🔔
        {unreadCount > 0 ? (
          <span className="notification-count">{unreadCount}</span>
        ) : null}
      </button>

      {isOpen ? (
        <div className="notification-menu">
          <strong>Notificações</strong>

          {notifications.length === 0 ? (
            <p className="notification-empty">Você não possui notificações.</p>
          ) : (
            <ul className="notification-list">
              {notifications.map((notification) => (
                <li key={notification.id}>
                  <button
                    className={
                      notification.lida
                        ? 'notification-item'
                        : 'notification-item notification-item-unread'
                    }
                    type="button"
                    onClick={() => {
                      void handleNotificationClick(notification);
                    }}
                  >
                    <strong>{notification.titulo}</strong>
                    <span>{notification.mensagem}</span>
                    <small>
                      {new Date(notification.createdAt).toLocaleString(
                        'pt-BR',
                      )}
                    </small>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}

export default NotificationBell;