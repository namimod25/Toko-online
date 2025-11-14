const express = require('express');
const router = express.Router();
const axios = require('axios');

router.post('/verify-captcha', async (req, res) => {
  try {
    const { captchaToken } = req.body;
    
    if (!captchaToken) {
      return res.status(400).json({ 
        success: false, 
        message: 'CAPTCHA token is required' 
      });
    }

    // Verify with Google reCAPTCHA
    const response = await axios.post(
      `https://www.google.com/recaptcha/admin/site/738884691`,
      null,
      {
        params: {
          secret: process.env.VITE_RECAPTCHA_SECRET_KEY,
          response: captchaToken
        }
      }
    );

    if (response.data.success) {
      res.json({ success: true });
    } else {
      res.status(400).json({ 
        success: false, 
        message: 'CAPTCHA verification failed' 
      });
    }
  } catch (error) {
    console.error('CAPTCHA verification error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

module.exports = router;