import {
  Expo,
  ExpoPushMessage,
  ExpoPushTicket,
  ExpoPushReceipt,
} from 'expo-server-sdk';

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
   * @returns Una promesa que resuelve los tickets generados.
   */
  async sendNotification(
    expoToken: string,
    title: string,
    body: string,
    data?: Record<string, any>
  ): Promise<Record<string, ExpoPushReceipt>> {
    // Ajusta el tipo
    if (!Expo.isExpoPushToken(expoToken)) {
      throw new Error(`Invalid Expo push token: ${expoToken}`);
    }

    const message: ExpoPushMessage = {
      to: expoToken,
      sound: 'default',
      title,
      body,
      data: data || {},
    };

    try {
      const ticketChunk = await this._expo.sendPushNotificationsAsync([
        message,
      ]);

      const ticketIds = ticketChunk
        .filter((ticket) => ticket.status === 'ok')
        .map((ticket) => ticket.id);

      console.log('Notification sent:', ticketChunk);

      const receiptChunks = await this.getReceipts(ticketIds);
      return receiptChunks;
    } catch (error) {
      console.error('Error sending notification:', error);
      throw error;
    }
  }

  /**
   * Enviar múltiples notificaciones push.
   * @param messages Un array de mensajes para enviar.
   * @returns Una promesa que resuelve todos los tickets generados.
   */
  async sendBatchNotifications(
    messages: ExpoPushMessage[]
  ): Promise<ExpoPushTicket[]> {
    const tickets: ExpoPushTicket[] = [];
    const chunks = this._expo.chunkPushNotifications(messages);

    for (const chunk of chunks) {
      try {
        const ticketChunk = await this._expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
        console.log('Batch notification sent:', ticketChunk);
      } catch (error) {
        console.error('Error sending batch notification:', error);
      }
    }

    return tickets;
  }

  /**
   * Obtener recibos de entrega para notificaciones enviadas.
   * @param receiptIds Un array de IDs de tickets para verificar.
   * @returns Una promesa que resuelve los recibos obtenidos.
   */
  async getReceipts(
    receiptIds: string[]
  ): Promise<Record<string, ExpoPushReceipt>> {
    try {
      const receipts =
        await this._expo.getPushNotificationReceiptsAsync(receiptIds);
      console.log('Receipts received:', receipts);

      for (const [id, receipt] of Object.entries(receipts)) {
        if (receipt.status === 'error') {
          console.error(
            `Error en la entrega para el receipt ${id}:`,
            receipt.message
          );
          if (receipt.details?.error) {
            console.error('Detalles del error:', receipt.details.error);
          }
        }
      }

      return receipts;
    } catch (error) {
      console.error('Error fetching receipts:', error);
      throw error;
    }
  }
}
