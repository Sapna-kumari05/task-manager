const db = require('../config/database');

const checkProjectAccess = (req, res, next) => {
  const { projectId } = req.params;
  const userId = req.user.id;

  db.get(
    'SELECT * FROM project_members WHERE project_id = ? AND user_id = ?',
    [projectId, userId],
    (err, member) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (!member) {
        return res.status(403).json({ error: 'Access denied. You are not a member of this project.' });
      }

      req.projectRole = member.role;
      next();
    }
  );
};

const checkProjectAdmin = (req, res, next) => {
  checkProjectAccess(req, res, () => {
    if (req.projectRole !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Project admin only.' });
    }
    next();
  });
};

module.exports = { checkProjectAccess, checkProjectAdmin };
