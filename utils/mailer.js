import { createTransport } from 'nodemailer';

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

const transporter = createTransport({
  service: 'gmail',
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

/**
 * إرسال بريد إلكتروني لإعادة تعيين كلمة المرور
 * @param {string} to - البريد المستلم
 * @param {string} resetLink - رابط إعادة التعيين
 */
export async function sendResetEmail(to, resetLink) {
  try {
    const mailOptions = {
      from: `"No Reply" <${EMAIL_USER}>`,
      to,
      subject: 'Password Reset',
      html: `
        <h2>Reset Your Password</h2>
        <p>Click the link below to reset your password:</p>
        <a href="${resetLink}">${resetLink}</a>
        <p>This link will expire in 15 minutes.</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Reset email sent to:', to);
  } catch (error) {
    console.error('❌ Failed to send reset email:', error.message);
    throw new Error('Failed to send reset email');
  }
}
