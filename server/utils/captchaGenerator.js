class captchaGenerate {
  constructor() {
    this.characters = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    this.length = 6;
  }

  generateText() {
    let result = '';
    const charactersLength = this.characters.length;
    
    for (let i = 0; i < this.length; i++) {
      result += this.characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    
    console.log('Generated captcha text:', result);
    return result;
  }

  generate() {
    try {
      const text = this.generateText();
      
      if (!text || text.length !== this.length) {
        throw new Error('Failed to generate valid captcha text');
      }
      
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 menit
      
      console.log('Captcha generated:', { text, expiresAt }); // Debug log
      
      return {
        text,
        expiresAt: expiresAt.toISOString() // Convert to ISO string untuk konsistensi
      };
    } catch (error) {
      console.error('Error generating captcha:', error);
      throw error;
    }
  }

  validate(captchaText, storedText, storedExpiresAt) {
    if (!captchaText || !storedText || !storedExpiresAt) {
      console.log('Validation failed: missing data', { captchaText, storedText, storedExpiresAt });
      return false;
    }

    const now = new Date();
    const expiryDate = new Date(storedExpiresAt);
    
    if (now > expiryDate) {
      console.log('Validation failed: captcha expired', { now, expiryDate });
      return false;
    }

    const isValid = captchaText.toLowerCase() === storedText.toLowerCase();
    console.log('Captcha validation result:', { 
      input: captchaText, 
      stored: storedText, 
      isValid 
    });
    
    return isValid;
  }
}

export default new captchaGenerate();