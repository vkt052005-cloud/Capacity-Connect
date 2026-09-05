import { Router } from 'express';
import { getDb } from '../db/schema';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/trainers/search', authenticateToken, (req, res) => {
  try {
    const db = getDb();
    const { tag } = req.query;
    
    let query = 'SELECT id, name, email, competency_tags, experience_years FROM users WHERE role = "trainer" AND status = "approved"';
    if (tag) {
      query += ` AND competency_tags LIKE '%${tag}%'`;
    }
    
    const trainers = db.prepare(query).all();
    res.json(trainers);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/competency-map/:subject', authenticateToken, (req, res) => {
  try {
    const db = getDb();
    const subject = req.params.subject;
    // Simple naive matching for demo
    const trainers = db.prepare(`
      SELECT u.id, u.name, u.competency_tags, u.experience_years, i.name as institute_name
      FROM users u
      LEFT JOIN institutes i ON u.institute_id = i.id
      WHERE u.role = 'trainer' 
      AND u.status = 'approved'
      AND u.competency_tags LIKE ?
      ORDER BY u.experience_years DESC
      LIMIT 3
    `).all(`%${subject}%`);
    
    res.json(trainers);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', (req, res) => {
  try {
    const db = getDb();
    const user = db.prepare(`
      SELECT id, name, name_hi, role, institute_id, cadre, experience_years, qualifications, research_interests, competency_tags, bio, avatar_url, created_at
      FROM users WHERE id = ?
    `).get(req.params.id) as any;
    
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    if (user.competency_tags) {
      user.competency_tags = JSON.parse(user.competency_tags);
    }
    
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/', authenticateToken, (req, res) => {
  try {
    const db = getDb();
    const { cadre, experience_years, qualifications, research_interests, competency_tags, bio, avatar_url } = req.body;
    
    const tagsJson = competency_tags ? JSON.stringify(competency_tags) : '[]';

    db.prepare(`
      UPDATE users 
      SET cadre = ?, experience_years = ?, qualifications = ?, research_interests = ?, competency_tags = ?, bio = ?, avatar_url = ?
      WHERE id = ?
    `).run(cadre, experience_years, qualifications, research_interests, tagsJson, bio, avatar_url, req.user!.id);
    
    res.json({ message: 'Profile updated successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
