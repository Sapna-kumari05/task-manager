const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const db = require('../config/database');

// Get all users (for adding to projects)
router.get('/', auth, (req, res) => {
  db.all(
    'SELECT id, name, email, role FROM users ORDER BY name',
    (err, users) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(users);
    }
  );
});

// Get current user profile
router.get('/profile', auth, (req, res) => {
  db.get(
    'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
    [req.user.id],
    (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json(user);
    }
  );
});

module.exports = router;
