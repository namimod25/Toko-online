import CaptchaModel from '../models/Captcha.js';

const generateCaptcha = async (req, res) => {
  try {
    // Bersihkan CAPTCHA yang expired terlebih dahulu
    await CaptchaModel.cleanupExpired();
    
    // Generate CAPTCHA baru
    const captcha = await CaptchaModel.generate();
    
    if (!captcha || !captcha.id) {
      return res.status(500).json({
        success: false,
        message: 'Gagal generate CAPTCHA'
      });
    }

    res.json({
      success: true,
      captchaId: captcha.id,
      captchaText: captcha.text
    });
  } catch (error) {
    console.error('Generate CAPTCHA error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal generate CAPTCHA'
    });
  }
};

const validateCaptcha = async (req, res) => {
  try {
    const { captchaId, captchaInput } = req.body;

    if (!captchaId || !captchaInput) {
      return res.status(400).json({
        success: false,
        message: 'CAPTCHA ID dan input harus diisi'
      });
    }

    const captcha = await CaptchaModel.findById(captchaId);
    
    if (!captcha) {
      return res.status(400).json({
        success: false,
        message: 'CAPTCHA tidak valid atau telah kadaluarsa'
      });
    }

    // Cek apakah CAPTCHA sudah expired
    if (new Date() > captcha.expiresAt) {
      // Hapus CAPTCHA yang expired
      await CaptchaModel.deleteById(captchaId);
      return res.status(400).json({
        success: false,
        message: 'CAPTCHA telah kadaluarsa'
      });
    }

    // Validasi text CAPTCHA
    const isValid = captcha.text === captchaInput;
    
    // Hapus CAPTCHA setelah divalidasi (baik benar maupun salah)
    await CaptchaModel.deleteById(captchaId);

    if (isValid) {
      res.json({
        success: true,
        message: 'CAPTCHA valid'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'CAPTCHA tidak sesuai'
      });
    }
  } catch (error) {
    console.error('Validate CAPTCHA error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan validasi CAPTCHA'
    });
  }
};

export { generateCaptcha, validateCaptcha };