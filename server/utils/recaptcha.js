import axios from 'axios'

const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY || process.env.RECAPTCHA_SECRET
const RECAPTCHA_VERIFY_URL = 'https://www.google.com/recaptcha/api/siteverify'

// Verify a reCAPTCHA token with Google and return a normalized result
export const verifyRecaptcha = async (recaptchaToken) => {
    try {
        // Allow local development to bypass when token missing if explicitly configured
        if (process.env.NODE_ENV === 'development' && !recaptchaToken) {
            console.log('Development mode: Skipping reCAPTCHA verify')
            return { success: true }
        }

        if (!recaptchaToken) {
            return { success: false, error: 'reCAPTCHA token is required' }
        }

        const response = await axios.post(RECAPTCHA_VERIFY_URL, null, {
            params: {
                secret: RECAPTCHA_SECRET_KEY,
                response: recaptchaToken
            }
        })

        const data = response.data || {}

        return {
            success: !!data.success,
            score: typeof data.score === 'number' ? data.score : undefined,
            action: data.action,
            errorCodes: data['error-codes'] || []
        }
    } catch (error) {
        console.error('reCAPTCHA verification error', error)
        return { success: false, error: 'Failed to verify reCAPTCHA' }
    }
}