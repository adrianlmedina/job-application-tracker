import { z } from 'zod';

// defining the shape that the data must have
// Zod will reject a name < 2 chars long and a password < 8 chars long

export const registerSchema = z.object({
  name: z.string().min(2, 'name must be at least 2 characters'),
  email: z.string().email('invalid email address'),
  password: z.string().min(8, 'password must be at least 8 characters'),
});

export type RegisterInput = z.infer<typeof registerSchema>;

// loginSchema is intentionally using a generic error message 
// we don't want to reveal whether email or password is invalid for safety
export const loginSchema = z.object({
    email: z.string().email('email or password is incorrect'),
    password: z.string().min(1, 'email or password is incorrect'),
}) 

export type RegisterLogin = z.infer<typeof loginSchema>;



