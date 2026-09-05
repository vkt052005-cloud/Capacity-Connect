import { Router } from 'express';
import { getDb } from '../db/schema';
import { v4 as uuidv4 } from 'uuid';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

router.get('/my/submissions', authenticateToken, requireRole('trainee'), (req, res) => {
  try {
    const db = getDb();
    const submissions = db.prepare(`
      SELECT s.*, a.title as assessment_title, c.title as course_title, c.id as course_id
      FROM submissions s
      JOIN assessments a ON s.assessment_id = a.id
      JOIN courses c ON a.course_id = c.id
      WHERE s.user_id = ?
      ORDER BY s.submitted_at DESC
    `).all(req.user!.id);
    res.json(submissions);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', authenticateToken, (req, res) => {
  try {
    const db = getDb();
    const assessment = db.prepare('SELECT * FROM assessments WHERE id = ?').get(req.params.id) as any;
    
    if (!assessment) return res.status(404).json({ error: 'Assessment not found' });

    let questions = db.prepare('SELECT id, question_text, option_a, option_b, option_c, option_d, marks FROM questions WHERE assessment_id = ?').all(assessment.id);
    
    // Shuffle for trainees
    if (req.user!.role === 'trainee') {
      questions = questions.sort(() => Math.random() - 0.5);
    } else {
      // Return correct option for trainers/admins
      questions = db.prepare('SELECT * FROM questions WHERE assessment_id = ? ORDER BY sort_order ASC').all(assessment.id);
    }
    
    assessment.questions = questions;
    res.json(assessment);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', authenticateToken, requireRole('trainer', 'admin'), (req, res) => {
  try {
    const db = getDb();
    const { course_id, title, time_limit_minutes, passing_score, questions } = req.body;
    
    const assessmentId = uuidv4();
    const totalMarks = questions.reduce((sum: number, q: any) => sum + (q.marks || 1), 0);

    const insertAss = db.prepare(`
      INSERT INTO assessments (id, course_id, title, time_limit_minutes, passing_score, total_marks, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    db.transaction(() => {
      insertAss.run(assessmentId, course_id, title, time_limit_minutes, passing_score, totalMarks, req.user!.id);
      
      const insertQ = db.prepare(`
        INSERT INTO questions (id, assessment_id, question_text, option_a, option_b, option_c, option_d, correct_option, marks, sort_order)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      questions.forEach((q: any, idx: number) => {
        insertQ.run(uuidv4(), assessmentId, q.question_text, q.option_a, q.option_b, q.option_c, q.option_d, q.correct_option, q.marks || 1, idx + 1);
      });
    })();
    
    res.status(201).json({ id: assessmentId, message: 'Assessment created' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:id/submit', authenticateToken, requireRole('trainee'), (req, res) => {
  try {
    const db = getDb();
    const { answers, time_taken_seconds } = req.body; // answers: { question_id: 'A|B|C|D' }
    const assessmentId = req.params.id;
    const userId = req.user!.id;

    // Check if already submitted
    const existing = db.prepare('SELECT id FROM submissions WHERE user_id = ? AND assessment_id = ?').get(userId, assessmentId);
    if (existing) {
      return res.status(400).json({ error: 'Already submitted' });
    }

    const assessment = db.prepare('SELECT passing_score, total_marks FROM assessments WHERE id = ?').get(assessmentId) as any;
    const questions = db.prepare('SELECT id, correct_option, marks FROM questions WHERE assessment_id = ?').all(assessmentId) as any[];

    let score = 0;
    questions.forEach(q => {
      if (answers[q.id] === q.correct_option) {
        score += q.marks;
      }
    });

    const percentage = (score / assessment.total_marks) * 100;
    const passed = percentage >= assessment.passing_score ? 1 : 0;
    const submissionId = uuidv4();

    db.prepare(`
      INSERT INTO submissions (id, assessment_id, user_id, answers, score, total_marks, percentage, passed, time_taken_seconds)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(submissionId, assessmentId, userId, JSON.stringify(answers), score, assessment.total_marks, percentage, passed, time_taken_seconds);

    // If passed, we can update course enrollment status or trigger certificate generation logic if needed
    
    res.status(201).json({ score, percentage, passed });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id/results', authenticateToken, requireRole('trainer', 'admin'), (req, res) => {
  try {
    const db = getDb();
    const submissions = db.prepare(`
      SELECT s.*, u.name, u.email 
      FROM submissions s
      JOIN users u ON s.user_id = u.id
      WHERE s.assessment_id = ?
    `).all(req.params.id);
    res.json(submissions);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
