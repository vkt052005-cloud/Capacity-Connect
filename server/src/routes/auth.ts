import { Router } from 'express';
import { getDb } from '../db/schema';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey';

router.post('/register', (req, res) => {
  try {
    const { email, password, name, role, institute_id } = req.body;
    
    if (!email || !password || !name || !role) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const db = getDb();
    
    // Check if exists
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const id = uuidv4();
    const hashedPassword = bcrypt.hashSync(password, 10);
    const status = role === 'admin' ? 'approved' : 'pending';

    const insert = db.prepare(`
      INSERT INTO users (id, email, password, name, role, status, institute_id, competency_tags)
      VALUES (?, ?, ?, ?, ?, ?, ?, '[]')
    `);
    
    insert.run(id, email, hashedPassword, name, role, status, institute_id);

    const token = jwt.sign({ id, email, role, status }, JWT_SECRET, { expiresIn: '7d' });
    
    res.status(201).json({ 
      token, 
      user: { id, email, name, role, status, institute_id } 
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;
    
    const db = getDb();
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
    
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (user.status === 'rejected') {
      return res.status(403).json({ error: 'Account rejected by admin' });
    }

    const token = jwt.sign({ 
      id: user.id, 
      email: user.email, 
      role: user.role, 
      status: user.status 
    }, JWT_SECRET, { expiresIn: '7d' });
    
    const { password: _, ...userWithoutPassword } = user;
    res.json({ token, user: userWithoutPassword });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/me', authenticateToken, (req, res) => {
  try {
    const db = getDb();
    const user = db.prepare(`
      SELECT u.*, i.name as institute_name 
      FROM users u
      LEFT JOIN institutes i ON u.institute_id = i.id
      WHERE u.id = ?
    `).get(req.user!.id) as any;
    
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    const { password: _, ...userWithoutPassword } = user;
    if (userWithoutPassword.competency_tags) {
      userWithoutPassword.competency_tags = JSON.parse(userWithoutPassword.competency_tags);
    }
    
    res.json(userWithoutPassword);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
