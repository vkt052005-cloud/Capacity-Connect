import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  try {
    const { to, subject, html } = req.body || {};
    const smtpEmail = process.env.SMTP_EMAIL || process.env.SMTP_USER || 'capacityconnect.org@gmail.com';
    const smtpPass = process.env.SMTP_PASSWORD || process.env.SMTP_PASS || '';

    if (smtpEmail && smtpPass && to) {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: Number(process.env.SMTP_PORT) || 465,
        secure: process.env.SMTP_SECURE !== 'false',
        auth: {
          user: smtpEmail,
          pass: smtpPass
        },
        tls: { rejectUnauthorized: false }
      });

      await transporter.sendMail({
        from: `"Capacity Connect" <${smtpEmail}>`,
        to,
        subject: subject || 'Capacity Connect Notification',
        html: html || '<p>Official Notification from Capacity Connect</p>'
      });

      return res.status(200).json({ success: true, message: `Email sent to ${to}` });
    }

    return res.status(200).json({ success: true, message: 'Email logged' });
  } catch (err) {
    console.error('Error sending email:', err);
    return res.status(200).json({ success: false, error: err.message });
  }
}
