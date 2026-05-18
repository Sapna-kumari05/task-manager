const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { auth } = require('../middleware/auth');
const { checkProjectAccess } = require('../middleware/projectAuth');
const db = require('../config/database');

// Get all tasks for a project
router.get('/project/:projectId', auth, checkProjectAccess, (req, res) => {
  const { projectId } = req.params;

  db.all(
    `SELECT t.*, 
            u_assignee.name as assigned_to_name,
            u_creator.name as created_by_name
     FROM tasks t
     LEFT JOIN users u_assignee ON t.assigned_to = u_assignee.id
     LEFT JOIN users u_creator ON t.created_by = u_creator.id
     WHERE t.project_id = ?
     ORDER BY t.created_at DESC`,
    [projectId],
    (err, tasks) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      // Update overdue tasks
      const now = new Date().toISOString();
      tasks.forEach((task) => {
        if (task.due_date && task.due_date < now && task.status !== 'completed') {
          db.run(
            'UPDATE tasks SET status = ? WHERE id = ?',
            ['overdue', task.id],
            () => {}
          );
          task.status = 'overdue';
        }
      });

      res.json(tasks);
    }
  );
});

// Get single task
router.get('/:taskId', auth, (req, res) => {
  const { taskId } = req.params;

  db.get(
    `SELECT t.*, 
            u_assignee.name as assigned_to_name,
            u_creator.name as created_by_name
     FROM tasks t
     LEFT JOIN users u_assignee ON t.assigned_to = u_assignee.id
     LEFT JOIN users u_creator ON t.created_by = u_creator.id
     WHERE t.id = ?`,
    [taskId],
    (err, task) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }

      res.json(task);
    }
  );
});

// Create new task
router.post(
  '/',
  auth,
  [
    body('title').notEmpty().withMessage('Task title is required'),
    body('project_id').notEmpty().withMessage('Project ID is required'),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, project_id, assigned_to, priority, due_date } = req.body;

    // Verify user is a project member
    db.get(
      'SELECT * FROM project_members WHERE project_id = ? AND user_id = ?',
      [project_id, req.user.id],
      (err, member) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }

        if (!member) {
          return res.status(403).json({ error: 'Access denied' });
        }

        db.run(
          'INSERT INTO tasks (title, description, project_id, assigned_to, created_by, priority, due_date) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [title, description, project_id, assigned_to, req.user.id, priority || 'medium', due_date],
          function (err) {
            if (err) {
              return res.status(500).json({ error: 'Error creating task' });
            }

            res.status(201).json({
              id: this.lastID,
              title,
              description,
              project_id,
              assigned_to,
              created_by: req.user.id,
              priority: priority || 'medium',
              due_date,
              status: 'pending',
            });
          }
        );
      }
    );
  }
);

// Update task
router.put(
  '/:taskId',
  auth,
  [body('title').notEmpty().withMessage('Task title is required')],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { taskId } = req.params;
    const { title, description, assigned_to, status, priority, due_date } = req.body;

    // Verify user has access to the task's project
    db.get(
      `SELECT pm.* FROM tasks t
       JOIN project_members pm ON t.project_id = pm.project_id
       WHERE t.id = ? AND pm.user_id = ?`,
      [taskId, req.user.id],
      (err, member) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }

        if (!member) {
          return res.status(403).json({ error: 'Access denied' });
        }

        db.run(
          `UPDATE tasks 
           SET title = ?, description = ?, assigned_to = ?, status = ?, priority = ?, due_date = ?, updated_at = CURRENT_TIMESTAMP
           WHERE id = ?`,
          [title, description, assigned_to, status, priority, due_date, taskId],
          (err) => {
            if (err) {
              return res.status(500).json({ error: 'Error updating task' });
            }
            res.json({ message: 'Task updated successfully' });
          }
        );
      }
    );
  }
);

// Delete task
router.delete('/:taskId', auth, (req, res) => {
  const { taskId } = req.params;

  // Verify user has access to the task's project
  db.get(
    `SELECT pm.* FROM tasks t
     JOIN project_members pm ON t.project_id = pm.project_id
     WHERE t.id = ? AND pm.user_id = ?`,
    [taskId, req.user.id],
    (err, member) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (!member) {
        return res.status(403).json({ error: 'Access denied' });
      }

      db.run('DELETE FROM tasks WHERE id = ?', [taskId], (err) => {
        if (err) {
          return res.status(500).json({ error: 'Error deleting task' });
        }
        res.json({ message: 'Task deleted successfully' });
      });
    }
  );
});

// Get task statistics for a project
router.get('/stats/project/:projectId', auth, checkProjectAccess, (req, res) => {
  const { projectId } = req.params;

  db.all(
    `SELECT status, COUNT(*) as count 
     FROM tasks 
     WHERE project_id = ? 
     GROUP BY status`,
    [projectId],
    (err, stats) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      const result = {
        pending: 0,
        in_progress: 0,
        completed: 0,
        overdue: 0,
        total: 0,
      };

      stats.forEach((stat) => {
        result[stat.status] = stat.count;
        result.total += stat.count;
      });

      res.json(result);
    }
  );
});

module.exports = router;
