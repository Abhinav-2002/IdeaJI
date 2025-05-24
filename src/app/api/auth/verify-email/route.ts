import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const verifySchema = z.object({
  token: z.string(),
});

export async function POST(req: Request) {
  try {
    console.log('Verification request received');
    
    const body = await req.json();
    console.log('Request body:', { ...body, token: body.token ? 'Present' : 'Missing' });
    
    // Validate request body
    const result = verifySchema.safeParse(body);
    if (!result.success) {
      console.error('Validation error:', result.error.format());
      return NextResponse.json(
        { error: "Invalid input", details: result.error.format() },
        { status: 400 }
      );
    }
    
    const { token } = body;
    console.log('Looking up verification token');

    // Find the verification token
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!verificationToken) {
      console.error('Token not found:', token);
      return NextResponse.json(
        { error: "Invalid verification token" },
        { status: 400 }
      );
    }

    console.log('Token found:', {
      identifier: verificationToken.identifier,
      expires: verificationToken.expires
    });

    // Check if token is expired
    if (verificationToken.expires < new Date()) {
      console.error('Token expired:', {
        token,
        expires: verificationToken.expires,
        now: new Date()
      });
      return NextResponse.json(
        { error: "Verification token has expired" },
        { status: 400 }
      );
    }

    console.log('Updating user verification status');

    // Update user's email verification status
    const updatedUser = await prisma.user.update({
      where: { email: verificationToken.identifier },
      data: { emailVerified: new Date() },
    });

    console.log('User updated:', {
      email: updatedUser.email,
      verified: updatedUser.emailVerified
    });

    // Delete the used verification token
    await prisma.verificationToken.delete({
      where: { token },
    });

    console.log('Verification token deleted');

    return NextResponse.json(
      { message: "Email verified successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Email verification error:", {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json(
      { error: "An error occurred during email verification", details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 