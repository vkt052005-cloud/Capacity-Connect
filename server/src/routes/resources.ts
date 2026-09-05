import { Router } from 'express';
import { getDb } from '../db/schema';
import { v4 as uuidv4 } from 'uuid';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

router.get('/:courseId', authenticateToken, (req, res) => {
  try {
    const db = getDb();
    const resources = db.prepare('SELECT * FROM resources WHERE course_id = ? ORDER BY created_at DESC').all(req.params.courseId);
    res.json(resources);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', authenticateToken, requireRole('trainer', 'admin'), (req, res) => {
  try {
    const db = getDb();
    const { course_id, title, type, url, description } = req.body;
    
    const id = uuidv4();
    db.prepare(`
      INSERT INTO resources (id, course_id, title, type, url, description, uploaded_by)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, course_id, title, type, url, description, req.user!.id);
    
    res.status(201).json({ id, message: 'Resource created successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', authenticateToken, requireRole('trainer', 'admin'), (req, res) => {
  try {
    const db = getDb();
    const result = db.prepare('DELETE FROM resources WHERE id = ?').run(req.params.id);
    if (result.changes === 0) return res.status(404).json({ error: 'Resource not found' });
    res.json({ message: 'Resource deleted' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
