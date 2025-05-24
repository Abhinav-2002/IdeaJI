import React from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate } from '@/lib/utils';

// Mock data for a single idea
const mockIdea = {
  id: '1',
  title: 'AI-Powered Recipe Recommender',
  description: 'An app that uses AI to recommend recipes based on ingredients you already have at home, dietary restrictions, and personal preferences. The app would scan your pantry and refrigerator contents (either manually entered or through image recognition), consider any dietary restrictions or preferences you have, and suggest recipes that maximize the use of available ingredients while minimizing the need to purchase additional items.',
  createdAt: new Date('2025-05-20'),
  author: 'Anonymous',
  rating: 4.5,
  reviewCount: 28,
  category: 'Technology',
  tags: [{ name: 'Innovative' }, { name: 'Practical' }, { name: 'Market-Ready' }, { name: 'AI' }, { name: 'Mobile' }],
  targetAudience: 'Home cooks, busy parents, students, health-conscious individuals',
  marketType: 'B2C',
  aiSummary: {
    strengths: [
      'Strong value proposition addressing a common pain point',
      'Leverages AI technology in a practical, everyday application',
      'Potential for monetization through premium features or partnerships',
      'Addresses food waste by optimizing ingredient usage'
    ],
    weaknesses: [
      'Potential technical challenges with ingredient recognition accuracy',
      'Requires a large recipe database to be truly useful',
      'Similar apps exist, though with varying features and quality'
    ],
    suggestions: [
      'Consider adding meal planning features for weekly shopping',
      'Integrate with grocery delivery services for missing ingredients',
      'Add social features to share successful recipes with friends',
      'Include nutritional information and dietary tracking'
    ]
  }
};

// Mock reviews
const mockReviews = [
  {
    id: '1',
    author: 'User123',
    rating: 5,
    comment: 'This is a brilliant idea! I constantly struggle with figuring out what to cook with the random ingredients I have. The AI component makes it much more valuable than just a recipe search engine.',
    date: new Date('2025-05-21'),
    tags: ['Innovative', 'Useful']
  },
  {
    id: '2',
    author: 'FoodieExpert',
    rating: 4,
    comment: 'Great concept with real practical application. I would suggest adding integration with grocery delivery services so users can order missing ingredients directly from the app.',
    date: new Date('2025-05-20'),
    tags: ['Practical', 'Needs Improvement']
  },
  {
    id: '3',
    author: 'TechInvestor',
    rating: 5,
    comment: 'This has real market potential. The combination of AI and practical everyday use is exactly what consumers are looking for. I would consider adding a premium tier with advanced features.',
    date: new Date('2025-05-19'),
    tags: ['Market-Ready', 'Monetizable']
  },
  {
    id: '4',
    author: 'HealthCoach',
    rating: 4,
    comment: 'I love the concept, especially if it can account for nutritional needs and dietary restrictions. This could be a game-changer for people with specific health requirements.',
    date: new Date('2025-05-18'),
    tags: ['Health-Focused', 'Inclusive']
  },
  {
    id: '5',
    author: 'AppDeveloper',
    rating: 3,
    comment: 'The idea is solid but implementation will be challenging. Image recognition for food items is still not perfect, and building a comprehensive recipe database will take significant resources.',
    date: new Date('2025-05-17'),
    tags: ['Technical Challenges', 'Resource-Intensive']
  }
];

