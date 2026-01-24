const WALLET_ICON_SVG = `
<img 
  src="https://cdn-icons-png.flaticon.com/512/2331/2331943.png"
  width="48"
  height="48"
  alt="SmartSplit Wallet"
  style="display:block;margin:0 auto;"
/>
`;

// OTP Verification Email Template
exports.OTP_VERIFICATION_TEMPLATE = (otp, userName, expiryMinutes = 10) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email - SmartSplit</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td style="padding: 40px 20px;">
                <!-- Main Container -->
                <table role="presentation" style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);">
                    
                    <!-- Header with Gradient -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); padding: 40px 30px; text-align: center;">
                            <div style="margin-bottom: 15px;">
                                ${WALLET_ICON_SVG}
                            </div>
                            <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">
                                🔐 SmartSplit
                            </h1>
                            <p style="margin: 10px 0 0 0; color: rgba(255, 255, 255, 0.9); font-size: 16px;">
                                Verify Your Email Address
                            </p>
                        </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <h2 style="margin: 0 0 20px 0; color: #1f2937; font-size: 24px; font-weight: 600;">
                                Hello ${userName || "there"}! 👋
                            </h2>
                            
                            <p style="margin: 0 0 20px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                                Thank you for signing up with SmartSplit! To complete your registration and secure your account, please verify your email address using the code below.
                            </p>

                            <!-- OTP Box -->
                            <table role="presentation" style="width: 100%; margin: 30px 0;">
                                <tr>
                                    <td style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border: 2px dashed #f59e0b; border-radius: 12px; padding: 30px; text-align: center;">
                                        <p style="margin: 0 0 10px 0; color: #92400e; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                                            Your Verification Code
                                        </p>
                                        <div style="background: #ffffff; border-radius: 8px; padding: 20px; display: inline-block; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                                            <p style="margin: 0; font-size: 42px; font-weight: 700; letter-spacing: 8px; color: #f97316; font-family: 'Courier New', monospace;">
                                                ${otp}
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            </table>

                            <!-- Warning Box -->
                            <table role="presentation" style="width: 100%; margin: 20px 0;">
                                <tr>
                                    <td style="background: #fef2f2; border-left: 4px solid #ef4444; border-radius: 8px; padding: 16px;">
                                        <p style="margin: 0; color: #991b1b; font-size: 14px; line-height: 1.5;">
                                            ⏰ <strong>Important:</strong> This code will expire in <strong>${expiryMinutes} minutes</strong>. Please use it promptly.
                                        </p>
                                    </td>
                                </tr>
                            </table>

                            <p style="margin: 20px 0 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                                If you didn't create an account with SmartSplit, you can safely ignore this email.
                            </p>
                        </td>
                    </tr>

                    <!-- Security Tips -->
                    <tr>
                        <td style="background: #f9fafb; padding: 30px; border-top: 1px solid #e5e7eb;">
                            <h3 style="margin: 0 0 15px 0; color: #1f2937; font-size: 16px; font-weight: 600;">
                                🛡️ Security Tips
                            </h3>
                            <ul style="margin: 0; padding-left: 20px; color: #6b7280; font-size: 14px; line-height: 1.8;">
                                <li>Never share your verification code with anyone</li>
                                <li>SmartSplit will never ask for your code via phone or email</li>
                                <li>Always verify the sender's email address</li>
                            </ul>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background: #111827; padding: 30px; text-align: center;">
                            <p style="margin: 0 0 10px 0; color: #9ca3af; font-size: 14px;">
                                Need help? Contact us at <a href="mailto:smartsplit.noreply@gmail.com" style="color: #f97316; text-decoration: none;">smartsplit.noreply@gmail.com</a>
                            </p>
                            <p style="margin: 0; color: #6b7280; font-size: 12px;">
                                © ${new Date().getFullYear()} SmartSplit. All rights reserved.
                            </p>
                            <p style="margin: 10px 0 0 0; color: #6b7280; font-size: 12px;">
                                Track expenses smartly, split bills easily
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
`;

// Password Reset Email Template
exports.PASSWORD_RESET_TEMPLATE = (otp, userName, expiryMinutes = 10) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password - SmartSplit</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td style="padding: 40px 20px;">
                <!-- Main Container -->
                <table role="presentation" style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);">
                    
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 40px 30px; text-align: center;">
                            <div style="margin-bottom: 15px;">
                                ${WALLET_ICON_SVG}
                            </div>
                            <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">
                                SmartSplit
                            </h1>
                            <p style="margin: 10px 0 0 0; color: rgba(255, 255, 255, 0.9); font-size: 16px;">
                                Password Reset Request
                            </p>
                        </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <h2 style="margin: 0 0 20px 0; color: #1f2937; font-size: 24px; font-weight: 600;">
                                Hello ${userName || "there"}! 👋
                            </h2>
                            
                            <p style="margin: 0 0 20px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                                We received a request to reset the password for your SmartSplit account. Use the code below to reset your password and regain access to your account.
                            </p>

                            <!-- OTP Box -->
                            <table role="presentation" style="width: 100%; margin: 30px 0;">
                                <tr>
                                    <td style="background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%); border: 2px dashed #ef4444; border-radius: 12px; padding: 30px; text-align: center;">
                                        <p style="margin: 0 0 10px 0; color: #991b1b; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                                            Password Reset Code
                                        </p>
                                        <div style="background: #ffffff; border-radius: 8px; padding: 20px; display: inline-block; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                                            <p style="margin: 0; font-size: 42px; font-weight: 700; letter-spacing: 8px; color: #ef4444; font-family: 'Courier New', monospace;">
                                                ${otp}
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            </table>

                            <!-- Warning Box -->
                            <table role="presentation" style="width: 100%; margin: 20px 0;">
                                <tr>
                                    <td style="background: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 16px;">
                                        <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.5;">
                                            ⏰ <strong>Quick action needed:</strong> This reset code expires in <strong>${expiryMinutes} minutes</strong> for your security.
                                        </p>
                                    </td>
                                </tr>
                            </table>

                            <table role="presentation" style="width: 100%; margin: 20px 0;">
                                <tr>
                                    <td style="background: #fef2f2; border-left: 4px solid #ef4444; border-radius: 8px; padding: 16px;">
                                        <p style="margin: 0 0 10px 0; color: #991b1b; font-size: 14px; font-weight: 600;">
                                            🚨 Didn't request this?
                                        </p>
                                        <p style="margin: 0; color: #7f1d1d; font-size: 14px; line-height: 1.5;">
                                            If you didn't request a password reset, please ignore this email and ensure your account is secure. Consider changing your password if you suspect unauthorized access.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Steps -->
                    <tr>
                        <td style="background: #f9fafb; padding: 30px; border-top: 1px solid #e5e7eb;">
                            <h3 style="margin: 0 0 15px 0; color: #1f2937; font-size: 16px; font-weight: 600;">
                                📝 Next Steps
                            </h3>
                            <ol style="margin: 0; padding-left: 20px; color: #6b7280; font-size: 14px; line-height: 1.8;">
                                <li>Enter the code above on the password reset page</li>
                                <li>Create a strong new password</li>
                                <li>Confirm your new password</li>
                                <li>Log in with your new credentials</li>
                            </ol>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background: #111827; padding: 30px; text-align: center;">
                            <p style="margin: 0 0 10px 0; color: #9ca3af; font-size: 14px;">
                                Need help? Contact us at <a href="mailto:smartsplit.noreply@gmail.com" style="color: #f97316; text-decoration: none;">smartsplit.noreply@gmail.com</a>
                            </p>
                            <p style="margin: 0; color: #6b7280; font-size: 12px;">
                                © ${new Date().getFullYear()} SmartSplit. All rights reserved.
                            </p>
                            <p style="margin: 10px 0 0 0; color: #6b7280; font-size: 12px;">
                                Track expenses smartly, split bills easily
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
`;

