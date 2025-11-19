import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  captcha: z.string().min(1, 'Security code is required')
})

export const registerSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces'),
  
  email: z.string()
    .email('Please enter a valid email address'),
  
  password: z.string()
    .min(6, 'Password must be at least 6 characters')
     .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  confirmPassword: z.string(),
  
  captcha: z.string()
    .min(1, 'Security code is required') // Ubah dari length(6) ke min(1) dulu untuk testing
    .length(6, 'Security code must be exactly 6 characters')
    .regex(/^[A-Za-z0-9]+$/, 'Security code can only contain letters and numbers')
})
.refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});