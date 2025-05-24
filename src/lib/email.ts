import * as SibApiV3Sdk from '@getbrevo/brevo';

// Initialize Brevo API client
const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
apiInstance.setApiKey(SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY || '');

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

interface EmailResponse {
  success: boolean;
  messageId?: string;
}

export async function sendEmail({ to, subject, html }: SendEmailOptions): Promise<EmailResponse> {
  try {
    // Log configuration status
    console.log('Email Configuration Status:', {
      apiKey: process.env.BREVO_API_KEY ? 'Set (length: ' + process.env.BREVO_API_KEY.length + ')' : 'Not set',
      appUrl: process.env.NEXT_PUBLIC_APP_URL || 'Not set'
    });

    if (!process.env.BREVO_API_KEY) {
      console.error('Brevo Configuration Error: Missing API key');
      throw new Error('Brevo API key not configured. Please check your .env file.');
    }

    console.log('Attempting to send email to:', to);
    
    // Create email object
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail.to = [{ email: to }];
    sendSmtpEmail.subject = subject;
    sendSmtpEmail.htmlContent = html;
    sendSmtpEmail.sender = {
      name: 'Ideaji',
      email: process.env.SMTP_USER || 'noreply@ideaji.com'
    };

    console.log('Sending email with message:', {
      to: sendSmtpEmail.to,
      subject: sendSmtpEmail.subject,
      sender: sendSmtpEmail.sender
    });
    
    const response = await apiInstance.sendTransacEmail(sendSmtpEmail);

    // Log the response data structure
    console.log('Email API Response:', response);
    
    return { 
      success: true,
      messageId: response.body?.messageId
    };
  } catch (error) {
    console.error('Detailed Email Error:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    throw new Error(`Failed to send email: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export function generateVerificationEmailHtml(token: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const verificationUrl = `${baseUrl}/auth/verify-email?token=${token}`;
  
  console.log('Generated verification URL:', verificationUrl);
  
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify your email address</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #ffffff; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #4F46E5; margin: 0; font-size: 24px;">Welcome to Ideaji!</h1>
          </div>
          
          <p style="margin-bottom: 20px;">Thank you for signing up. To complete your registration and access all features, please verify your email address by clicking the button below:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background-color: #4F46E5; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
              Verify Email Address
            </a>
          </div>
          
          <p style="margin-bottom: 10px;">Or copy and paste this link in your browser:</p>
          <p style="color: #666; word-break: break-all; background-color: #f5f5f5; padding: 12px; border-radius: 4px; font-size: 14px;">
            ${verificationUrl}
          </p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 14px; margin-bottom: 10px;">
              <strong>Important:</strong> This verification link will expire in 24 hours.
            </p>
            <p style="color: #666; font-size: 14px;">
              If you didn't create an account, you can safely ignore this email.
            </p>
          </div>
          
          <div style="margin-top: 30px; text-align: center; color: #666; font-size: 12px;">
            <p>This is an automated email, please do not reply.</p>
            <p>© ${new Date().getFullYear()} Ideaji. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
} 