import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../../db/index.js';
import { env } from '../../config/env.js';

export async function registerParent(req: Request, res: Response): Promise<void> {
  try {
    const { email, password, full_name, parent_pin } = req.body;
    if (!email || !password || !full_name || !parent_pin) {
      res.status(400).json({ error: 'Missing required fields: email, password, full_name, parent_pin' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const pinHash = await bcrypt.hash(parent_pin, 10);

    const userRes = await query(`
      INSERT INTO users (email, password_hash, full_name, parent_pin_hash, is_email_verified)
      VALUES ($1, $2, $3, $4, TRUE)
      RETURNING id, email, full_name, role;
    `, [email.toLowerCase(), passwordHash, full_name, pinHash]);

    const user = userRes.rows[0];
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, env.JWT_SECRET, { expiresIn: '30d' });

    res.status(201).json({ user, token });
  } catch (err: any) {
    if (err.code === '23505') {
      res.status(409).json({ error: 'User with this email already exists' });
      return;
    }
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
}

export async function loginParent(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password required' });
      return;
    }

    const userRes = await query(`
      SELECT id, email, password_hash, full_name, role 
      FROM users 
      WHERE email = $1 AND deleted_at IS NULL;
    `, [email.toLowerCase()]);

    if (userRes.rows.length === 0) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const user = userRes.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, env.JWT_SECRET, { expiresIn: '30d' });
    res.json({
      user: { id: user.id, email: user.email, full_name: user.full_name, role: user.role },
      token
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
}

export async function createChildProfile(req: Request, res: Response): Promise<void> {
  try {
    const parentId = (req as any).user.id;
    const { first_name, age, grade_level, avatar_id, interests } = req.body;

    if (!first_name || !age || !grade_level) {
      res.status(400).json({ error: 'Missing required child profile fields: first_name, age, grade_level' });
      return;
    }

    const childRes = await query(`
      INSERT INTO child_profiles (parent_id, first_name, age, grade_level, avatar_id, interests)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, first_name, age, grade_level, avatar_id, interests, xp_points, current_streak_days;
    `, [parentId, first_name, age, grade_level, avatar_id || 'default_avatar', interests || []]);

    res.status(201).json({ child: childRes.rows[0] });
  } catch (err: any) {
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
}
