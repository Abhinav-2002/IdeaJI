import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Check environment variables
    const envConfig = {
      SMTP_USER: process.env.SMTP_USER || 'Not set',
      SMTP_PASSWORD: process.env.SMTP_PASSWORD ? 'Set (length: ' + process.env.SMTP_PASSWORD.length + ')' : 'Not set',
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'Not set',
    };

    return NextResponse.json({
      status: 'ok',
      environment: envConfig,
    });
  } catch (error) {
    console.error('Environment test error:', error);
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
} 