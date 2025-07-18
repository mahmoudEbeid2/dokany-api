import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { sendResetEmail } from '../../utils/mailer.js';
import { hashPassword, comparePasswords } from '../../utils/hash.js';

import {
  customerRegisterSchema,
  customerLoginSchema,
  forgotPasswordSchema,
  resetPasswordSchema  
} from '../../validation/customer.validation.js';
import { uploadToCloudinary } from '../../utils/uploadToCloudinary.js'; 

const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error("JWT_SECRET is not defined. Please set it in your environment variables.");
  process.exit(1); // Exit if critical env var is missing
}

const { sign, verify } = jwt;


export async function register(req, res) {
  // Validate request body against customerRegisterSchema
  const validation = customerRegisterSchema.safeParse(req.body);
  if (!validation.success) {
    // Return detailed validation errors
    return res.status(400).json({
      error: 'Invalid input data for registration',
      details: validation.error.flatten().fieldErrors
    });
  }

  const {
    user_name, f_name, l_name, email, phone,
    city, governorate, country, password,
    seller_id
  } = validation.data;

  try {
    // Check if email already exists in the customer table
    const existingCustomer = await prisma.customer.findFirst({ where: { email } });
    if (existingCustomer) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash the password before storing it
    const hashedPassword = await hashPassword(password);

    let imageUrl = null;
    let imageID = null;
    // Check if a file was uploaded (e.g., via multer middleware)
    if (req.file) {
      try {
        // Upload image to Cloudinary.
        const uploadedImage = await uploadToCloudinary(req.file, "customer_profiles"); 
        imageUrl = uploadedImage?.url; 
        imageID = uploadedImage?.public_id; // Get the URL of the first uploaded image
      } catch (uploadError) {
        // Log upload error but don't block registration if image is optional
        console.error("Cloudinary upload failed:", uploadError);
        // Optionally, return an error if image upload is mandatory
        // return res.status(500).json({ error: 'Failed to upload profile image' });
      }
    }

    // Create the new customer in the database
    const customer = await prisma.customer.create({
      data: {
        user_name,
        f_name,
        l_name,
        email,
        phone,
        city,
        governorate,
        country,
        password: hashedPassword,
        seller_id, 
        profile_imge: imageUrl,
        image_public_id: imageID, 
      }
    });

    res.status(201).json({ message: 'Customer registered successfully', customer: { id: customer.id, email: customer.email } }); // Return limited customer info
  } catch (err) {
    console.error("Customer registration error:", err); // Log the full error
    res.status(500).json({ error: 'Server error during registration', detail: err.message });
  }
}

/**
 * Handles customer login.
 * Validates input, finds customer by email, compares password, and issues a JWT.
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
export async function login(req, res) {
  const validation = customerLoginSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({
      error: 'Invalid input data for login',
      details: validation.error.flatten().fieldErrors
    });
  }

  const { email, password, subdomain } = validation.data;

  try {
    
    const seller = await prisma.user.findUnique({ where: { subdomain } });
    if (!seller) {
      return res.status(400).json({ error: 'Invalid seller domain' });
    }

    
    const customer = await prisma.customer.findFirst({
      where: {
        email,
        seller_id: seller.id,
      }
    });

    if (!customer) {
      return res.status(400).json({ error: 'Invalid credentials for this seller' });
    }

    const passwordMatch = await comparePasswords(password, customer.password);
    if (!passwordMatch) {
      return res.status(400).json({ error: 'Invalid password' });
    }

    const token = sign({ id: customer.id, role: 'customer' }, JWT_SECRET, { expiresIn: '7d' });

    res.json({ message: 'Login successful', token });

  } catch (err) {
    console.error("Customer login error:", err);
    res.status(500).json({ error: 'Server error during login', detail: err.message });
  }
}


/**
 * Handles sending a password reset link to the customer's email.
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
    // Find the customer by email
    const customer = await prisma.customer.findUnique({ where: { email } });
    if (!customer) {
      // Return 200 OK even if user not found to prevent email enumeration attacks
      return res.status(200).json({ message: 'reset link sent to your email.' });
    }

    // Generate a short-lived JWT token for password reset
    const resetToken = sign({ id: customer.id }, JWT_SECRET, { expiresIn: '15m' }); // Token expires in 15 minutes

    // Store the reset token and its expiry in the database
    await prisma.customer.update({
      where: { id: customer.id },
      data: {
        resetToken: resetToken,
        resetTokenExpiresAt: new Date(Date.now() + 15 * 60 * 1000) // 15 minutes from now
      }
    });

    // Construct the reset link (ensure process.env.FRONTEND_URL is set in production)
    const frontendBaseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetLink = `${frontendBaseUrl}/customer/reset-password?token=${resetToken}`;

    // Send the reset email
    await sendResetEmail(customer.email, resetLink);

    res.json({ message: 'A password reset link has been sent to your email.' });
  } catch (err) {
    console.error("Forgot password error:", err); // Log the full error
    res.status(500).json({ error: 'Server error during password reset request', detail: err.message });
  }
}

/**
 * Handles resetting the customer's password using a valid token.
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
    const customerId = payload.id; // Extract customer ID from token

    // Find the customer and validate the token and its expiry
    const customer = await prisma.customer.findUnique({ where: { id: customerId } });

    if (!customer || customer.resetToken !== token || new Date() > customer.resetTokenExpiresAt) {
      return res.status(400).json({ error: 'Invalid or expired reset token.' });
    }

    // Hash the new password
    const hashedNewPassword = await hashPassword(newPassword);

    // Update the customer's password and clear reset token fields
    await prisma.customer.update({
      where: { id: customer.id },
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


