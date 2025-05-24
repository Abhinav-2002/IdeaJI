import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcrypt";
import { z } from "zod";
import { sendEmail, generateVerificationEmailHtml } from "@/lib/email";

// Define validation schema
const userSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function POST(req: Request) {
  try {
    console.log('Registration request received');
    
    const body = await req.json();
    console.log('Registration attempt for email:', body.email);
    
    // Validate request body
    const result = userSchema.safeParse(body);
    if (!result.success) {
      console.error('Registration validation error:', result.error.format());
      return NextResponse.json(
        { error: "Invalid input", details: result.error.format() },
        { status: 400 }
      );
    }
    
    const { name, email, password } = body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.log('Registration failed: User already exists', { email });
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }

    console.log('Creating new user');
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    console.log('User created successfully:', { userId: user.id, email: user.email });

    // Create verification token
    console.log('Creating verification token');
    const token = await prisma.verificationToken.create({
      data: {
        identifier: email,
        token: Math.random().toString(36).substring(2, 15),
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      },
    });

    console.log('Verification token created:', { 
      token: token.token,
      expires: token.expires 
    });

    // Send verification email
    console.log('Attempting to send verification email');
    try {
      await sendEmail({
        to: email,
        subject: "Verify your email address",
        html: generateVerificationEmailHtml(token.token),
      });
      console.log('Verification email sent successfully');
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Continue with registration even if email fails
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(
      { 
        message: "User registered successfully", 
        user: userWithoutPassword 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json(
      { error: "An error occurred during registration" },
      { status: 500 }
    );
  }
}
