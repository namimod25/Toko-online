import bcrypt from 'bcryptjs';
import { UserModel } from '../models/User.js';
import  CaptchaModel  from '../models/Captcha.js';
import prisma from '../utils/database.js';
import { registerSchema } from '../middleware/validation.js';
import z from 'zod';
import {logAudit, AUDIT_ACTIONS} from '../utils/auditLogger.js'

export const register = async (req, res) => {
  try {
    const validatedData = registerSchema.parse(req.body);
    
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email }
    });

    if (existingUser) {
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

    const hashedPassword = await bcrypt.hash(validatedData.password, 12);

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
  try {
    const { email, password, captchaId, captchaInput } = req.body;

    // Validasi input yang diperlukan
    if (!email || !password || !captchaId || !captchaInput) {
      return res.status(400).json({
        success: false,
        message: 'Semua field harus diisi'
      });
    }

    // Validasi format captchaId
    if (typeof captchaId !== 'string' || captchaId.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'CAPTCHA ID tidak valid'
      });
    }

    // Cari captcha di database
    const captcha = await CaptchaModel.findById(captchaId);
    if (!captcha) {
      return res.status(400).json({
        success: false,
        message: 'CAPTCHA tidak valid atau telah kadaluarsa'
      });
    }

    // Validasi captcha text
    if (captcha.text !== captchaInput) {
      // Hapus captcha yang sudah digunakan (opsional)
      await CaptchaModel.deleteById(captchaId);
      return res.status(400).json({
        success: false,
        message: 'CAPTCHA tidak sesuai'
      });
    }

    // Hapus captcha yang sudah digunakan
    await CaptchaModel.deleteById(captchaId);

    // Lanjutkan dengan proses login...
    // Cari user by email
    const user = await UserModel.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email atau password salah'
      });
    }

    // Verifikasi password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Email atau password salah'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Login berhasil',
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server'
    });
  }
};

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