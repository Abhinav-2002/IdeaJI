import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcrypt";
import { prisma } from "./prisma";
import { sendEmail, generateVerificationEmailHtml } from "./email";

// This is a workaround for the issue with NextAuth and Next.js 15
function PrismaAdapterWrapper(client: any) {
  return PrismaAdapter(client);
}

// Extend the session type to include custom fields
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string;
      emailVerified?: Date | null;
    };
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapterWrapper(prisma),
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
  pages: {
    signIn: "/auth/login",
    signOut: "/auth/logout",
    error: "/auth/error",
    verifyRequest: "/auth/verify-request",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        });

        if (!user || !user.password) {
          return null;
        }

        const passwordMatch = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!passwordMatch) {
          return null;
        }

        // Check if email is verified
        if (!user.emailVerified) {
          throw new Error("EmailNotVerified");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
          emailVerified: user.emailVerified,
        };
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.image = token.picture;
        session.user.role = token.role as string;
        session.user.emailVerified = token.emailVerified as Date;
      }
      return session;
    },
    async jwt({ token, user }) {
      const dbUser = await prisma.user.findFirst({
        where: {
          email: token.email ? token.email : undefined,
        },
      });

      if (!dbUser) {
        if (user) {
          token.id = user.id;
        }
        return token;
      }

      return {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        picture: dbUser.image,
        role: dbUser.role,
        emailVerified: dbUser.emailVerified,
      };
    },
  },
  events: {
    async createUser({ user }) {
      // Send verification email when a new user is created
      if (user.email) {
        try {
          const token = await prisma.verificationToken.create({
            data: {
              identifier: user.email,
              token: Math.random().toString(36).substring(2, 15),
              expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
            },
          });

          // Send verification email
          await sendEmail({
            to: user.email,
            subject: "Verify your email address",
            html: generateVerificationEmailHtml(token.token),
          });
        } catch (error) {
          console.error("Error sending verification email:", error);
        }
      }
    },
  },
};
