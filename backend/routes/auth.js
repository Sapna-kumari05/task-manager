const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');

// Signup
router.post(
  '/signup',
  [
    body('email').isEmail().withMessage('Invalid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('name').notEmpty().withMessage('Name is required'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password, name, role } = req.body;

      // Check if user already exists
      db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }

        if (user) {
          return res.status(400).json({ error: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert user
        db.run(
          'INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)',
          [email, hashedPassword, name, role || 'member'],
          function (err) {
            if (err) {
              return res.status(500).json({ error: 'Error creating user' });
            }

            const token = jwt.sign(
              { id: this.lastID, email, role: role || 'member' },
              process.env.JWT_SECRET,
              { expiresIn: '7d' }
            );

            res.status(201).json({
              token,
              user: {
                id: this.lastID,
                email,
                name,
                role: role || 'member',
              },
            });
          }
        );
      });
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Login
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Invalid email'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;

      db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }

        if (!user) {
          return res.status(400).json({ error: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
          return res.status(400).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
          { id: user.id, email: user.email, role: user.role },
          process.env.JWT_SECRET,
          { expiresIn: '7d' }
        );

        res.json({
          token,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          },
        });
      });
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  }
);

module.exports = router;
