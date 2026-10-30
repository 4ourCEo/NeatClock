import nodemailer from 'nodemailer';

function emailConfig(env) {
  const host = env.SMTP_HOST || 'smtp.resend.com';
  const port = Number(env.SMTP_PORT) || 587;
  const user = env.SMTP_USER || 'resend';
  const pass = env.SMTP_PASS || '';
  const from = env.OTP_FROM || 'no-reply@neatclock.pro';
  return { host, port, user, pass, from, ready: Boolean(pass) };
}

export async function createResendEmailer(env = process.env) {
  const config = emailConfig(env);
  if (!config.ready) throw new Error('email_unavailable');

  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.port === 465,
    auth: { user: config.user, pass: config.pass },
  });

  return {
    async sendRecoveryLink(email, recoveryLink) {
      const mailOptions = {
        from: config.from,
        to: email.toLowerCase(),
        subject: 'Your NeatClock Business calendar access',
        html: `
          <p>Hi,</p>
          <p>You requested access to your NeatClock Business calendar. Click the link below to retrieve your purchased calendar and QR code:</p>
          <p><a href="${recoveryLink}">${recoveryLink}</a></p>
          <p>This link expires in 15 minutes and can only be used once.</p>
          <p>If you didn't request this, you can safely ignore this email.</p>
          <p>— NeatClock</p>
        `,
        text: `
          Hi,

          You requested access to your NeatClock Business calendar. Click the link below to retrieve your purchased calendar and QR code:

          ${recoveryLink}

          This link expires in 15 minutes and can only be used once.

          If you didn't request this, you can safely ignore this email.

          — NeatClock
        `,
      };

      try {
        await transporter.sendMail(mailOptions);
        return { sent: true };
      } catch (error) {
        console.error('Failed to send recovery email:', error);
        return { sent: false, error: error.message };
      }
    },

    async close() {
      transporter.close();
    },
  };
}
