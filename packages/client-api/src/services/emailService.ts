import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL || "notifications@mailer.bloomtechnologies.co";

export interface TrustedContactExistingUserEmailData {
  recipientEmail: string;
  recipientName: string | null;
  inviterName: string;
  inviterEmail: string;
  acceptInvitationUrl: string;
}

export interface TrustedContactNewUserEmailData {
  recipientEmail: string;
  inviterName: string;
  inviterEmail: string;
  signUpUrl: string;
}

export class EmailService {
  async sendTrustedContactInvitationToExistingUser(
    data: TrustedContactExistingUserEmailData,
  ) {
    try {
      await resend.emails.send({
        from: FROM_EMAIL,
        to: data.recipientEmail,
        subject: "You've been invited as a trusted contact on EboxSecure",
        html: `
          <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #00698F; margin-bottom: 20px;">You've been invited as a trusted contact!</h2>
              <p>Hi ${data.recipientName || "there"},</p>
              <p>${data.inviterName} (${data.inviterEmail}) has invited you to be their trusted contact on EboxSecure.</p>
              <p>As a trusted contact, you'll be able to:</p>
              <ul style="margin: 20px 0;">
                <li>View their order details</li>
                <li>Generate QR codes to pick up their packages</li>
                <li>Help manage their deliveries</li>
              </ul>
              
              <table role="presentation" style="margin: 30px 0;">
                <tr>
                  <td>
                    <a href="${data.acceptInvitationUrl}" style="display: inline-block; background-color: #00698F; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Accept Invitation</a>
                  </td>
                </tr>
              </table>
              
              <p style="color: #666; font-size: 14px;">If you don't want to accept this invitation, you can simply ignore this email.</p>
              <p style="color: #666; font-size: 14px;">If the button doesn't work, you can copy and paste this link: ${data.acceptInvitationUrl}</p>
            </body>
          </html>
        `,
      });
    } catch (error) {
      // Silent failure as requested
      console.error("Failed to send invitation email to existing user:", error);
    }
  }

  async sendTrustedContactInvitationToNewUser(
    data: TrustedContactNewUserEmailData,
  ) {
    try {
      await resend.emails.send({
        from: FROM_EMAIL,
        to: data.recipientEmail,
        subject: "You've been invited to join EboxSecure",
        html: `
          <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #00698F; margin-bottom: 20px;">You've been invited to join EboxSecure!</h2>
              <p>Hi there,</p>
              <p>${data.inviterName} (${data.inviterEmail}) wants to add you as their trusted contact on EboxSecure, but you'll need to create an account first.</p>
              <p>EboxSecure is a secure package management service that helps you track and manage deliveries.</p>
              
              <table role="presentation" style="margin: 30px 0;">
                <tr>
                  <td>
                    <a href="${data.signUpUrl}" style="display: inline-block; background-color: #00698F; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Sign Up to Accept Invitation</a>
                  </td>
                </tr>
              </table>
              
              <p>After you create your account, you'll automatically be connected as ${data.inviterName}'s trusted contact.</p>
              <p style="color: #666; font-size: 14px;">If the button doesn't work, you can copy and paste this link: ${data.signUpUrl}</p>
            </body>
          </html>
        `,
      });
    } catch (error) {
      // Silent failure as requested
      console.error("Failed to send invitation email to new user:", error);
    }
  }
}

export const emailService = new EmailService();
