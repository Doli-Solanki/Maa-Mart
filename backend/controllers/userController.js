import { User } from '../models/index.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body || {};
    
    // Input validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }
    
    if (typeof name !== 'string' || typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ message: 'Invalid input format' });
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ message: 'Invalid email format' });
    }
    
    // Password strength validation
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    
    const normalizedEmail = email.trim().toLowerCase();
    const exists = await User.findOne({ where: { email: normalizedEmail } });
    if (exists) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hash
    });
    
    res.status(201).json({
      id: user.id,
      email: user.email,
      name: user.name
    });
  } catch (err) {
    console.error('Registration error:', err);
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'User already exists' });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body || {};
    
    // Input validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    
    if (typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ message: 'Invalid input format' });
    }
    
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET not configured');
      return res.status(500).json({ message: 'Server configuration error' });
    }
    
    const user = await User.findOne({ where: { email: email.trim().toLowerCase() } });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};
