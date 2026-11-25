import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { fetchNotifications, markNotificationAsRead } from '../services/notifications';
import { getStoredToken } from '../services/storage';
import { Notification } from '../types';

type LiveNotification = {
  kind: 'announcement' | 'notification';
  title: string;
  message: string;
  notification?: Notification;
};

function NotificationBell() {
  const { token } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [liveNotice, setLiveNotice] = useState<LiveNotification | null>(null);

  useEffect(() => {
    if (!token) {
      setNotifications([]);
      return;
    }

    fetchNotifications()
      .then(setNotifications)
      .catch(() => setNotifications([]));
  }, [token]);

  useEffect(() => {
    if (!token) return;

    const controller = new AbortController();
    const streamUrl = `${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/notificacoes/stream`;

    async function connect() {
      try {
        const response = await fetch(streamUrl, {
          headers: { Authorization: `Bearer ${getStoredToken()}` },
          signal: controller.signal,
        });
        if (!response.ok || !response.body) return;

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let pending = '';

        while (!controller.signal.aborted) {
          const { done, value } = await reader.read();
          if (done) break;
          pending += decoder.decode(value, { stream: true });

          const messages = pending.split('\n\n');
          pending = messages.pop() ?? '';
          for (const message of messages) {
            const dataLine = message.split('\n').find((line) => line.startsWith('data: '));
            if (!dataLine) continue;
            const event = JSON.parse(dataLine.slice(6)) as LiveNotification;
            setLiveNotice(event);
            if (event.notification) {
              setNotifications((current) => [
                event.notification as Notification,
                ...current.filter((item) => item.id !== event.notification?.id),
              ]);
            }
          }
        }
      } catch {
        // A conexão será recriada no próximo carregamento da página.
      }
    }

    void connect();
    return () => controller.abort();
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
      {liveNotice ? (
        <div className="notification-live" role="status">
          <strong>{liveNotice.title}</strong>
          <span>{liveNotice.message}</span>
          <button type="button" onClick={() => setLiveNotice(null)} aria-label="Fechar aviso">×</button>
        </div>
      ) : null}
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