// 2FA Login Verification Email Template
exports.TWO_FACTOR_LOGIN_TEMPLATE = (
  otp,
  userName,
  deviceInfo = "Unknown Device",
) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login Verification - SmartSplit</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td style="padding: 40px 20px;">
                <!-- Main Container -->
                <table role="presentation" style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);">
                    
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 40px 30px; text-align: center;">
                            <div style="margin-bottom: 15px;">
                                ${WALLET_ICON_SVG}
                            </div>
                            <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">
                                SmartSplit
                            </h1>
                            <p style="margin: 10px 0 0 0; color: rgba(255, 255, 255, 0.9); font-size: 16px;">
                                Two-Factor Authentication
                            </p>
                        </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <h2 style="margin: 0 0 20px 0; color: #1f2937; font-size: 24px; font-weight: 600;">
                                Hello ${userName || "there"}! 👋
                            </h2>
                            
                            <p style="margin: 0 0 20px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                                Someone is attempting to log in to your SmartSplit account. To verify it's you, please use the code below.
                            </p>

                            <!-- Device Info -->
                            <table role="presentation" style="width: 100%; margin: 20px 0;">
                                <tr>
                                    <td style="background: #f3f4f6; border-radius: 8px; padding: 16px;">
                                        <p style="margin: 0 0 5px 0; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">
                                            Login Attempt From
                                        </p>
                                        <p style="margin: 0; color: #1f2937; font-size: 14px; font-weight: 500;">
                                            📱 ${deviceInfo}
                                        </p>
                                    </td>
                                </tr>
                            </table>

                            <!-- OTP Box -->
                            <table role="presentation" style="width: 100%; margin: 30px 0;">
                                <tr>
                                    <td style="background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); border: 2px dashed #3b82f6; border-radius: 12px; padding: 30px; text-align: center;">
                                        <p style="margin: 0 0 10px 0; color: #1e40af; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                                            Your Login Code
                                        </p>
                                        <div style="background: #ffffff; border-radius: 8px; padding: 20px; display: inline-block; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                                            <p style="margin: 0; font-size: 42px; font-weight: 700; letter-spacing: 8px; color: #3b82f6; font-family: 'Courier New', monospace;">
                                                ${otp}
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            </table>

                            <!-- Warning Box -->
                            <table role="presentation" style="width: 100%; margin: 20px 0;">
                                <tr>
                                    <td style="background: #fef2f2; border-left: 4px solid #ef4444; border-radius: 8px; padding: 16px;">
                                        <p style="margin: 0 0 10px 0; color: #991b1b; font-size: 14px; font-weight: 600;">
                                            🚨 Wasn't you?
                                        </p>
                                        <p style="margin: 0; color: #7f1d1d; font-size: 14px; line-height: 1.5;">
                                            If you didn't attempt to log in, someone may have your password. <strong>Secure your account immediately</strong> by changing your password.
                                        </p>
                                    </td>
                                </tr>
                            </table>

                            <table role="presentation" style="width: 100%; margin: 20px 0;">
                                <tr>
                                    <td style="background: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 16px;">
                                        <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.5;">
                                            ⏰ This code expires in <strong>10 minutes</strong> for your security.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background: #111827; padding: 30px; text-align: center;">
                            <p style="margin: 0 0 10px 0; color: #9ca3af; font-size: 14px;">
                                Need help? Contact us at <a href="mailto:smartsplit.noreply@gmail.com" style="color: #f97316; text-decoration: none;">smartsplit.noreply@gmail.com</a>
                            </p>
                            <p style="margin: 0; color: #6b7280; font-size: 12px;">
                                © ${new Date().getFullYear()} SmartSplit. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
