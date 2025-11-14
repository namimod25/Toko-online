import { verifyRecaptcha } from '../utils/recaptcha.js'

const verifyRecaptchaMiddleware = async (req, res, next) => {
  try {
    const { recaptchaToken } = req.body

    
    if (process.env.NODE_ENV === 'development' && !recaptchaToken) {
      logger.info('Development mode: Bypassing reCAPTCHA verification')
      return next()
    }

    if (!recaptchaToken) {
      return res.status(400).json({
        error: 'reCAPTCHA verification required'
      })
    }

    const recaptchaResult = await verifyRecaptcha(recaptchaToken)

    if (!recaptchaResult.success) {
      return res.status(400).json({
        error: 'reCAPTCHA verification failed',
        details: recaptchaResult.errorCodes
      })
    }

    // Optional: Check score for additional security (reCAPTCHA v3)
    if (recaptchaResult.score && recaptchaResult.score < 0.5) {
      return res.status(400).json({
        error: 'Suspicious activity detected',
        score: recaptchaResult.score
      })
    }

    next()
  } catch (error) {
    console.error('reCAPTCHA middleware error:', error)
    return res.status(500).json({
      error: 'Internal server error during CAPTCHA verification'
    })
  }
}
export default verifyRecaptchaMiddleware