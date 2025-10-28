import bcrypt from 'bcryptjs';
import prisma from '../config/database.js';
import { loginSchema, registerSchema } from '../middleware/validation.js';
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
        "Registrasi gagal - user already exist",
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

    //audit lod succes
    await logAudit(
      AUDIT_ACTIONS.REGISTER,
      user.id,
      user.email,
      'user register succesfully',
      req.ip,
      req.get('user-Agent')
    )

    res.status(201).json({
      message: 'User created successfully',
      user: req.session.user
    });
  } catch (error) {
    //auditlog register error
    await logAudit(
      AUDIT_ACTIONS.REGISTER,
      null,
      req.body.email,
      `Registrasi error: ${error.message}`,
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
    const validatedData = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email: validatedData.email }
    });

    if (!user || !(await bcrypt.compare(validatedData.password, user.password))) {
      await logAudit(                 //auditFailedlogin
        AUDIT_ACTIONS.LOGIN_FAILED,
        null,
        validatedData.email,
        'Invalid login credentials',
        req.ip,
        req.get('User-Agent')
      )
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    req.session.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    //auditlog succes
    await logAudit(
      AUDIT_ACTIONS.LOGIN,
      user.id,
      user.email,
      'User logged in successfully',
      req.ip,
      req.get('User-Agent')
    )

    res.json({
      message: 'Login successful',
      user: req.session.user
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: error.errors 
      });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const logout = async (req, res) => {
  try {
    const user = req.session.user;
    
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to logout' });
      }
      
      res.clearCookie('connect.sid');
      
      // Audit logout
      if (user) {
        logAudit(
          AUDIT_ACTIONS.LOGOUT,
          user.id,
          user.email,
          'User logout',
          req.ip,
          req.get('User-Agent')
        )
      }
      res.json({ message: 'User telah logout' });
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
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