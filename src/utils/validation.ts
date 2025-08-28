import { z } from 'zod';

export const loginSchema = z.object({
  employeeId: z.string().min(3, 'Employee ID must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const otpSchema = z.object({
  otp: z.string()
    .length(4, 'OTP must be exactly 4 digits')
    .regex(/^\d{4}$/, 'OTP must contain only numeric digits'),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type OTPFormData = z.infer<typeof otpSchema>;