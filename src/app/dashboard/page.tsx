"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Simple dashboard page to fix rendering issues
export default function DashboardPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user is authenticated
    if (status === "unauthenticated") {
      router.push("/auth/login?callbackUrl=/dashboard");
      return;
    }

    if (status === "authenticated") {
      const fetchDashboardData = async () => {
        try {
          setIsLoading(true);
          setError(null);

          const response = await fetch('/api/dashboard');
          
          if (!response.ok) {
            throw new Error('Failed to fetch dashboard data');
          }

          const data = await response.json();
          setDashboardData(data);
        } catch (error) {
          console.error('Error fetching dashboard data:', error);
          setError('Failed to load dashboard data');
        } finally {
          setIsLoading(false);
        }
      };

      fetchDashboardData();
    }
  }, [status, router]);

  // Show loading state
  if (status === "loading" || isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 py-12">
          <div className="container">
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
        <main className="flex-1 py-12">
          <div className="container">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
              <p className="mb-4">You need to be logged in to view your dashboard.</p>
              <p>Redirecting to login page...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 py-12">
          <div className="container">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Error Loading Dashboard</h2>
              <p className="mb-4 text-red-500">{error}</p>
              <Button onClick={() => window.location.reload()}>Try Again</Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Render basic dashboard with data
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 py-12">
        <div className="container">
          <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
          
          {dashboardData && (
            <>
              {/* User Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Forge Points</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{dashboardData.user.points}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Ideas Submitted</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{dashboardData.stats.totalIdeas}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Reviews Given</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{dashboardData.stats.totalFeedback}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Welcome</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl font-medium">{dashboardData.user.name}</div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Ideas Section */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Your Ideas</h2>
                  <Button asChild>
                    <Link href="/ideas/submit">Submit New Idea</Link>
                  </Button>
                </div>
                
                {dashboardData.ideas.length === 0 ? (
                  <Card>
                    <CardContent className="p-6">
                      <div className="text-center py-8">
                        <h3 className="text-lg font-semibold mb-2">No Ideas Yet</h3>
                        <p className="text-muted-foreground mb-4">
                          You haven't submitted any ideas yet. Share your first idea with the community!
                        </p>
                        <Button asChild>
                          <Link href="/ideas/submit">Submit Your First Idea</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-6">
                    {dashboardData.ideas.map((idea) => (
                      <Card key={idea.id}>
                        <CardContent className="p-6">
                          <h3 className="text-xl font-bold mb-2">{idea.title}</h3>
                          <p className="text-muted-foreground mb-4">{idea.description}</p>
                          <div className="flex justify-between items-center">
                            <div className="text-sm text-muted-foreground">
                              {new Date(idea.createdAt).toLocaleDateString()}
                            </div>
                            <div className="flex items-center">
                              <span className="text-sm font-medium mr-2">
                                {idea._count.feedbacks} reviews
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
