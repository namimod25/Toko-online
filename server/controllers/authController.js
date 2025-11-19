import bcrypt from 'bcryptjs';
import prisma from '../config/database.js';
import jwt from 'jsonwebtoken';
import { z } from 'zod'; 

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    
    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true
      }
    });

   
    const token = jwt.sign(
      { userId: user.id }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user,
      token
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body; 

    
    if (!email || !password) {
      return res.status(400).json({
        success: false, 
        message: 'Email and password are required'
      });
    }

   
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
    
    
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const token = jwt.sign(
      { userId: user.id }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' }
    );

    req.session.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true, 
      message: 'Login successful',
      user: userWithoutPassword, 
      token 
    });

  } catch (error) {
    console.error('Login error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: error.errors[0].message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ 
        success: false,
        error: 'Failed to logout' 
      });
    }
    
    res.clearCookie('connect.sid');
    res.json({ 
      success: true,
      message: 'Logout successful' 
    });
  });
};

export const getAuthStatus = (req, res) => {
  if (req.session.user) {
    res.json({ 
      success: true,
      authenticated: true, 
      user: req.session.user 
    });
  } else {
    res.json({ 
      success: true,
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

    res.json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch user profile' 
    });
  }
};