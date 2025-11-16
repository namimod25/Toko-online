import { PrismaClient } from '@prisma/client';
import { randomText } from '../utils/helpers.js';

const prisma = new PrismaClient();

class CaptchaModel {
  // generate CAPTCHA baru
  static async generate() {
    try {
      const text = randomText(6); // Generate random text 6 karakter
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 menit dari sekarang

      const captcha = await prisma.captcha.create({
        data: {
          text: text,
          expiresAt: expiresAt,
          createdAt: new Date()
        }
      });

      return captcha;
    } catch (error) {
      console.error('Error generating CAPTCHA:', error);
      throw error;
    }
  }

  //  mencari CAPTCHA by ID
  static async findById(id) {
    if (!id || typeof id !== 'string') {
      throw new Error('Invalid captcha ID');
    }

    try {
      return await prisma.captcha.findUnique({
        where: { id }
      });
    } catch (error) {
      console.error('Error finding CAPTCHA:', error);
      throw error;
    }
  }

  //  delete CAPTCHA
  static async deleteById(id) {
    if (!id || typeof id !== 'string') {
      throw new Error('Invalid captcha ID');
    }

    try {
      return await prisma.captcha.delete({
        where: { id }
      });
    } catch (error) {
      console.error('Error deleting CAPTCHA:', error);
      throw error;
    }
  }

  //  CAPTCHA expired
  static async cleanupExpired() {
    try {
      return await prisma.captcha.deleteMany({
        where: {
          expiresAt: {
            lt: new Date()
          }
        }
      });
    } catch (error) {
      console.error('Error cleaning up expired CAPTCHAs:', error);
      throw error;
    }
  }
}

export default CaptchaModel;