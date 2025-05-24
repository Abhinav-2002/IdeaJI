import Link from 'next/link';
import Image from 'next/image';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 md:py-32 hero-gradient text-white">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-accent/90 z-0"></div>
          <div className="container relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6 animate-fade-in">
                <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
                  Validate Your Ideas with Community Feedback
                </h1>
                <p className="text-xl md:text-2xl text-white/80">
                  Submit your startup or app ideas, get meaningful feedback, and earn rewards for your participation.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button size="lg" className="bg-white text-primary hover:bg-white/90" asChild>
                    <Link href="/auth/register">Get Started</Link>
                  </Button>
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10" asChild>
                    <Link href="/how-it-works">How It Works</Link>
                  </Button>
                </div>
              </div>
              <div className="relative h-[400px] animate-slide-in">
                <div className="absolute top-0 right-0 w-full h-full bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden border border-white/20">
                  <div className="p-6 h-full flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-white/20"></div>
                        <div>
                          <p className="font-medium">Anonymous</p>
                          <p className="text-sm text-white/70">2 hours ago</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg key={star} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="white" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-star">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                          </svg>
                        ))}
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">AI-Powered Recipe Recommender</h3>
                    <p className="text-white/80 mb-4">
                      An app that uses AI to recommend recipes based on ingredients you already have at home, dietary restrictions, and personal preferences.
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="px-2 py-1 bg-white/20 rounded-full text-xs">Innovative</span>
                      <span className="px-2 py-1 bg-white/20 rounded-full text-xs">Practical</span>
                      <span className="px-2 py-1 bg-white/20 rounded-full text-xs">Market-Ready</span>
                    </div>
                    <div className="mt-auto">
                      <div className="p-4 bg-white/10 rounded-lg">
                        <p className="text-sm font-medium mb-1">AI Feedback Summary:</p>
                        <p className="text-sm text-white/80">
                          Strong concept with clear value proposition. Consider adding meal planning features and grocery list integration to enhance user experience.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-secondary/30">
          <div className="container">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">How Ideaji Works</h2>
              <p className="text-xl text-muted-foreground">
                Our platform combines community feedback with AI-powered insights to help validate and improve your ideas.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="bg-card rounded-xl p-6 shadow-sm card-hover">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                    <polyline points="14 2 14 8 20 8" />
                    <path d="M12 18v-6" />
                    <path d="M8 18v-1" />
                    <path d="M16 18v-3" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Submit Your Ideas</h3>
                <p className="text-muted-foreground">
                  Share your startup or app ideas using text, voice, or video formats. All ideas are displayed anonymously for unbiased feedback.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-card rounded-xl p-6 shadow-sm card-hover">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                    <path d="m15 5 4 4" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Get Community Feedback</h3>
                <p className="text-muted-foreground">
                  Receive ratings, comments, and tags from the community. Every review earns points that contribute to your reputation.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-card rounded-xl p-6 shadow-sm card-hover">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                    <path d="M12 2v4" />
                    <path d="m6.24 4.7 2.83 2.83" />
                    <path d="M4 12H2" />
                    <path d="m6.24 19.3 2.83-2.83" />
                    <path d="M12 22v-2" />
                    <path d="m17.76 19.3-2.83-2.83" />
                    <path d="M22 12h-2" />
                    <path d="m17.76 4.7-2.83 2.83" />
                    <path d="M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">AI-Powered Insights</h3>
                <p className="text-muted-foreground">
                  Our AI summarizes all feedback, highlighting strengths, weaknesses, and actionable suggestions to improve your idea.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Points & Rewards Section */}
        <section className="py-20">
          <div className="container">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1">
                <div className="bg-gradient-to-br from-primary/10 to-accent/10 p-8 rounded-2xl relative">
                  <div className="absolute -top-4 -right-4 bg-accent text-white rounded-full px-4 py-2 text-sm font-medium">
                    Rewards System
                  </div>
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                          <path d="M12 8a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2v-4h2a2 2 0 0 0 0-4h-2Z" />
                          <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-lg font-medium mb-1">Forge Points</h4>
                        <p className="text-muted-foreground">Earn points for submitting ideas, providing feedback, and engaging with the community.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                          <path d="M21 8v13H3V8" />
                          <path d="M1 3h22v5H1z" />
                          <path d="M10 12h4" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-lg font-medium mb-1">AI-Generated Pitch Decks</h4>
                        <p className="text-muted-foreground">Redeem points for professionally designed pitch decks generated by AI.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                          <circle cx="9" cy="7" r="4" />
                          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-lg font-medium mb-1">Mentorship Calls</h4>
                        <p className="text-muted-foreground">Get 1-on-1 calls with experienced founders to discuss your ideas and get expert advice.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                          <path d="M20 7h-9" />
                          <path d="M14 17H5" />
                          <circle cx="17" cy="17" r="3" />
                          <circle cx="7" cy="7" r="3" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-lg font-medium mb-1">Discounts & Tools</h4>
                        <p className="text-muted-foreground">Access discounts on domain names, no-code tools, and priority access to launch-related services.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-6 order-1 md:order-2">
                <h2 className="text-3xl md:text-4xl font-bold">Earn Points & Unlock Valuable Rewards</h2>
                <p className="text-xl text-muted-foreground">
                  Our gamified system rewards active participation and helps you turn your ideas into reality with valuable perks.
                </p>
                <Button size="lg" className="bg-gradient-to-r from-primary to-accent hover:opacity-90" asChild>
                  <Link href="/rewards">View All Rewards</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-primary text-primary-foreground">
          <div className="container text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Validate Your Ideas?</h2>
            <p className="text-xl text-primary-foreground/80 max-w-2xl mx-auto mb-8">
              Join our community today and start getting valuable feedback on your startup or app ideas.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90" asChild>
                <Link href="/auth/register">Create Account</Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10" asChild>
                <Link href="/ideas">Browse Ideas</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