export default function IdeaDetailPage({ params }: { params: { id: string } }) {
  // In a real application, we would fetch the idea data based on the ID
  // const { id } = params;
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 py-12">
        <div className="container">
          {/* Breadcrumb */}
          <div className="flex items-center text-sm text-muted-foreground mb-6">
            <Link href="/ideas" className="hover:text-foreground">
              Ideas
            </Link>
            <span className="mx-2">/</span>
            <span className="text-foreground">{mockIdea.title}</span>
          </div>
          
          {/* Idea Header */}
          <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">{mockIdea.title}</h1>
              <div className="flex items-center text-sm text-muted-foreground">
                <span>By {mockIdea.author}</span>
                <span className="mx-2">•</span>
                <span>{formatDate(mockIdea.createdAt)}</span>
                <span className="mx-2">•</span>
                <span>{mockIdea.category}</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg
                    key={i}
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill={i < Math.floor(mockIdea.rating) ? "currentColor" : "none"}
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={i < Math.floor(mockIdea.rating) ? "text-primary" : "text-muted"}
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                ))}
                <span className="ml-2 font-medium">{mockIdea.rating.toFixed(1)}</span>
                <span className="text-sm text-muted-foreground ml-1">({mockIdea.reviewCount})</span>
              </div>
              <Button variant="outline" size="sm">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                  <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                  <path d="m15 5 4 4" />
                </svg>
                Add Review
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Idea Description */}
              <Card>
                <CardHeader>
                  <CardTitle>Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground whitespace-pre-line">{mockIdea.description}</p>
                  
                  <div className="flex flex-wrap gap-2 mt-6">
                    {mockIdea.tags.map((tag) => (
                      <span
                        key={tag.name}
                        className="px-2 py-1 rounded-full text-xs bg-primary/10 text-primary"
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              {/* AI Feedback Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary mr-2">
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
                    AI Feedback Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-medium text-primary mb-2">Strengths</h3>
                      <ul className="space-y-1">
                        {mockIdea.aiSummary.strengths.map((strength, index) => (
                          <li key={index} className="flex items-start">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500 mr-2 flex-shrink-0 mt-1">
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                            <span className="text-sm">{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-primary mb-2">Areas for Improvement</h3>
                      <ul className="space-y-1">
                        {mockIdea.aiSummary.weaknesses.map((weakness, index) => (
                          <li key={index} className="flex items-start">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500 mr-2 flex-shrink-0 mt-1">
                              <circle cx="12" cy="12" r="10"></circle>
                              <line x1="12" y1="8" x2="12" y2="12"></line>
                              <line x1="12" y1="16" x2="12.01" y2="16"></line>
                            </svg>
                            <span className="text-sm">{weakness}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-primary mb-2">Suggestions</h3>
                      <ul className="space-y-1">
                        {mockIdea.aiSummary.suggestions.map((suggestion, index) => (
                          <li key={index} className="flex items-start">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500 mr-2 flex-shrink-0 mt-1">
                              <circle cx="12" cy="12" r="10"></circle>
                              <line x1="12" y1="16" x2="12" y2="12"></line>
                              <line x1="12" y1="8" x2="12.01" y2="8"></line>
                            </svg>
                            <span className="text-sm">{suggestion}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Community Reviews */}
              <div>
                <h2 className="text-2xl font-bold mb-4">Community Reviews</h2>
                <div className="space-y-4">
                  {mockReviews.map((review) => (
                    <Card key={review.id}>
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                              <span className="text-primary font-medium text-sm">{review.author.charAt(0)}</span>
                            </div>
                            <div>
                              <p className="font-medium">{review.author}</p>
                              <p className="text-xs text-muted-foreground">{formatDate(review.date)}</p>
                            </div>
                          </div>
                          <div className="flex items-center">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <svg
                                key={i}
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill={i < review.rating ? "currentColor" : "none"}
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className={i < review.rating ? "text-primary" : "text-muted"}
                              >
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                              </svg>
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{review.comment}</p>
                        <div className="flex flex-wrap gap-2">
                          {review.tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-0.5 rounded-full text-xs bg-secondary text-secondary-foreground"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <div className="flex justify-center mt-6">
                  <Button variant="outline">Load More Reviews</Button>
                </div>
              </div>
            </div>
            
            {/* Sidebar */}
            <div className="space-y-6">
              {/* Idea Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Idea Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Category</h3>
                    <p>{mockIdea.category}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Target Audience</h3>
                    <p className="text-sm">{mockIdea.targetAudience}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Market Type</h3>
                    <p>{mockIdea.marketType}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Submitted On</h3>
                    <p>{formatDate(mockIdea.createdAt)}</p>
                  </div>
                </CardContent>
              </Card>
              
              {/* Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button className="w-full" variant="outline">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                      <path d="m15 5 4 4" />
                    </svg>
                    Write a Review
                  </Button>
                  <Button className="w-full" variant="outline">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    Save Idea
                  </Button>
                  <Button className="w-full" variant="outline">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                      <polyline points="16 6 12 2 8 6" />
                      <line x1="12" y1="2" x2="12" y2="15" />
                    </svg>
                    Share Idea
                  </Button>
                  <Button className="w-full" variant="outline">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                      <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
                      <path d="M12 12v9" />
                      <path d="m8 17 4 4 4-4" />
                    </svg>
                    Download Summary
                  </Button>
                </CardContent>
              </Card>
              
              {/* Similar Ideas */}
              <Card>
                <CardHeader>
                  <CardTitle>Similar Ideas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Link href="#" className="block hover:underline font-medium">
                      Smart Kitchen Inventory Manager
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      An IoT solution that tracks kitchen inventory and suggests recipes based on available ingredients.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Link href="#" className="block hover:underline font-medium">
                      Meal Planning Assistant
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      An app that creates personalized meal plans based on dietary preferences and nutritional goals.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Link href="#" className="block hover:underline font-medium">
                      Food Waste Reduction App
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      An application that helps users track food expiration dates and suggests recipes to use ingredients before they spoil.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
