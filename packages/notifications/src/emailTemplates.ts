import type { NotificationType } from "@prisma/client";

interface EmailTemplate {
  subject: string;
  html: (message: string, metadata?: Record<string, any>) => string;
}

const wrapHtml = (content: string) => `
  <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      ${content}
      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
      <p style="color: #999; font-size: 12px;">This is an automated notification from EboxSecure.</p>
    </body>
  </html>
`;

const templateMap: Partial<Record<NotificationType, EmailTemplate>> = {
  ORDER_DELIVERED: {
    subject: "Your package has been delivered",
    html: (message) =>
      wrapHtml(`
        <h2 style="color: #00698F;">Package Delivered</h2>
        <p>${message}</p>
        <p>Log in to your EboxSecure account to view details and generate a QR code for pickup.</p>
      `),
  },
  ORDER_PICKED_UP: {
    subject: "Your package has been picked up",
    html: (message) =>
      wrapHtml(`
        <h2 style="color: #00698F;">Package Picked Up</h2>
        <p>${message}</p>
      `),
  },
  ORDER_OVERDUE: {
    subject: "Your package is overdue for pickup",
    html: (message) =>
      wrapHtml(`
        <h2 style="color: #D97706;">Package Overdue</h2>
        <p>${message}</p>
        <p>Please pick up your package as soon as possible to avoid additional holding fees.</p>
      `),
  },
  ORDER_SHARED: {
    subject: "An order has been shared with you",
    html: (message) =>
      wrapHtml(`
        <h2 style="color: #00698F;">Order Shared</h2>
        <p>${message}</p>
      `),
  },
  ORDER_UNSHARED: {
    subject: "Order access has been revoked",
    html: (message) =>
      wrapHtml(`
        <h2 style="color: #00698F;">Order Access Revoked</h2>
        <p>${message}</p>
      `),
  },
  ORDER_COMMENT: {
    subject: "New comment on your order",
    html: (message) =>
      wrapHtml(`
        <h2 style="color: #00698F;">New Order Comment</h2>
        <p>${message}</p>
      `),
  },
  SUBSCRIPTION_UPGRADED: {
    subject: "Your subscription has been upgraded",
    html: (message) =>
      wrapHtml(`
        <h2 style="color: #00698F;">Subscription Upgraded</h2>
        <p>${message}</p>
      `),
  },
  SUBSCRIPTION_DOWNGRADED: {
    subject: "Your subscription downgrade has been scheduled",
    html: (message) =>
      wrapHtml(`
        <h2 style="color: #00698F;">Subscription Downgrade Scheduled</h2>
        <p>${message}</p>
      `),
  },
  SUBSCRIPTION_CANCELED: {
    subject: "Your subscription has been canceled",
    html: (message) =>
      wrapHtml(`
        <h2 style="color: #00698F;">Subscription Canceled</h2>
        <p>${message}</p>
      `),
  },
  SUBSCRIPTION_REACTIVATED: {
    subject: "Your subscription has been reactivated",
    html: (message) =>
      wrapHtml(`
        <h2 style="color: #00698F;">Subscription Reactivated</h2>
        <p>${message}</p>
      `),
  },
  PAYMENT_FAILED: {
    subject: "Payment failed for your subscription",
    html: (message) =>
      wrapHtml(`
        <h2 style="color: #DC2626;">Payment Failed</h2>
        <p>${message}</p>
        <p>Please update your payment method to continue your subscription.</p>
      `),
  },
  INVOICE_PAID: {
    subject: "Invoice payment received",
    html: (message) =>
      wrapHtml(`
        <h2 style="color: #00698F;">Payment Received</h2>
        <p>${message}</p>
      `),
  },
  TRIAL_ENDING_SOON: {
    subject: "Your trial is ending soon",
    html: (message) =>
      wrapHtml(`
        <h2 style="color: #D97706;">Trial Ending Soon</h2>
        <p>${message}</p>
        <p>Make sure your payment method is up to date to continue your subscription.</p>
      `),
  },
  TRUSTED_CONTACT_INVITATION_RECEIVED: {
    subject: "You have a new trusted contact invitation",
    html: (message) =>
      wrapHtml(`
        <h2 style="color: #00698F;">Trusted Contact Invitation</h2>
        <p>${message}</p>
      `),
  },
  TRUSTED_CONTACT_ACCEPTED: {
    subject: "Your trusted contact invitation was accepted",
    html: (message) =>
      wrapHtml(`
        <h2 style="color: #00698F;">Invitation Accepted</h2>
        <p>${message}</p>
      `),
  },
  TRUSTED_CONTACT_DECLINED: {
    subject: "Your trusted contact invitation was declined",
    html: (message) =>
      wrapHtml(`
        <h2 style="color: #00698F;">Invitation Declined</h2>
        <p>${message}</p>
      `),
  },
  TRUSTED_CONTACT_REMOVED: {
    subject: "You have been removed as a trusted contact",
    html: (message) =>
      wrapHtml(`
        <h2 style="color: #00698F;">Trusted Contact Removed</h2>
        <p>${message}</p>
      `),
  },
  PACKAGE_ALLOWANCE_EXCEEDED: {
    subject: "Package allowance exceeded",
    html: (message) =>
      wrapHtml(`
        <h2 style="color: #D97706;">Package Allowance Exceeded</h2>
        <p>${message}</p>
      `),
  },
};

export function getEmailTemplate(
  type: NotificationType,
): EmailTemplate | undefined {
  return templateMap[type];
}
