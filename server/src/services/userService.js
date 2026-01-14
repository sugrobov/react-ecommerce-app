import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { getPool } from '../config/database.js';

export class UserService {
  static async createUser(userData) {
    const pool = getPool();
    const connection = await pool.getConnection();
    
    try {
      const userId = uuidv4();
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      const [result] = await connection.execute(
        'INSERT INTO users (id, email, password_hash, name, phone) VALUES (?, ?, ?, ?, ?)',
        [userId, userData.email, hashedPassword, userData.name, userData.phone]
      );
      
      if (result.affectedRows === 0) {
        throw new Error('Failed to create user');
      }
      
      const [rows] = await connection.execute(
        'SELECT id, email, name, phone, created_at FROM users WHERE id = ?',
        [userId]
      );
      
      return rows[0];
    } finally {
      connection.release();
    }
  }
  
  static async findUserByEmail(email) {
    const pool = getPool();
    const connection = await pool.getConnection();
    
    try {
      const [rows] = await connection.execute(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );
      
      return rows[0] || null;
    } finally {
      connection.release();
    }
  }
  
  static async findUserById(userId) {
    const pool = getPool();
    const connection = await pool.getConnection();
    
    try {
      const [rows] = await connection.execute(
        'SELECT id, email, name, phone, created_at FROM users WHERE id = ?',
        [userId]
      );
      
      return rows[0] || null;
    } finally {
      connection.release();
    }
  }
  
  static async createPasswordResetToken(userId) {
    const pool = getPool();
    const connection = await pool.getConnection();
    
    try {
      const resetToken = uuidv4();
      const expiresAt = new Date(Date.now() + 3600000); // 1 hour
      
      await connection.execute(
        'INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
        [userId, resetToken, expiresAt]
      );
      
      return resetToken;
    } finally {
      connection.release();
    }
  }
  
  static async validatePasswordResetToken(token) {
    const pool = getPool();
    const connection = await pool.getConnection();
    
    try {
      const [rows] = await connection.execute(
        `SELECT prt.*, u.email 
         FROM password_reset_tokens prt 
         JOIN users u ON prt.user_id = u.id 
         WHERE prt.token = ? AND prt.expires_at > NOW() AND prt.used = FALSE`,
        [token]
      );
      
      return rows[0] || null;
    } finally {
      connection.release();
    }
  }
  
  static async resetUserPassword(userId, newPassword) {
    const pool = getPool();
    const connection = await pool.getConnection();
    
    try {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      // Update user password
      await connection.execute(
        'UPDATE users SET password_hash = ? WHERE id = ?',
        [hashedPassword, userId]
      );
      
      // Mark token as used
      await connection.execute(
        'UPDATE password_reset_tokens SET used = TRUE WHERE user_id = ? AND used = FALSE',
        [userId]
      );
      
      return true;
    } finally {
      connection.release();
    }
  }
  
  static async createRefreshToken(userId) {
    const pool = getPool();
    const connection = await pool.getConnection();
    
    try {
      const refreshToken = uuidv4();
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
      
      await connection.execute(
        'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
        [userId, refreshToken, expiresAt]
      );
      
      return refreshToken;
    } finally {
      connection.release();
    }
  }
  
  static async validateRefreshToken(token) {
    const pool = getPool();
    const connection = await pool.getConnection();
    
    try {
      const [rows] = await connection.execute(
        `SELECT * FROM refresh_tokens 
         WHERE token = ? AND expires_at > NOW()`,
        [token]
      );
      
      return rows[0] || null;
    } finally {
      connection.release();
    }
  }
  
  static async deleteRefreshToken(token) {
    const pool = getPool();
    const connection = await pool.getConnection();
    
    try {
      await connection.execute(
        'DELETE FROM refresh_tokens WHERE token = ?',
        [token]
      );
    } finally {
      connection.release();
    }
  }
}