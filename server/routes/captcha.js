import express from 'express';
import { generateCaptcha, validateCaptcha } from '../controllers/captchaController.js';

const router = express.Router();

router.get('/generate', generateCaptcha);

router.post('/validate', validateCaptcha);

export default router;