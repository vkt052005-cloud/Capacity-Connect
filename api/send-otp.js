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
    const { email, name, otp, purpose } = req.body || {};
    const normEmail = (email || '').trim().toLowerCase();
    const finalOtp = otp || Math.floor(100000 + Math.random() * 900000).toString();
    const flowType = purpose === 'login' ? 'login' : 'register';

    const smtpEmail = process.env.SMTP_EMAIL || process.env.SMTP_USER || 'capacityconnect.org@gmail.com';
    const smtpPass = process.env.SMTP_PASSWORD || process.env.SMTP_PASS || 'lhvnhismvukivzna';

    if (smtpEmail && smtpPass && normEmail) {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: smtpEmail,
          pass: smtpPass
        },
        connectionTimeout: 6000,
        greetingTimeout: 6000,
        socketTimeout: 6000
      });

      const isLogin = flowType === 'login';
      const subject = isLogin
        ? `Your Capacity Connect Login Security Code: ${finalOtp}`
        : `Your Capacity Connect Registration Verification Code: ${finalOtp}`;
      const headingText = isLogin ? 'Login Security Verification' : 'Email Verification Code';
      const introText = isLogin
        ? `A sign-in attempt was initiated for your <strong>Capacity Connect</strong> account. Please use this one-time code to complete two-factor authentication:`
        : `Thank you for registering with <strong>Capacity Connect</strong>. Please enter this 6-digit verification code on the registration screen to verify your email address and activate your account:`;

      await transporter.sendMail({
        from: `"Capacity Connect" <${smtpEmail}>`,
        to: normEmail,
        subject,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 520px; margin: 0 auto; background: #0b0f19; border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; padding: 32px; color: #ffffff;">
            <div style="text-align: center; margin-bottom: 24px;">
              <h2 style="margin: 0; font-size: 22px; font-weight: 700; color: #ffffff; letter-spacing: 1px;">CAPACITY CONNECT</h2>
              <p style="margin: 4px 0 0 0; font-size: 13px; color: #94a3b8;">Official Learning & Accreditation Management Portal</p>
            </div>
            <div style="background: rgba(0, 113, 227, 0.1); border: 1px solid rgba(41, 151, 255, 0.35); border-radius: 16px; padding: 24px; text-align: center; margin-bottom: 24px;">
              <p style="margin: 0 0 8px 0; font-size: 13px; color: #cbd5e1;">${headingText}</p>
              <div style="font-size: 38px; font-weight: 800; letter-spacing: 8px; color: #2997ff; font-family: monospace;">${finalOtp}</div>
              <p style="margin: 10px 0 0 0; font-size: 11px; color: #94a3b8;">Valid for 10 minutes &bull; Do not share this code with anyone.</p>
            </div>
            <p style="font-size: 13px; line-height: 1.6; color: #cbd5e1; margin: 0 0 16px 0;">
              Hello <strong>${name || 'User'}</strong>,<br/>
              ${introText}
            </p>
            <div style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 16px; margin-top: 24px; text-align: center; font-size: 11px; color: #64748b;">
              Sent automatically from <strong>${smtpEmail}</strong> &bull; Capacity Connect Security Team
            </div>
          </div>
        `
      });

      return res.status(200).json({
        success: true,
        message: `Verification code sent to ${normEmail}`,
        sender: smtpEmail
      });
    }

    return res.status(200).json({
      success: true,
      message: `Verification code generated for ${normEmail}`,
      otp: finalOtp
    });
  } catch (err) {
    console.error('Vercel API send-otp error:', err);
    return res.status(200).json({
      success: true,
      message: `Verification code registered for ${normEmail}`,
      otp: finalOtp
    });
  }
}
