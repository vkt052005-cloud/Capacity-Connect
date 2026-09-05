import { Router } from 'express';
import { getDb } from '../db/schema';
import { v4 as uuidv4 } from 'uuid';
import QRCode from 'qrcode';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.post('/generate', authenticateToken, async (req, res) => {
  try {
    const db = getDb();
    const { course_id } = req.body;
    const user_id = req.user!.id;

    // Check if certificate already exists
    const existing = db.prepare('SELECT cert_code FROM certificates WHERE user_id = ? AND course_id = ?').get(user_id, course_id) as any;
    if (existing) {
      return res.json({ cert_code: existing.cert_code, message: 'Certificate already exists' });
    }

    // Verify user actually completed course (simplified check, assume enrolled means complete for now or check passing submission)
    const enrollment = db.prepare('SELECT * FROM enrollments WHERE user_id = ? AND course_id = ?').get(user_id, course_id) as any;
    if (!enrollment) {
      return res.status(400).json({ error: 'User not enrolled in this course' });
    }

    const course = db.prepare(`
      SELECT c.title, i.name as institute_name 
      FROM courses c 
      LEFT JOIN institutes i ON c.institute_id = i.id 
      WHERE c.id = ?
    `).get(course_id) as any;
    
    const user = db.prepare('SELECT name FROM users WHERE id = ?').get(user_id) as any;

    const certCode = `MOES-${new Date().getFullYear()}-CERT-${Math.floor(1000 + Math.random() * 9000)}`;
    const id = uuidv4();
    const issueDate = new Date().toISOString();

    const verificationUrl = `${req.protocol}://${req.get('host')}/verify-certificate/${certCode}`;
    const qrData = await QRCode.toDataURL(verificationUrl);

    db.prepare(`
      INSERT INTO certificates (id, cert_code, user_id, course_id, user_name, course_title, institute_name, issue_date, qr_data)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, certCode, user_id, course_id, user.name, course.title, course.institute_name, issueDate, qrData);

    // Update enrollment status
    db.prepare('UPDATE enrollments SET status = "completed", completed_at = ? WHERE id = ?').run(issueDate, enrollment.id);

    res.status(201).json({ cert_code: certCode, message: 'Certificate generated' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/verify/:certCode', (req, res) => {
  try {
    const db = getDb();
    const cert = db.prepare('SELECT * FROM certificates WHERE cert_code = ?').get(req.params.certCode);
    
    if (!cert) return res.status(404).json({ valid: false, error: 'Certificate not found' });
    
    res.json({ valid: true, certificate: cert });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/my', authenticateToken, (req, res) => {
  try {
    const db = getDb();
    const certs = db.prepare('SELECT * FROM certificates WHERE user_id = ? ORDER BY issue_date DESC').all(req.user!.id);
    res.json(certs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
