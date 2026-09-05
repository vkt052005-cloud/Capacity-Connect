import { Router } from 'express';
import { getDb } from '../db/schema';
import { v4 as uuidv4 } from 'uuid';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

router.get('/', (req, res) => {
  try {
    const db = getDb();
    const { domain, institute_id, level, delivery_mode, search } = req.query;
    
    let query = `
      SELECT c.*, i.name as institute_name, u.name as trainer_name,
      (SELECT COUNT(*) FROM enrollments WHERE course_id = c.id) as enrolled_count
      FROM courses c
      LEFT JOIN institutes i ON c.institute_id = i.id
      LEFT JOIN users u ON c.trainer_id = u.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (domain) { query += ' AND c.domain = ?'; params.push(domain); }
    if (institute_id) { query += ' AND c.institute_id = ?'; params.push(institute_id); }
    if (level) { query += ' AND c.level = ?'; params.push(level); }
    if (delivery_mode) { query += ' AND c.delivery_mode = ?'; params.push(delivery_mode); }
    if (search) { query += ' AND c.title LIKE ?'; params.push(`%${search}%`); }

    query += ' ORDER BY c.created_at DESC';
    
    const courses = db.prepare(query).all(...params);
    res.json(courses);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/my/enrolled', authenticateToken, requireRole('trainee'), (req, res) => {
  try {
    const db = getDb();
    const courses = db.prepare(`
      SELECT c.*, e.status as enrollment_status, e.enrolled_at, i.name as institute_name
      FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      LEFT JOIN institutes i ON c.institute_id = i.id
      WHERE e.user_id = ?
    `).all(req.user!.id);
    res.json(courses);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', (req, res) => {
  try {
    const db = getDb();
    const course = db.prepare(`
      SELECT c.*, i.name as institute_name, u.name as trainer_name, u.email as trainer_email,
      (SELECT COUNT(*) FROM enrollments WHERE course_id = c.id) as enrolled_count
      FROM courses c
      LEFT JOIN institutes i ON c.institute_id = i.id
      LEFT JOIN users u ON c.trainer_id = u.id
      WHERE c.id = ?
    `).get(req.params.id) as any;

    if (!course) return res.status(404).json({ error: 'Course not found' });

    course.resources = db.prepare('SELECT * FROM resources WHERE course_id = ?').all(course.id);
    course.assessments = db.prepare('SELECT id, title, time_limit_minutes, total_marks, deadline FROM assessments WHERE course_id = ?').all(course.id);
    
    res.json(course);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', authenticateToken, requireRole('trainer', 'admin'), (req, res) => {
  try {
    const db = getDb();
    const id = uuidv4();
    const { title, description, domain, level, delivery_mode, duration_hours, institute_id, start_date, end_date } = req.body;
    
    const insert = db.prepare(`
      INSERT INTO courses (id, title, description, domain, level, delivery_mode, duration_hours, institute_id, trainer_id, start_date, end_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    insert.run(id, title, description, domain, level, delivery_mode, duration_hours, institute_id || req.user!.id, req.user!.id, start_date, end_date);
    
    res.status(201).json({ id, message: 'Course created successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:id/enroll', authenticateToken, requireRole('trainee'), (req, res) => {
  try {
    const db = getDb();
    const courseId = req.params.id;
    const userId = req.user!.id;

    const existing = db.prepare('SELECT id FROM enrollments WHERE user_id = ? AND course_id = ?').get(userId, courseId);
    if (existing) {
      return res.status(400).json({ error: 'Already enrolled' });
    }

    const id = uuidv4();
    db.prepare('INSERT INTO enrollments (id, user_id, course_id) VALUES (?, ?, ?)').run(id, userId, courseId);
    
    res.status(201).json({ message: 'Enrolled successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
