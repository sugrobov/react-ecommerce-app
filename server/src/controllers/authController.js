import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { UserService } from '../services/userService.js';
import { EmailService } from '../services/emailService.js';

dotenv.config();

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'your-secret-key';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'refresh-secret-key';

export class AuthController {
  static async register(req, res) {
    try {
      const { email, password, name, phone } = req.body;
      
      // Validate input
      if (!email || !password || !name) {
        return res.status(400).json({ error: 'Email, password, and name are required' });
      }
      
      if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters long' });
      }
      
      // Check if user already exists
      const existingUser = await UserService.findUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: 'User already exists' });
      }
      
      // Create user
      const user = await UserService.createUser({ email, password, name, phone });
      
      // Generate tokens
      const accessToken = jwt.sign(
        { userId: user.id, email: user.email },
        ACCESS_TOKEN_SECRET,
        { expiresIn: '15m' }
      );
      
      const refreshToken = await UserService.createRefreshToken(user.id);
      
      res.status(201).json({
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
  
  static async login(req, res) {
    try {
      const { email, password } = req.body;
      
      // Validate input
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }
      
      // Find user
      const user = await UserService.findUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      // Check password
      const isPasswordValid = await bcrypt.compare(password, user.password_hash);
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      // Generate tokens
      const accessToken = jwt.sign(
        { userId: user.id, email: user.email },
        ACCESS_TOKEN_SECRET,
        { expiresIn: '15m' }
      );
      
      const refreshToken = await UserService.createRefreshToken(user.id);
      
      res.json({
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
  
  static async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;
      
      if (!refreshToken) {
        return res.status(401).json({ error: 'Refresh token required' });
      }
      
      // Validate refresh token
      const tokenRecord = await UserService.validateRefreshToken(refreshToken);
      if (!tokenRecord) {
        return res.status(403).json({ error: 'Invalid refresh token' });
      }
      
      // Get user
      const user = await UserService.findUserById(tokenRecord.user_id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // Generate new access token
      const accessToken = jwt.sign(
        { userId: user.id, email: user.email },
        ACCESS_TOKEN_SECRET,
        { expiresIn: '15m' }
      );
      
      res.json({ accessToken });
    } catch (error) {
      console.error('Refresh token error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
  
  static async forgotPassword(req, res) {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }
      
      // Find user
      const user = await UserService.findUserByEmail(email);
      if (!user) {
        // For security, don't reveal if user exists
        return res.json({ message: 'If user exists, password reset instructions have been sent' });
      }
      
      // Create reset token
      const resetToken = await UserService.createPasswordResetToken(user.id);
      
      // Send email
      await EmailService.sendPasswordResetEmail(email, resetToken);
      
      res.json({
        message: 'If user exists, password reset instructions have been sent'
      });
    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
  
  static async resetPassword(req, res) {
    try {
      const { token, newPassword } = req.body;
      
      if (!token || !newPassword) {
        return res.status(400).json({ error: 'Token and new password are required' });
      }
      
      if (newPassword.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters long' });
      }
      
      // Validate reset token
      const tokenRecord = await UserService.validatePasswordResetToken(token);
      if (!tokenRecord) {
        return res.status(400).json({ error: 'Invalid or expired token' });
      }
      
      // Reset password
      await UserService.resetUserPassword(tokenRecord.user_id, newPassword);
      
      res.json({ message: 'Password reset successfully' });
    } catch (error) {
      console.error('Reset password error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
  
  static async logout(req, res) {
    try {
      const { refreshToken } = req.body;
      
      if (refreshToken) {
        await UserService.deleteRefreshToken(refreshToken);
      }
      
      res.json({ message: 'Logged out successfully' });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}