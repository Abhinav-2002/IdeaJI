"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { IdeaForm } from '@/components/ideas/idea-form';

export default function SubmitIdeaPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  // Force check authentication status on component mount
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login?callbackUrl=/ideas/submit");
    }
  }, [status, router]);

  // Check if user is authenticated
  if (status === "loading") {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 py-12 flex items-center justify-center">
          <div className="container max-w-3xl">
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (status === "unauthenticated") {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 py-12 flex items-center justify-center">
          <div className="container max-w-3xl">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
              <p className="mb-4">You need to be logged in to submit an idea.</p>
              <p>Redirecting to login page...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 py-12 flex items-center justify-center">
        <div className="container max-w-3xl">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 border border-gray-200 dark:border-gray-700">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2 text-center">Submit Your Idea</h1>
              <div className="w-20 h-1 bg-primary mx-auto mb-6"></div>
              <p className="text-muted-foreground text-center">
                Share your startup or app idea with our community and get valuable feedback
              </p>
              <p className="text-sm text-muted-foreground mt-2 text-center">
                By submitting an idea, you agree to our{' '}
                <Link href="/terms" className="text-primary hover:underline">
                  terms of service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-primary hover:underline">
                  privacy policy
                </Link>
              </p>
            </div>
            
            <IdeaForm />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
