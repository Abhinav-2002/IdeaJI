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

    if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
      console.error('SMTP credentials not configured');
      return NextResponse.json(
        { 
          error: "SMTP credentials not configured",
          details: "Please check your .env.local file and make sure SMTP_USER and SMTP_PASSWORD are set"
        },
        { status: 500 }
      );
    }
    
    // Send test email
    const result = await sendEmail({
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
    
    console.log('Email send result:', result);
    
    return NextResponse.json(
      { 
        message: "Test email sent successfully",
        details: result
      },
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

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Send test email
    await sendEmail({
      to: email,
      subject: "Test Email from Ideaji",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h1>Test Email</h1>
          <p>This is a test email to verify your email configuration.</p>
          <p>If you received this email, your email configuration is working correctly!</p>
        </div>
      `,
    });

    return NextResponse.json(
      { message: "Test email sent successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Test email error:", error);
    return NextResponse.json(
      { 
        error: "Failed to send test email",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
