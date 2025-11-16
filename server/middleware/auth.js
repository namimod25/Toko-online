export const requireAuth = (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Please login first'
    });
  }
  next();
};

export const requireAdmin = (req, res, next) => {
  if (req.session.user && req.session.user.role === 'ADMIN') {
    next();
  } else {
    res.status(403).json({ error: 'Hanya Administrator yang diperbolehkan' });
  }
};

export const requireNoAuth = (req, res, next) => {
  if (req.session.user) {
    return res.status(400).json({
      success: false,
      message: 'Already logged in'
    });
  }
  next();
};

// Role-based middleware
export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.session.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Please login first'
      });
    }

    if (!roles.includes(req.session.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Insufficient permissions'
      });
    }

    next();
  };
};