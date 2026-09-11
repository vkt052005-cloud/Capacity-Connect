import bcrypt from 'bcryptjs';

const SUPABASE_URL = (process.env.VITE_SUPABASE_URL || 'https://osahxrfvcuxymkktrbwl.supabase.co').replace(/\/$/, '');
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

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
    return res.status(405).json({ valid: false, error: 'Method Not Allowed' });
  }

  const { email, otp } = req.body || {};
  const normEmail = (email || '').trim().toLowerCase();
  const candidate = (otp || '').toString().trim();

  if (!candidate || candidate.length !== 6) {
    return res.status(200).json({ valid: false, error: 'Please enter a valid 6-digit verification code' });
  }

  // Attempt server-side verification via Supabase otp_verifications table
  if (SUPABASE_SERVICE_KEY && normEmail) {
    try {
      const resp = await fetch(
        `${SUPABASE_URL}/rest/v1/otp_verifications?email=eq.${encodeURIComponent(normEmail)}&used=eq.false&order=created_at.desc&limit=1`,
        {
          headers: {
            apikey: SUPABASE_SERVICE_KEY,
            Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (resp.ok) {
        const rows = await resp.json();
        if (rows && rows.length > 0) {
          const record = rows[0];

          // Check expiry
          if (record.expires_at && new Date(record.expires_at) < new Date()) {
            return res.status(200).json({ valid: false, error: 'Verification code has expired. Please request a new one.' });
          }

          // Compare against stored hash
          const match = await bcrypt.compare(candidate, record.otp_hash);
          if (match) {
            // Mark as used (single-use)
            await fetch(
              `${SUPABASE_URL}/rest/v1/otp_verifications?id=eq.${record.id}`,
              {
                method: 'PATCH',
                headers: {
                  apikey: SUPABASE_SERVICE_KEY,
                  Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
                  'Content-Type': 'application/json',
                  Prefer: 'return=minimal',
                },
                body: JSON.stringify({ used: true }),
              }
            );
            return res.status(200).json({ valid: true });
          } else {
            return res.status(200).json({ valid: false, error: 'Incorrect verification code. Please check your email and try again.' });
          }
        }
      }
    } catch (err) {
      console.error('OTP verify Supabase error:', err);
    }
  }

  return res.status(200).json({ valid: false, error: 'Incorrect or expired verification code. Please check your email and try again.' });
}
