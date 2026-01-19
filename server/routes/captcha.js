import express from 'express'
import { captchaService } from '../utils/captcha.js'

const router = express.Router()

// Generate CAPTCHA baru
router.get('/generate', (req, res) => {
  try {
    // Pilih random antara math atau text CAPTCHA
    const useMath = Math.random() > 0.5
    const captcha = useMath 
      ? captchaService.generateMathCaptcha()
      : captchaService.generateTextCaptcha()
    
    res.json({
      success: true,
      captcha
    })
  } catch (error) {
    console.error('CAPTCHA generation error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to generate CAPTCHA'
    })
  }
})

// Validate CAPTCHA
router.post('/validate', (req, res) => {
  try {
    const { captchaId, answer } = req.body
    
    if (!captchaId || !answer) {
      return res.status(400).json({
        success: false,
        error: 'CAPTCHA ID and answer are required'
      })
    }
    
    const result = captchaService.validateCaptcha(captchaId, answer)
    
    res.json({
      success: result.valid,
      valid: result.valid,
      error: result.error
    })
  } catch (error) {
    console.error('CAPTCHA validation error:', error)
    res.status(500).json({
      success: false,
      error: 'CAPTCHA validation failed'
    })
  }
})

// CAPTCHA stats (admin only)
router.get('/stats', (req, res) => {
  try {
    const stats = captchaService.getStats()
    res.json({
      success: true,
      stats
    })
  } catch (error) {
    console.error('CAPTCHA stats error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to get CAPTCHA stats'
    })
  }
})

export default router