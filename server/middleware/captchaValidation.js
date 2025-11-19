import captchaGenerate from '../utils/captchaGenerator.js';

export const validateCaptcha = (req, res, next) => {
  const { captcha } = req.body;
  
  // Debug log
  console.log('Captcha from body:', captcha);
  console.log('Captcha from session:', req.session.captcha);
  
  const isValid = captchaGenerate.validate(
    captcha,
    req.session.captcha?.text,
    req.session.captcha?.expiresAt
  );

  if (!isValid) {
    return res.status(400).json({
      success: false,
      message: 'Invalid or expired captcha'
    });
  }


  delete req.session.captcha;
  next();
};