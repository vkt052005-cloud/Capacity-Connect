import { Router } from 'express';
import { getDb } from '../db/schema';
import { v4 as uuidv4 } from 'uuid';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

// Announcements public route (needs no admin auth but placed here for convenience, or extract out)
router.get('/announcements', (req, res) => {
  try {
    const db = getDb();
    const announcements = db.prepare('SELECT * FROM announcements WHERE is_active = 1 ORDER BY created_at DESC').all();
    res.json(announcements);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.use(authenticateToken, requireRole('admin'));

router.get('/users', (req, res) => {
  try {
    const db = getDb();
    const { role, status } = req.query;
    
    let query = 'SELECT u.id, u.email, u.name, u.role, u.status, i.name as institute_name, u.created_at FROM users u LEFT JOIN institutes i ON u.institute_id = i.id WHERE 1=1';
    const params: any[] = [];
    
    if (role) { query += ' AND u.role = ?'; params.push(role); }
    if (status) { query += ' AND u.status = ?'; params.push(status); }
    
    query += ' ORDER BY u.created_at DESC';
    
    const users = db.prepare(query).all(...params);
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/users/:id/approve', (req, res) => {
  try {
    const db = getDb();
    const { status } = req.body; // 'approved' or 'rejected'
    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    db.prepare('UPDATE users SET status = ? WHERE id = ?').run(status, req.params.id);
    res.json({ message: `User status updated to ${status}` });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/users/:id/role', (req, res) => {
  try {
    const db = getDb();
    const { role } = req.body;
    if (!['admin', 'trainer', 'trainee'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }
    
    db.prepare('UPDATE users SET role = ? WHERE id = ?').run(role, req.params.id);
    res.json({ message: `User role updated to ${role}` });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/analytics', (req, res) => {
  try {
    const db = getDb();
    const usersByRole = db.prepare('SELECT role, COUNT(*) as count FROM users GROUP BY role').all();
    const totalCourses = db.prepare('SELECT COUNT(*) as count FROM courses').get();
    const totalEnrollments = db.prepare('SELECT COUNT(*) as count FROM enrollments').get();
    const instituteStats = db.prepare(`
      SELECT i.code, COUNT(u.id) as user_count 
      FROM institutes i 
      LEFT JOIN users u ON i.id = u.institute_id 
      GROUP BY i.id
    `).all();

    res.json({
      usersByRole,
      totalCourses,
      totalEnrollments,
      instituteStats
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/announcements', (req, res) => {
  try {
    const db = getDb();
    const { title, content, type } = req.body;
    const id = uuidv4();
    db.prepare('INSERT INTO announcements (id, title, content, type, created_by) VALUES (?, ?, ?, ?, ?)')
      .run(id, title, content, type || 'notice', req.user!.id);
    res.status(201).json({ id, message: 'Announcement created' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/announcements/:id', (req, res) => {
  try {
    const db = getDb();
    const { title, content, is_active } = req.body;
    db.prepare('UPDATE announcements SET title = ?, content = ?, is_active = ? WHERE id = ?')
      .run(title, content, is_active, req.params.id);
    res.json({ message: 'Announcement updated' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/announcements/:id', (req, res) => {
  try {
    const db = getDb();
    db.prepare('DELETE FROM announcements WHERE id = ?').run(req.params.id);
    res.json({ message: 'Announcement deleted' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
