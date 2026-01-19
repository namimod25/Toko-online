class CaptchaService {
  constructor() {
    // Store untuk session-based CAPTCHA (bisa diganti dengan Redis di production)
    this.captchaStore = new Map()
  }

  // Generate math CAPTCHA
  generateMathCaptcha() {
    const operators = ['+', '-', '*']
    const operator = operators[Math.floor(Math.random() * operators.length)]
    
    let num1, num2, answer
    
    switch(operator) {
      case '+':
        num1 = Math.floor(Math.random() * 10) + 1
        num2 = Math.floor(Math.random() * 10) + 1
        answer = num1 + num2
        break
      case '-':
        num1 = Math.floor(Math.random() * 20) + 10
        num2 = Math.floor(Math.random() * 10) + 1
        answer = num1 - num2
        break
      case '*':
        num1 = Math.floor(Math.random() * 5) + 1
        num2 = Math.floor(Math.random() * 5) + 1
        answer = num1 * num2
        break
    }
    
    const question = `${num1} ${operator} ${num2}`
    const captchaId = Date.now().toString(36) + Math.random().toString(36).substr(2)
    
    // expiry 5 menit
    this.captchaStore.set(captchaId, {
      answer: answer.toString(),
      expiresAt: Date.now() + 5 * 60 * 1000 // 5 minutes
    })
    
    // Clean up expired CAPTCHAs
    this.cleanupExpired()
    
    return {
      captchaId,
      question,
      type: 'math'
    }
  }

  // Generate text CAPTCHA dengan random characters
  generateTextCaptcha() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // Exclude confusing characters
    let captchaText = ''
    
    for (let i = 0; i < 5; i++) {
      captchaText += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    
    const captchaId = Date.now().toString(36) + Math.random().toString(36).substr(2)
    
    // Store answer dengan expiry 5 menit
    this.captchaStore.set(captchaId, {
      answer: captchaText,
      expiresAt: Date.now() + 5 * 60 * 1000
    })
    
    // Clean up expired CAPTCHAs
    this.cleanupExpired()
    
    return {
      captchaId,
      text: captchaText,
      type: 'text'
    }
  }

  // Validate CAPTCHA response
  validateCaptcha(captchaId, userAnswer) {
    if (!captchaId || !userAnswer) {
      return { valid: false, error: 'CAPTCHA response required' }
    }
    
    const captchaData = this.captchaStore.get(captchaId)
    
    if (!captchaData) {
      return { valid: false, error: 'Invalid or expired CAPTCHA' }
    }
    
    // Check expiry
    if (Date.now() > captchaData.expiresAt) {
      this.captchaStore.delete(captchaId)
      return { valid: false, error: 'CAPTCHA expired' }
    }
    
    const isValid = captchaData.answer.toLowerCase() === userAnswer.toString().toLowerCase().trim()
    
    // Delete CAPTCHA setelah digunakan (one-time use)
    this.captchaStore.delete(captchaId)
    
    return {
      valid: isValid,
      error: isValid ? null : 'Incorrect CAPTCHA answer'
    }
  }

  // Cleanup expired CAPTCHAs
  cleanupExpired() {
    const now = Date.now()
    for (const [captchaId, data] of this.captchaStore.entries()) {
      if (now > data.expiresAt) {
        this.captchaStore.delete(captchaId)
      }
    }
  }

  // Get stats (untuk monitoring)
  getStats() {
    return {
      activeCaptchas: this.captchaStore.size,
      storeSize: this.captchaStore.size
    }
  }
}

// Export singleton instance
export const captchaService = new CaptchaService()