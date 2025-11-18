
import { login} from '../middleware/validation.js'

export const login = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email }
    })

    if (!user || !(await bcrypt.compare(validatedData.password, user.password))) {
      await logAudit(
        AUDIT_ACTIONS.LOGIN_FAILED,
        null,
        validatedData.email,
        'Invalid login credentials with CAPTCHA',
        req.ip,
        req.get('User-Agent')
      )
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    // Set session
    req.session.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }

    // Configure session cookie based on remember me
    if (validatedData.rememberMe) {
      req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000 // 30 days
    } else {
      req.session.cookie.expires = false
    }

    // Audit log successful login
    await logAudit(
      AUDIT_ACTIONS.LOGIN,
      user.id,
      user.email,
      `User logged in successfully with CAPTCHA (Remember Me: ${validatedData.rememberMe})`,
      req.ip,
      req.get('User-Agent')
    )

    res.json({
      message: 'Login successful',
      user: req.session.user
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: error.errors 
      })
    }
    
    await logAudit(
      AUDIT_ACTIONS.LOGIN_FAILED,
      null,
      req.body.email,
      `Login error: ${error.message}`,
      req.ip,
      req.get('User-Agent')
    )
    
    res.status(500).json({ error: 'Internal server error' })
  }
}