import { z } from 'zod';

// Reusable list of common email domains for consistency across schemas
const commonEmailDomains = [
  'gmail.com',
  'yahoo.com',
  'outlook.com',
  'hotmail.com',
  'aol.com',
  'icloud.com',
  'protonmail.com',
  // Add other recognized domains as needed, keep this list consistent across all schemas
];

// ---
// Admin Registration Schema
// ---
export const adminRegisterSchema = z.object({
  user_name: z.string()
    .min(3, "Username must be at least 3 characters long")
    .max(30, "Username cannot exceed 30 characters")
    .regex(/^[a-zA-Z0-9_.-]+$/, "Username can only contain English letters, numbers, underscores, periods, or hyphens")
    .trim(), // Remove leading/trailing whitespace

  f_name: z.string()
    .min(2, "First name is required and must be at least 2 characters")
    .max(50, "First name cannot exceed 50 characters")
    .regex(/^[a-zA-Z\u0600-\u06FF\s.'-]+$/, "First name must contain letters only")
    .trim(),

  l_name: z.string()
    .min(2, "Last name is required and must be at least 2 characters")
    .max(50, "Last name cannot exceed 50 characters")
    .regex(/^[a-zA-Z\u0600-\u06FF\s.'-]+$/, "Last name must contain letters only")
    .trim(),

  email: z.string()
    .min(1, "Email is required")
    .email("Invalid email format. Please enter a valid email address.")
    .refine((email) => {
      const domain = email.split('@')[1];
      // Enforce common domains and exclude disposable ones for better data quality for admins
      return commonEmailDomains.includes(domain) && !domain.includes('mailinator.com');
    }, {
      message: "Email must be from a recognized provider (e.g., Gmail, Outlook, Yahoo)."
    }),

  phone: z.string()
    .min(8, "Phone number is too short (at least 8 digits)")
    .max(15, "Phone number is too long (maximum 15 digits)")
    .regex(/^[0-9+()-\s]*$/, "Phone number can only contain digits or international characters (+, -, parenthesis)")
    .trim(),

  city: z.string()
    .min(2, "City name is required and must be at least 2 characters")
    .max(100, "City name is too long")
    .regex(/^[a-zA-Z\u0600-\u06FF\s.'-]+$/, "City name must contain letters only")
    .trim(),

  governorate: z.string()
    .min(2, "Governorate name is required and must be at least 2 characters")
    .max(100, "Governorate name is too long")
    .regex(/^[a-zA-Z\u0600-\u06FF\s.'-]+$/, "Governorate name must contain letters only")
    .trim(),

  country: z.string()
    .min(2, "Country name is required and must be at least 2 characters")
    .max(100, "Country name is too long")
    .regex(/^[a-zA-Z\u0600-\u06FF\s.'-]+$/, "Country name must contain letters only")
    .trim(),

  password: z.string()
    .min(8, "Password must be at least 8 characters long") // Stronger minimum for security
    .max(50, "Password cannot exceed 50 characters")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one digit")
    .regex(/[^a-zA-Z0-9]/, "Password must contain at least one special character (e.g., !@#$%^&*)"),
});

// ---
// Admin Login Schema
// ---
export const adminLoginSchema = z.object({
  // avoid complex password regex validation on login better for User Experience; 

  email: z.string()
    .min(1, "Email is required")
    .email("Invalid email format. Please enter a valid email address."),
  password: z.string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters long."),
});

// ---
// Admin Forgot Password Schema
// ---
export const forgotPasswordSchema = z.object({
  email: z.string()
    .min(1, "Email is required")
    .email("Invalid email format. Please enter a valid email address.")
});

// ---
// Admin Reset Password Schema
// ---
export const resetPasswordSchema = z.object({
  token: z.string()
    .min(1, "Reset token is required"), // The token from the URL/body

  // New password validation should be as strict as registration password
  newPassword: z.string()
    .min(8, "New password must be at least 8 characters long")
    .max(50, "New password cannot exceed 50 characters")
    .regex(/[a-z]/, "New password must contain at least one lowercase letter")
    .regex(/[A-Z]/, "New password must contain at least one uppercase letter")
    .regex(/[0-9]/, "New password must contain at least one digit")
    .regex(/[^a-zA-Z0-9]/, "New password must contain at least one special character (e.g., !@#$%^&*)"),
});
