import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { sendResetEmail } from '../../utils/mailer.js';
import { hashPassword, comparePasswords } from '../../utils/hash.js';

import {
  adminRegisterSchema,
  adminLoginSchema,
  forgotPasswordSchema,
  resetPasswordSchema  
} from '../../validation/admin.validation.js';
import { uploadToCloudinary } from '../../utils/uploadToCloudinary.js';

const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error("JWT_SECRET is not defined. Please set it in your environment variables.");
  process.exit(1); // Exit if critical env var is missing
}

const { sign, verify } = jwt;

/**
 * Handles admin registration.
 * Validates input, checks for existing email, hashes password, uploads profile image,
 * and creates a new admin user in the database.
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */

export async function register(req, res) {
  // Validate request body against adminRegisterSchema
  const validation = adminRegisterSchema.safeParse(req.body);
  if (!validation.success) {
    // Return detailed validation errors
    return res.status(400).json({
      error: 'Invalid input data for registration',
      details: validation.error.flatten().fieldErrors
    });
  }

  const {
    user_name, f_name, l_name,
    email, phone, city, governorate, country, password
  } = validation.data;

  try {
    // Check if email already exists in the user table
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Hash the password before storing it
    const hashedPassword = await hashPassword(password);

    let imageUrl = null;
    let imageID = null;
    // Check if a file was uploaded (e.g., via multer middleware)
    if (req.file) {
      try {
        // Upload image to Cloudinary.
        const uploadedImage = await uploadToCloudinary(req.file, "admin_profiles"); 
        imageUrl = uploadedImage?.url; 
        imageID = uploadedImage?.public_id; // Get the URL of the first uploaded image
      } catch (uploadError) {
        // Log upload error but don't block registration if image is optional
        console.error("Cloudinary upload failed:", uploadError);
        // Optionally, return an error if image upload is mandatory
        // return res.status(500).json({ error: 'Failed to upload profile image' });
      }
    }

    // Create the new admin user in the database
    const user = await prisma.user.create({
      data: {
        user_name,
        f_name,
        l_name,
        email,
        phone,
        city,
        governorate,
        country,
        role: 'admin', // Assign the 'admin' role
        password: hashedPassword,
        profile_imge: imageUrl ,// Store the uploaded image URL
        image_public_id: imageID ,// Store the uploaded image public ID
      }
    });

    res.status(201).json({ message: 'Admin registered successfully', user: { id: user.id, email: user.email, role: user.role } }); // Return limited user info
  } catch (err) {
    console.error("Admin registration error:", err); // Log the full error
    res.status(500).json({ error: 'Server error during registration', detail: err.message });
  }
}

/**
 * Handles admin login.
 * Validates input, finds admin by email, compares password, and issues a JWT.
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */

export async function login(req, res) {
  // Validate request body against adminLoginSchema
  const validation = adminLoginSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({
      error: 'Invalid input data for login',
      details: validation.error.flatten().fieldErrors
    });
  }

  const { email, password } = validation.data;

  try {
    // Find the user by email and ensure they have the 'admin' role
    const user = await prisma.user.findUnique({ where: { email } });

    // Check if user exists and has the 'admin' role
    if (!user || user.role !== 'admin') {
      return res.status(400).json({ error: 'Invalid credentials or user is not an admin' });
    }

    // Compare the provided password with the hashed password
    const passwordMatch = await comparePasswords(password, user.password);
    if (!passwordMatch) {
      return res.status(400).json({ error: 'Invalid password' });
    }

    // Generate a JWT token
    const token = sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' }); // Token expires in 7 days
    res.json({ message: 'Login successful', token });
  } catch (err) {
    console.error("Admin login error:", err); // Log the full error
    res.status(500).json({ error: 'Server error during login', detail: err.message });
  }
}

/**
 * Handles sending a password reset link to the admin's email.
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */

export async function forgotPassword(req, res) {
  // Validate request body for email
  const validation = forgotPasswordSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({
      error: 'Validation failed',
      details: validation.error.flatten().fieldErrors
    });
  }

  const { email } = validation.data;

  try {
    // Find the user by email and ensure they have the 'admin' role
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.role !== 'admin') {
      // Return 200 OK even if user not found to prevent email enumeration attacks
      return res.status(200).json({ message: 'reset link sent to your email. ' });
    }

    // Generate a short-lived JWT token for password reset
    const resetToken = sign({ id: user.id }, JWT_SECRET, { expiresIn: '15m' }); // Token expires in 15 minutes

    // Store the reset token and its expiry in the database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: resetToken,
        resetTokenExpiresAt: new Date(Date.now() + 15 * 60 * 1000) // 15 minutes from now
      }
    });

    // Construct the reset link (ensure process.env.FRONTEND_URL is set in production)
    const frontendBaseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetLink = `${frontendBaseUrl}/admin/reset-password?token=${resetToken}`;

    // Send the reset email
    await sendResetEmail(user.email, resetLink);

    res.json({ message: ' A password reset link has been sent to your email.' });
  } catch (err) {
    console.error("Forgot password error:", err); // Log the full error
    res.status(500).json({ error: 'Server error during password reset request', detail: err.message });
  }
}

/**
 * Handles resetting the admin's password using a valid token.
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */

export async function resetPassword(req, res) {
  // Validate request body for token and newPassword
  const validation = resetPasswordSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({
      error: 'Validation failed',
      details: validation.error.flatten().fieldErrors
    });
  }

  const { token, newPassword } = validation.data;

  try {
    // Verify the reset token
    const payload = verify(token, JWT_SECRET);
    const userId = payload.id; // Extract user ID from token

    // Find the user and validate the token and its expiry
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user || user.resetToken !== token || new Date() > user.resetTokenExpiresAt) {
      return res.status(400).json({ error: 'Invalid or expired reset token.' });
    }

    // Hash the new password
    const hashedNewPassword = await hashPassword(newPassword);

    // Update the user's password and clear reset token fields
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedNewPassword,
        resetToken: null,
        resetTokenExpiresAt: null
      }
    });

    res.json({ message: 'Password updated successfully.' });
  } catch (err) {
    // Handle JWT verification errors (e.g., JsonWebTokenError, TokenExpiredError)
    if (err instanceof jwt.JsonWebTokenError) {
      return res.status(400).json({ error: 'Invalid or malformed token.' });
    }
    if (err instanceof jwt.TokenExpiredError) {
      return res.status(400).json({ error: 'Reset token has expired.' });
    }
    console.error("Reset password error:", err); // Log the full error
    res.status(500).json({ error: 'Server error during password reset', detail: err.message });
  }
}


