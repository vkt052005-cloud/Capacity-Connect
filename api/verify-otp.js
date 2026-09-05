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

  const { otp } = req.body || {};
  if (!otp || !otp.toString().trim()) {
    return res.status(200).json({ valid: false, error: 'Please enter verification code' });
  }

  if (otp.toString().trim().length === 6) {
    return res.status(200).json({ valid: true });
  }

  return res.status(200).json({ valid: false, error: 'Invalid 6-digit verification code' });
}
