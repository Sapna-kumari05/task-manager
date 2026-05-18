const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { auth } = require('../middleware/auth');
const { checkProjectAccess, checkProjectAdmin } = require('../middleware/projectAuth');
const db = require('../config/database');

// Get all projects for current user
router.get('/', auth, (req, res) => {
  db.all(
    `SELECT p.*, pm.role as user_role 
     FROM projects p
     JOIN project_members pm ON p.id = pm.project_id
     WHERE pm.user_id = ?
     ORDER BY p.created_at DESC`,
    [req.user.id],
    (err, projects) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(projects);
    }
  );
});

// Get single project with members
router.get('/:projectId', auth, checkProjectAccess, (req, res) => {
  const { projectId } = req.params;

  db.get('SELECT * FROM projects WHERE id = ?', [projectId], (err, project) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Get project members
    db.all(
      `SELECT u.id, u.name, u.email, pm.role, pm.joined_at
       FROM project_members pm
       JOIN users u ON pm.user_id = u.id
       WHERE pm.project_id = ?`,
      [projectId],
      (err, members) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }

        res.json({ ...project, members, userRole: req.projectRole });
      }
    );
  });
});

// Create new project
router.post(
  '/',
  auth,
  [body('name').notEmpty().withMessage('Project name is required')],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description } = req.body;

    db.run(
      'INSERT INTO projects (name, description, owner_id) VALUES (?, ?, ?)',
      [name, description, req.user.id],
      function (err) {
        if (err) {
          return res.status(500).json({ error: 'Error creating project' });
        }

        // Add creator as project admin
        db.run(
          'INSERT INTO project_members (project_id, user_id, role) VALUES (?, ?, ?)',
          [this.lastID, req.user.id, 'admin'],
          (err) => {
            if (err) {
              return res.status(500).json({ error: 'Error adding project member' });
            }

            res.status(201).json({
              id: this.lastID,
              name,
              description,
              owner_id: req.user.id,
            });
          }
        );
      }
    );
  }
);

// Update project
router.put(
  '/:projectId',
  auth,
  checkProjectAdmin,
  [body('name').notEmpty().withMessage('Project name is required')],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { projectId } = req.params;
    const { name, description } = req.body;

    db.run(
      'UPDATE projects SET name = ?, description = ? WHERE id = ?',
      [name, description, projectId],
      (err) => {
        if (err) {
          return res.status(500).json({ error: 'Error updating project' });
        }
        res.json({ message: 'Project updated successfully' });
      }
    );
  }
);

// Delete project
router.delete('/:projectId', auth, checkProjectAdmin, (req, res) => {
  const { projectId } = req.params;

  db.run('DELETE FROM projects WHERE id = ?', [projectId], (err) => {
    if (err) {
      return res.status(500).json({ error: 'Error deleting project' });
    }
    res.json({ message: 'Project deleted successfully' });
  });
});

// Add member to project
router.post(
  '/:projectId/members',
  auth,
  checkProjectAdmin,
  [body('email').isEmail().withMessage('Invalid email')],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { projectId } = req.params;
    const { email, role } = req.body;

    // Find user by email
    db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Check if user is already a member
      db.get(
        'SELECT * FROM project_members WHERE project_id = ? AND user_id = ?',
        [projectId, user.id],
        (err, existingMember) => {
          if (err) {
            return res.status(500).json({ error: 'Database error' });
          }

          if (existingMember) {
            return res.status(400).json({ error: 'User is already a member' });
          }

          // Add member
          db.run(
            'INSERT INTO project_members (project_id, user_id, role) VALUES (?, ?, ?)',
            [projectId, user.id, role || 'member'],
            (err) => {
              if (err) {
                return res.status(500).json({ error: 'Error adding member' });
              }

              res.status(201).json({
                message: 'Member added successfully',
                user: {
                  id: user.id,
                  name: user.name,
                  email: user.email,
                  role: role || 'member',
                },
              });
            }
          );
        }
      );
    });
  }
);

// Remove member from project
router.delete('/:projectId/members/:userId', auth, checkProjectAdmin, (req, res) => {
  const { projectId, userId } = req.params;

  // Prevent removing the last admin
  db.get(
    'SELECT COUNT(*) as count FROM project_members WHERE project_id = ? AND role = ?',
    [projectId, 'admin'],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (result.count === 1) {
        return res.status(400).json({ error: 'Cannot remove the last admin' });
      }

      db.run(
        'DELETE FROM project_members WHERE project_id = ? AND user_id = ?',
        [projectId, userId],
        (err) => {
          if (err) {
            return res.status(500).json({ error: 'Error removing member' });
          }
          res.json({ message: 'Member removed successfully' });
        }
      );
    }
  );
});

module.exports = router;
