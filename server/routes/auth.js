import express from 'express';
import { 
  register,
  login, 
  logout, 
  getAuthStatus, 
  getProfile,
  updateProfile
} from '../controllers/authController.js';

import { requireAuth } from '../middleware/auth.js';
import { loginSchema, validate } from '../middleware/validation.js';


const router = express.Router();

router.post('/register', register);
router.post('/login', 
  validate(loginSchema),
  login
)
//  router.post('/login', login);

router.post('/logout', logout);
router.get('/auth/status', getAuthStatus);
router.get('/profile', requireAuth, getProfile);
router.put('/profile', requireAuth, updateProfile);

//ganti password
router.post('/password/change', requireAuth);

export default router;


// import express from 'express';
// import { login, logout, getAuthStatus, register } from '../controllers/authController.js';
// import { requireNoAuth, requireAuth } from '../middleware/auth.js';

// const router = express.Router();

// const authenticateToken = (req, res, next) => {
//  const authHeader = req.headers['authorization'];
//  const token = authHeader && authHeader.split(' ')[1];
 
//  if (!token) return res.sendStatus(401);
 
//  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
//    if (err) return res.sendStatus(403);
//    req.user = user;
//    next();
//  });
// };


// router.post('/login', requireNoAuth, login);

// router.post('/logout', requireAuth, logout);

// router.post('/register', requireAuth, register);

// router.get('/status', getAuthStatus);

// export default router;