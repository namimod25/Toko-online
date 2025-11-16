export class CaptchaCreate {
  // Generate random CAPTCHA text
  static generateText(length = 6) {
    try {
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
      let captchaText = '';
      
      for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * chars.length);
        captchaText += chars[randomIndex];
      }
      
      return captchaText;
    } catch (error) {
      console.error('Error generating CAPTCHA text:', error);
      // Fallback to simple random string
      return Math.random().toString(36).substring(2, 2 + length).toUpperCase();
    }
  }

  // Generate CAPTCHA ID
  static generateId() {
    try {
      return Date.now().toString(36) + Math.random().toString(36).substring(2);
    } catch (error) {
      console.error('Error generating CAPTCHA ID:', error);
      return 'captcha_' + Date.now();
    }
  }

  // Validate CAPTCHA input (case insensitive)
  static validateInput(captchaText, userInput) {
    if (!captchaText || !userInput) {
      return false;
    }
    
    // Remove whitespace and convert to lowercase for comparison
    const cleanCaptcha = captchaText.toString().trim().toLowerCase();
    const cleanUserInput = userInput.toString().trim().toLowerCase();
    
    return cleanCaptcha === cleanUserInput;
  }

  // Alternative method with more options
  static generateAdvanced(options = {}) {
    const {
      length = 6,
      useNumbers = true,
      useLetters = true,
      caseSensitive = false
    } = options;

    let chars = '';
    if (useLetters) chars += 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz';
    if (useNumbers) chars += '23456789';

    if (!chars) {
      chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    }

    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return {
      text: caseSensitive ? result : result.toUpperCase(),
      id: this.generateId(),
      length: length
    };
  }
}