`;

// Welcome Email Template
exports.WELCOME_EMAIL_TEMPLATE = (userName) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to SmartSplit</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td style="padding: 40px 20px;">
                <table role="presentation" style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);">
                    
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); padding: 50px 30px; text-align: center;">
                            <h1 style="margin: 0 0 10px 0; color: #ffffff; font-size: 36px; font-weight: 700;">
                                🎉 Welcome to SmartSplit!
                            </h1>
                            <p style="margin: 0; color: rgba(255, 255, 255, 0.9); font-size: 18px;">
                                Your journey to smarter expense tracking starts here
                            </p>
                        </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <h2 style="margin: 0 0 20px 0; color: #1f2937; font-size: 24px; font-weight: 600;">
                                Hi ${userName || "there"}! 👋
                            </h2>
                            
                            <p style="margin: 0 0 25px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                                Thank you for joining SmartSplit! We're excited to help you manage and split expenses with ease.
                            </p>

                            <!-- Features -->
                            <table role="presentation" style="width: 100%; margin: 30px 0;">
                                <tr>
                                    <td style="padding: 20px; background: #f0fdf4; border-radius: 12px; border-left: 4px solid #22c55e;">
                                        <h3 style="margin: 0 0 10px 0; color: #15803d; font-size: 16px; font-weight: 600;">
                                            ✨ What you can do:
                                        </h3>
                                        <ul style="margin: 0; padding-left: 20px; color: #166534; font-size: 14px; line-height: 1.8;">
                                            <li>Track personal and group expenses</li>
                                            <li>Split bills with friends and family</li>
                                            <li>Get detailed spending analytics</li>
                                            <li>Set budgets and receive alerts</li>
                                            <li>Settle payments easily</li>
                                        </ul>
                                    </td>
                                </tr>
                            </table>

                            <!-- CTA Button -->
                            <table role="presentation" style="width: 100%; margin: 30px 0;">
                                <tr>
                                    <td style="text-align: center;">
                                        <a href="https://smartsplit.com/dashboard" style="display: inline-block; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 6px rgba(249, 115, 22, 0.3);">
                                            Get Started →
                                        </a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background: #111827; padding: 30px; text-align: center;">
                            <p style="margin: 0 0 10px 0; color: #9ca3af; font-size: 14px;">
                                Questions? We're here to help at <a href="mailto:smartsplit.noreply@gmail.com" style="color: #f97316; text-decoration: none;">support@smartsplit.com</a>
                            </p>
                            <p style="margin: 0; color: #6b7280; font-size: 12px;">
                                © ${new Date().getFullYear()} SmartSplit. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
`;
