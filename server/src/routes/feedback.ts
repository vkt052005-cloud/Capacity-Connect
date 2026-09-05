import { Router } from 'express';
import { getDb } from '../db/schema';
import { v4 as uuidv4 } from 'uuid';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

router.post('/', authenticateToken, requireRole('trainee'), (req, res) => {
  try {
    const db = getDb();
    const { course_id, rating, comment } = req.body;
    
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    const id = uuidv4();
    db.prepare('INSERT INTO feedback (id, course_id, user_id, rating, comment) VALUES (?, ?, ?, ?, ?)')
      .run(id, course_id, req.user!.id, rating, comment);
      
    res.status(201).json({ id, message: 'Feedback submitted' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:courseId', authenticateToken, (req, res) => {
  try {
    const db = getDb();
    const feedback = db.prepare(`
      SELECT f.*, u.name as user_name 
      FROM feedback f
      JOIN users u ON f.user_id = u.id
      WHERE f.course_id = ?
      ORDER BY f.created_at DESC
    `).all(req.params.courseId);
    res.json(feedback);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
