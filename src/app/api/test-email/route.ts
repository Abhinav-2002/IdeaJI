import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";

export async function GET(req: Request) {
  try {
    console.log('Test email request received');
    
    // Get email from query params
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');
    
    if (!email) {
      return NextResponse.json(
        { error: "Email parameter is required" },
        { status: 400 }
      );
    }
    
    console.log('Attempting to send test email to:', email);
    
    // Log environment variables (without sensitive info)
    console.log('Email Configuration:', {
      host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
      port: process.env.SMTP_PORT || '587',
      user: process.env.SMTP_USER ? 'Configured' : 'Not Configured',
      password: process.env.SMTP_PASSWORD ? 'Configured' : 'Not Configured',
      appUrl: process.env.NEXT_PUBLIC_APP_URL || 'Not Configured'
    });
    
    // Send test email
    await sendEmail({
      to: email,
      subject: "Ideaji Email Test",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Ideaji Email Test</h2>
          <p>This is a test email to verify that the email service is working correctly.</p>
          <p>If you received this email, your email configuration is working!</p>
          <hr style="border: 1px solid #eee; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">
            This is an automated email, please do not reply.
          </p>
        </div>
      `,
    });
    
    return NextResponse.json(
      { message: "Test email sent successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Test email error:", {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return NextResponse.json(
      { 
        error: "Failed to send test email", 
        details: error instanceof Error ? error.message : 'Unknown error',
        config: {
          host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
          port: process.env.SMTP_PORT || '587',
          userConfigured: !!process.env.SMTP_USER,
          passwordConfigured: !!process.env.SMTP_PASSWORD,
          appUrl: process.env.NEXT_PUBLIC_APP_URL || 'Not Configured'
        }
      },
      { status: 500 }
    );
  }
}
