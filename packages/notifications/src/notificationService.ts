import type { NotificationType, PrismaClient } from "@prisma/client";

import { getEmailTemplate } from "./emailTemplates";
import { sendPushNotification } from "./pushService";
import { sendSms } from "./smsService";

export interface SendNotificationParams {
  userId: string;
  type: NotificationType;
  message: string;
  commentId?: string;
  orderId?: number;
  metadata?: Record<string, any>;
}

export class NotificationService {
  private db: PrismaClient;
  private resend: any;
  private fromEmail: string;

  constructor(db: PrismaClient) {
    this.db = db;
    this.fromEmail =
      process.env.RESEND_FROM_EMAIL ||
      "notifications@mailer.bloomtechnologies.co";

    // Lazy-init Resend
    if (process.env.RESEND_API_KEY) {
      import("resend").then(({ Resend }) => {
        this.resend = new Resend(process.env.RESEND_API_KEY);
      });
    }
  }

  async send(params: SendNotificationParams): Promise<void> {
    const { userId, type, message, commentId, orderId, metadata } = params;

    // 1. Always create DB notification record
    await this.db.notification.create({
      data: {
        userId,
        type,
        message,
        commentId,
        orderId,
        metadata: metadata ?? undefined,
      },
    });

    // 2. Look up notification preferences
    const preference = await this.db.notificationPreference.findUnique({
      where: { userId },
    });

    if (!preference) return;

    // 3. Dispatch to channels in parallel, silently handling failures
    const dispatches: Promise<void>[] = [];

    if (preference.emailEnabled && preference.notificationEmail) {
      dispatches.push(
        this.sendEmail(
          preference.notificationEmail,
          userId,
          type,
          message,
          metadata,
        ),
      );
    }

    if (preference.smsEnabled && preference.phoneNumber) {
      dispatches.push(sendSms(preference.phoneNumber, message));
    }

    if (preference.pushEnabled && preference.expoPushToken) {
      const template = getEmailTemplate(type);
      const title = template?.subject ?? "EboxSecure Notification";
      dispatches.push(
        sendPushNotification(preference.expoPushToken, title, message, {
          type,
          orderId,
          ...metadata,
        }),
      );
    }

    await Promise.allSettled(dispatches);
  }

  async sendBulk(
    userIds: string[],
    params: Omit<SendNotificationParams, "userId">,
  ): Promise<void> {
    await Promise.allSettled(
      userIds.map((userId) => this.send({ ...params, userId })),
    );
  }

  private async sendEmail(
    notificationEmail: string | undefined,
    userId: string,
    type: NotificationType,
    message: string,
    metadata?: Record<string, any>,
  ): Promise<void> {
    if (!this.resend) return;

    // Get email address: preference email or fall back to customer account email
    let toEmail = notificationEmail;
    if (!toEmail) {
      const customer = await this.db.customerAccount.findUnique({
        where: { id: userId },
        select: { email: true },
      });
      toEmail = customer?.email;
    }

    if (!toEmail) return;

    const template = getEmailTemplate(type);
    if (!template) return;

    try {
      await this.resend.emails.send({
        from: this.fromEmail,
        to: toEmail,
        subject: template.subject,
        html: template.html(message, metadata),
      });
    } catch (error) {
      console.error(`Failed to send notification email [${type}]:`, error);
    }
  }
}
