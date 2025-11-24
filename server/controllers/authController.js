import bcrypt from 'bcryptjs';
import { UserModel } from '../models/User.js';
import prisma from '../utils/database.js';
import { registerSchema, loginSchema } from '../middleware/validation.js';
import z from 'zod';
import { logAudit, AUDIT_ACTIONS } from '../utils/auditLogger.js';

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
      );
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

    // Audit log successful register
    await logAudit(
      AUDIT_ACTIONS.REGISTER,
      user.id,
      user.email,
      'User registered successfully',
      req.ip,
      req.get('User-Agent')
    );

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
    );
    
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
    const { email, password } = req.body;

    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email dan password harus diisi'
      });
    }

    
    try {
      loginSchema.parse({ email, password });
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Validasi gagal',
          errors: validationError.errors
        });
      }
    }

    
    const user = await UserModel.findByEmail(email);
    if (!user) {
      await logAudit(
        AUDIT_ACTIONS.LOGIN,
        null,
        email,
        'Login failed - user not found',
        req.ip,
        req.get('User-Agent')
      );
      
      return res.status(401).json({
        success: false,
        message: 'Email atau password salah'
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      await logAudit(
        AUDIT_ACTIONS.LOGIN,
        user.id,
        user.email,
        'Login failed - invalid password',
        req.ip,
        req.get('User-Agent')
      );
      
      return res.status(401).json({
        success: false,
        message: 'Email atau password salah'
      });
    }

    req.session.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    await logAudit(
      AUDIT_ACTIONS.LOGIN,
      user.id,
      user.email,
      'Login successful',
      req.ip,
      req.get('User-Agent')
    );

    return res.status(200).json({
      success: true,
      message: 'Login berhasil',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    
    await logAudit(
      AUDIT_ACTIONS.LOGIN,
      null,
      req.body.email,
      `Login error: ${error.message}`,
      req.ip,
      req.get('User-Agent')
    );
    
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server'
    });
  }
};

export const logout = (req, res) => {
  // destroy
  if (req.session.user) {
    logAudit(
      AUDIT_ACTIONS.LOGOUT,
      req.session.user.id,
      req.session.user.email,
      'User logged out',
      req.ip,
      req.get('User-Agent')
    ).catch(console.error);
  }

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