import { Expo, ExpoPushMessage } from 'expo-server-sdk';

export class PushNotificationService {
  private _expo: Expo;

  constructor() {
    this._expo = new Expo();
  }

  /**
   * Enviar una notificación push a un token Expo.
   * @param expoToken El token del dispositivo (Expo Push Token).
   * @param title El título de la notificación.
   * @param body El cuerpo de la notificación.
   * @param data Datos adicionales opcionales para la notificación.
   * @returns Una promesa que se resuelve cuando la notificación ha sido enviada.
   */

  async sendNotification(
    expoToken: string,
    title: string,
    body: string,
    data?: Record<string, any>
  ): Promise<void> {
    if (!Expo.isExpoPushToken(expoToken)) {
      throw new Error(`Invalid Expo push token: ${expoToken}`);
    }

    const message: ExpoPushMessage = {
      to: expoToken,
      sound: 'default',
      title,
      body,
      data,
    };

    try {
      const ticketChunk = await this._expo.sendPushNotificationsAsync([
        message,
      ]);
      console.log('Notification sent:', ticketChunk);
    } catch (error) {
      console.error('Error sending notification:', error);
      throw error;
    }
  }

  /**
   * Enviar múltiples notificaciones push.
   * @param messages Un array de mensajes para enviar.
   * @returns Una promesa que se resuelve cuando todas las notificaciones han sido enviadas.
   */

  async sendBatchNotifications(messages: ExpoPushMessage[]): Promise<void> {
    const chunks = this._expo.chunkPushNotifications(messages);

    for (const chunk of chunks) {
      try {
        const ticketChunk = await this._expo.sendPushNotificationsAsync(chunk);
        console.log('Batch notification sent:', ticketChunk);
      } catch (error) {
        console.error('Error sending batch notification:', error);
      }
    }
  }
}
