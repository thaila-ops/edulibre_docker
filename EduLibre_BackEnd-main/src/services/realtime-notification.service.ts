import type { Response } from 'express';

type LiveNotification = {
  kind: 'announcement' | 'notification';
  title: string;
  message: string;
  notification?: Record<string, unknown>;
};

export default class RealtimeNotificationService {
  private static readonly connections = new Map<number, Set<Response>>();

  public static connect(userId: number, response: Response) {
    const userConnections = this.connections.get(userId) ?? new Set<Response>();
    userConnections.add(response);
    this.connections.set(userId, userConnections);

    response.write(': connected\n\n');

    const heartbeat = setInterval(() => response.write(': heartbeat\n\n'), 25_000);
    response.on('close', () => {
      clearInterval(heartbeat);
      const current = this.connections.get(userId);
      current?.delete(response);
      if (!current?.size) this.connections.delete(userId);
    });
  }

  public static notifyUser(userId: number, notification: Record<string, unknown>) {
    const title = typeof notification.titulo === 'string' ? notification.titulo : 'Nova notificação';
    const message = typeof notification.mensagem === 'string' ? notification.mensagem : '';
    this.send(this.connections.get(userId), {
      kind: 'notification',
      title,
      message,
      notification,
    });
  }

  public static broadcast(title: string, message: string) {
    for (const userConnections of this.connections.values()) {
      this.send(userConnections, { kind: 'announcement', title, message });
    }
  }

  private static send(connections: Set<Response> | undefined, event: LiveNotification) {
    if (!connections?.size) return;
    const payload = `event: notification\ndata: ${JSON.stringify(event)}\n\n`;
    for (const response of connections) response.write(payload);
  }
}
