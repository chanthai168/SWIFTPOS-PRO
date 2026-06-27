// emailService.js
import nodemailer from 'nodemailer';
import type { TransportOptions } from 'nodemailer';
import dotenv from 'dotenv';

const __dirname = import.meta.dirname;
dotenv.config({path:`${__dirname}/../../.env`});


// Configure email transporter
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
} as TransportOptions);

export async function sendVerificationEmail(email: string, token: string, username: string) {
    try {
        const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${token}`;

        console.log("📧 Sending verification email to:", email);
        console.log("🔗 Verification URL:", verificationUrl);
        console.log("Frontend URL from env:", process.env.FRONTEND_URL);

        // Check critical environment variables
        const requiredEnv = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'SMTP_FROM_EMAIL', 'FRONTEND_URL'];
        for (const key of requiredEnv) {
            if (!process.env[key]) {
                console.error(`❌ Missing environment variable: ${key}`);
                throw new Error(`Missing env var: ${key}`);
            }
        }

        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .button { display: inline-block; padding: 12px 24px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 4px; }
                    .footer { margin-top: 30px; font-size: 12px; color: #777; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h2>Welcome to Our App!</h2>
                    <p>Hi ${username},</p>
                    <p>Thank you for signing up! Please verify your email address to complete your registration.</p>
                    <p>
                        <a href="${verificationUrl}" class="button">Verify Email Address</a>
                    </p>
                    <p>Or copy and paste this link: ${verificationUrl}</p>
                    <p>This link will expire in 24 hours.</p>
                    <div class="footer">
                        <p>If you didn't create an account with us, please ignore this email.</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        const info = await transporter.sendMail({
            from: `"App Name" <${process.env.SMTP_FROM_EMAIL}>`,
            to: email,
            subject: 'Verify Your Email Address',
            html: htmlContent,
        });

        console.log("✅ Email sent successfully! Message ID:", info.messageId);
        console.log("Message sent:", info.messageId);

        // ← Add this line
        const previewUrl = nodemailer.getTestMessageUrl(info);
        console.log("🔗 Preview URL:", previewUrl);

    } catch (error: any) {
        console.error("❌ Failed to send verification email:");
        console.error("Error message:", error.message);
        console.error("Error code:", error.code);
        console.error("Error response:", error.response);
        throw error; // Re-throw so the signup process knows it failed
    }
}

export async function sendWelcomeEmail(email:string, username:string) {
    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            </style>
        </head>
        <body>
            <div class="container">
                <h2>Welcome to Our App!</h2>
                <p>Hi ${username},</p>
                <p>Your email has been successfully verified. You can now log in and start using our platform.</p>
                <p>Here are some things you can do:</p>
                <ul>
                    <li>Complete your profile</li>
                    <li>Explore our features</li>
                    <li>Connect with other users</li>
                </ul>
                <p>If you have any questions, feel free to contact our support team.</p>
            </div>
        </body>
        </html>
    `;
    
    await transporter.sendMail({
        from: `"App Name" <${process.env.SMTP_FROM_EMAIL}>`,
        to: email,
        subject: 'Welcome! 🎉',
        html: htmlContent
    });
}

export async function sendPasswordResetEmail(email:string, token:string, username:string) {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;
    
    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .button { display: inline-block; padding: 12px 24px; background-color: #f44336; color: white; text-decoration: none; border-radius: 4px; }
            </style>
        </head>
        <body>
            <div class="container">
                <h2>Password Reset Request</h2>
                <p>Hi ${username},</p>
                <p>We received a request to reset your password. Click the button below to create a new password:</p>
                <p>
                    <a href="${resetUrl}" class="button">Reset Password</a>
                </p>
                <p>This link will expire in 1 hour.</p>
                <p>If you didn't request this, please ignore this email or contact support.</p>
            </div>
        </body>
        </html>
    `;
    
    await transporter.sendMail({
        from: `"App Name" <${process.env.SMTP_FROM_EMAIL}>`,
        to: email,
        subject: 'Password Reset Request',
        html: htmlContent
    });
}
    export async function sendPOEmail(
    supplierEmail: string,
    supplierName: string,
    po: {
        id: number;
        order_date: string;
        expected_delivery_date: string | null;
        notes: string | null;
        total_cost: string | number;
        items: {
        product_name: string;
        variant_name: string;
        sku: string;
        quantity: number;
        unit_cost: string | number;
        total_cost: string | number;
        }[];
    }
    ) {
    const itemRows = po.items.map(item => `
        <tr>
        <td style="padding: 8px; border: 1px solid #ddd;">${item.product_name} (${item.variant_name})</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${item.sku}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${item.quantity}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">$${Number(item.unit_cost).toFixed(2)}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">$${Number(item.total_cost).toFixed(2)}</td>
        </tr>
    `).join('');

    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2>Purchase Order #${po.id}</h2>
        <p>Dear ${supplierName},</p>
        <p>Please find below our purchase order details.</p>

        <p><strong>Order Date:</strong> ${new Date(po.order_date).toLocaleDateString()}</p>
        <p><strong>Expected Delivery:</strong> ${po.expected_delivery_date ? new Date(po.expected_delivery_date).toLocaleDateString() : 'N/A'}</p>
        ${po.notes ? `<p><strong>Notes:</strong> ${po.notes}</p>` : ''}

        <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
            <thead>
            <tr style="background-color: #f3f4f6;">
                <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Product</th>
                <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">SKU</th>
                <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Qty</th>
                <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Unit Cost</th>
                <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Total</th>
            </tr>
            </thead>
            <tbody>
            ${itemRows}
            </tbody>
        </table>

        <p style="margin-top: 16px;"><strong>Total Amount: $${Number(po.total_cost).toFixed(2)}</strong></p>

        <p style="margin-top: 24px;">Please confirm receipt of this order.</p>
        <p>Thank you.</p>
        </div>
    `;

    await transporter.sendMail({
        from: `"SWIFTPOS-PRO" <${process.env.SMTP_FROM_EMAIL}>`,
        to: supplierEmail,
        subject: `Purchase Order #${po.id} from SWIFTPOS-PRO`,
        html,
    });
    }
