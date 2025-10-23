export const requireAuth = (req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    res.status(401).json({ error: 'Please login to access this resource' });
  }
};

export const requireAdmin = (req, res, next) => {
  if (req.session.user && req.session.user.role === 'ADMIN') {
    next();
  } else {
    res.status(403).json({ error: 'Hanya Administrator yang diperbolehkan' });
  }
};