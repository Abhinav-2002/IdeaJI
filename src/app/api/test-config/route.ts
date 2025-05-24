import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Check environment variables
    const envConfig = {
      SMTP_HOST: process.env.SMTP_HOST || 'Not set',
      SMTP_PORT: process.env.SMTP_PORT || 'Not set',
      SMTP_USER: process.env.SMTP_USER ? 'Set' : 'Not set',
      SMTP_PASSWORD: process.env.SMTP_PASSWORD ? 'Set' : 'Not set',
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'Not set',
    };

    // Test database connection
    const dbTest = await prisma.$queryRaw`SELECT 1 as test`;
    
    // Check verification tokens table
    const verificationTokens = await prisma.verificationToken.findMany({
      take: 5,
      orderBy: { expires: 'desc' },
    });

    return NextResponse.json({
      status: 'ok',
      environment: envConfig,
      database: {
        connection: 'ok',
        verificationTokens: verificationTokens.length,
        recentTokens: verificationTokens,
      },
    });
  } catch (error) {
    console.error('Configuration test error:', error);
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
} 