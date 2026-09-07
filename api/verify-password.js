import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { password, hash } = req.body || {};
  if (!password || !hash) {
    return res.status(400).json({ valid: false, error: 'Missing fields' });
  }

  try {
    // If the stored value is not a bcrypt hash (legacy plaintext), do direct comparison for migration
    const isBcryptHash = hash.startsWith('$2');
    let valid = false;
    if (isBcryptHash) {
      valid = await bcrypt.compare(password, hash);
    } else {
      // Legacy plaintext match — still valid, will be re-hashed after login
      valid = password === hash;
    }
    return res.status(200).json({ valid, isLegacy: !isBcryptHash });
  } catch (err) {
    console.error('verify-password error:', err);
    return res.status(500).json({ valid: false, error: 'Verification failed' });
  }
}
