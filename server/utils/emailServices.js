// Mock email service - dalam production, gunakan Nodemailer, SendGrid, dll
export const sendPasswordResetEmail = async (email, resetToken) => {
  try {
    // Dalam real implementation, kirim email dengan link reset
    const resetLink = `http://localhost:3000/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`
    
    console.log('=== PASSWORD RESET EMAIL ===')
    console.log('To:', email)
    console.log('Reset Link:', resetLink)
    console.log('Token:', resetToken)
    console.log('============================')
    
    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    return true
  } catch (error) {
    console.error('Email sending error:', error)
    return false
  }
}

export const sendPasswordChangedEmail = async (email) => {
  try {
    console.log('=== PASSWORD CHANGED NOTIFICATION ===')
    console.log('To:', email)
    console.log('Subject: Your password has been changed')
    console.log('Message: Your password was successfully changed.')
    console.log('=====================================')
    
    return true
  } catch (error) {
    console.error('Email sending error:', error)
    return false
  }
}