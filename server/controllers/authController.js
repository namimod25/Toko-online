import bcrypt from 'bcryptjs';
import prisma from '../config/database.js';
import { loginSchema, registerSchema } from '../middleware/validation.js';
import z from 'zod';
import {logAudit, AUDIT_ACTIONS} from '../utils/auditLogger.js'
import { findUserByname, verifyPassword } from '../models/userModel.js';



export const register = async (req, res) => {
  try {
    const validatedData = registerSchema.parse(req.body);
    const {email, password, captchaAnswer, captchaToken} = req.body;

    try{
      const decoded = JsonWebTokenError.verify(captchaToken, process.env.RECAPTCHA_SECRET_KEY);
      if (decoded.answer !== parseInt(captchaAnswer,)) {
        return res.status(400).json({ error: 'Invalid captcha answer' });
      }
    } catch (error) {
      return res.status(400).json({ error: 'Captcha verification failed' });
    }

    // cek user jika sudah ada
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    const hashedPassword = await bcrypt.hash(password, 12);

    if (existingUser.validatedData) {
      await logAudit(
        AUDIT_ACTIONS.REGISTER,
        null,
        validatedData.email,
        'Registration failed - user already exists',
        req.ip,
        req.get('User-Agent')
      )
      return res.status(400).json({ error: 'User already exists' });
    }

    // const hashedPassword = await bcrypt.hash(validatedData.password, 12);

    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
        role: validatedData.role
      }
    });

    req.session.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    // Audit log successful registration
    await logAudit(
      AUDIT_ACTIONS.REGISTER,
      user.id,
      user.email,
      'User registered successfully',
      req.ip,
      req.get('User-Agent')
    )

    res.status(201).json({
      message: 'User created successfully',
      user: req.session.user
    });
  } catch (error) {
    await logAudit(
      AUDIT_ACTIONS.REGISTER,
      null,
      req.body.email,
      `Registration error: ${error.message}`,
      req.ip,
      req.get('User-Agent')
    )
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: error.errors 
      });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const login = async (req, res) => {
 const {name, password, captcha } = req.body;
 const { prisma } = req; // PrismaClient di-inject dari middleware

 // 1. Validasi CAPTCHA
 if (!captcha || captcha.toLowerCase() !== req.session.captcha.toLowerCase()) {
   delete req.session.captcha;
   return res.status(400).json({ 
     success: false, 
     error: 'CAPTCHA',
     message: 'Kode CAPTCHA salah atau tidak valid' 
   });
 }
 
 delete req.session.captcha;

 // 2. Cari user di database menggunakan Model
 const user = await findUserByname(prisma, name);

 // 3. Verifikasi user dan password
 if (!user) {
   return res.status(401).json({ 
     success: false, 
     error: 'credentials',
     message: 'Username atau password salah' 
   });
 }

 const isPasswordValid = await verifyPassword(password, user.password);

 if (!isPasswordValid) {
   return res.status(401).json({ 
     success: false, 
     error: 'credentials',
     message: 'Username atau password salah' 
   });
 }

 // 4. Login berhasil, setup session user (tanpa password)
 const { password: _, ...userWithoutPassword } = user;
 req.session.user = userWithoutPassword;

 res.json({ 
   success: true, 
   message: 'Login berhasil',
   user: userWithoutPassword
 });
};

// New: login with reCAPTCHA token (used by client that posts to /login-with-captcha)
export const loginWithCaptcha = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'validation', message: 'Email and password are required' });
    }

    // Find user by email
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(401).json({ success: false, error: 'credentials', message: 'Email atau password salah' });
    }

    const isPasswordValid = await verifyPassword(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ success: false, error: 'credentials', message: 'Email atau password salah' });
    }

    const { password: _pwd, ...userWithoutPassword } = user;
    req.session.user = userWithoutPassword;

    // Optionally log audit
    await logAudit(
      AUDIT_ACTIONS.LOGIN,
      user.id,
      user.email,
      'User logged in via reCAPTCHA flow',
      req.ip,
      req.get('User-Agent')
    )

    return res.json({ success: true, message: 'Login berhasil', user: userWithoutPassword });
  } catch (error) {
    console.error('loginWithCaptcha error:', error);
    return res.status(500).json({ success: false, error: 'server', message: 'Internal server error' });
  }
}

export const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to logout' });
    }
    
    res.clearCookie('connect.sid');
    res.json({ message: 'Logout successful' });
  });
};

export const getAuthStatus = (req, res) => {
  if (req.session.user) {
    res.json({ 
      authenticated: true, 
      user: req.session.user 
    });
  } else {
    res.json({ 
      authenticated: false 
    });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.session.user.id },
      select: { id: true, name: true, email: true, role: true, createdAt: true }
    });

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
};