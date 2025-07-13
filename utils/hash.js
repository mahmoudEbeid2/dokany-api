import { genSalt, hash, compare } from 'bcryptjs';

/**
 * تشفير كلمة المرور
 * @param {string} password
 * @returns {Promise<string>} hashed password
 */
export async function hashPassword(password) {
  const salt = await genSalt(10);
  return await hash(password, salt);
}

/**
 * مقارنة كلمة المرور الأصلية مع المشفرة
 * @param {string} plainPassword
 * @param {string} hashedPassword
 * @returns {Promise<boolean>}
 */
export async function comparePasswords(plainPassword, hashedPassword) {
  return await compare(plainPassword, hashedPassword);
}
