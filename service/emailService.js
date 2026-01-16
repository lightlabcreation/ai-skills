import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();


const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS,
  },
});

export const sendVerificationProfile = async (email) => {
  try {
    const mailOptions = {
      from: `"AI SKILLS" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your Profile Verified by Admin - AI SKILLS',
      html: `
        <div class="main-banner" style="width: 100%; text-align: center;">
          <div class="banner-image" style="width: 100%; text-align: center; background: black;">
            <h1 style="color: white; padding: 20px 0;">AI SKILLS</h1>
          </div>
    
          <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9;">
            <h2 style="color: #333;">Your Email Has Been Verified!</h2>
            <p>The admin has successfully verified your Profile. You can now access all features of AI SKILLS.</p>
            <a href="${process.env.BASE_URL}" 
               style="display: inline-block; padding: 12px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">
              Go to Login
            </a>
            <p style="color: #999; margin-top: 20px;">If you have any questions, feel free to contact support.</p>
          </div>
        </div>
      `,
    };    

    await transporter.sendMail(mailOptions);
    console.log(`Verification Profile sent to: ${email}`);
  } catch (error) {
    console.error('Error sending verification Profile:', error);
    throw new Error('Failed to send verification Profile');
  }
};



