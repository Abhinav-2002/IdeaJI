"use client";

import React, { useState } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';

interface IdeaTag {
  name: string;
  color?: string;
}

interface SwipeableIdeaCardProps {
  id: string;
  title: string;
  description: string;
  createdAt: Date;
  author: string;
  tags: IdeaTag[];
  aiSummary?: string;
  onSwipe: (direction: 'left' | 'right', id: string) => void;
  onRate: (id: string, rating: number) => void;
  onAddFeedback: (id: string) => void;
}

export function SwipeableIdeaCard({
  id,
  title,
  description,
  createdAt,
  author,
  tags,
  aiSummary,
  onSwipe,
  onRate,
  onAddFeedback,
}: SwipeableIdeaCardProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [feedbackTags, setFeedbackTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Motion values for swipe
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0.5, 1, 1, 1, 0.5]);
  
  // Background color based on swipe direction
  const background = useTransform(
    x,
    [-200, -100, 0, 100, 200],
    [
      'rgba(239, 68, 68, 0.2)', // Red for left swipe (reject)
      'rgba(239, 68, 68, 0.1)',
      'rgba(255, 255, 255, 0)',
      'rgba(34, 197, 94, 0.1)',
      'rgba(34, 197, 94, 0.2)', // Green for right swipe (approve)
    ]
  );

  // Available feedback tags
  const availableTags = [
    { name: 'Innovative', color: 'bg-blue-100 text-blue-800' },
    { name: 'Practical', color: 'bg-green-100 text-green-800' },
    { name: 'Market-Ready', color: 'bg-purple-100 text-purple-800' },
    { name: 'Needs Work', color: 'bg-yellow-100 text-yellow-800' },
    { name: 'Unclear', color: 'bg-orange-100 text-orange-800' },
    { name: 'Innovative', color: 'bg-indigo-100 text-indigo-800' },
  ];

  // Handle swipe end
  const handleDragEnd = async (_: any, info: PanInfo) => {
    try {
      if (info.offset.x > 100) {
        setIsSubmitting(true);
        // Submit 'like' feedback to API
        await fetch('/api/ideas/feedback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ideaId: id,
            action: 'like',
            tags: feedbackTags,
          }),
        });
        onSwipe('right', id); // Like
      } else if (info.offset.x < -100) {
        setIsSubmitting(true);
        // Submit 'pass' feedback to API
        await fetch('/api/ideas/feedback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ideaId: id,
            action: 'pass',
          }),
        });
        onSwipe('left', id); // Dislike
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle feedback tag
  const toggleTag = (tag: string) => {
    if (feedbackTags.includes(tag)) {
      setFeedbackTags(feedbackTags.filter(t => t !== tag));
    } else {
      setFeedbackTags([...feedbackTags, tag]);
    }
  };

  // Handle rating change
  const handleRating = (newRating: number) => {
    setRating(newRating);
    onRate(id, newRating);
  };

  // Submit detailed feedback
  const submitDetailedFeedback = async (comment: string) => {
    try {
      setIsSubmitting(true);
      // Submit detailed feedback to API
      await fetch('/api/ideas/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ideaId: id,
          rating,
          comment,
          tags: feedbackTags,
          action: 'detailed',
        }),
      });
    } catch (error) {
      console.error('Error submitting detailed feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      style={{ 
        x,
        rotate,
        opacity,
        background,
      }}
      drag={isSubmitting ? false : "x"}
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      whileTap={{ scale: 1.05 }}
      className={`w-full max-w-md mx-auto ${isSubmitting ? 'cursor-wait' : 'cursor-grab active:cursor-grabbing'}`}
    >
      <Card className="idea-card h-full flex flex-col shadow-lg border-2 relative overflow-hidden">
        {/* Swipe indicators */}
        <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold transform -rotate-12 opacity-0 transition-opacity duration-200" 
          style={{ opacity: x.get() < -50 ? Math.abs(x.get()) / 200 : 0 }}>
          PASS
        </div>
        <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold transform rotate-12 opacity-0 transition-opacity duration-200"
          style={{ opacity: x.get() > 50 ? x.get() / 200 : 0 }}>
          LIKE
        </div>
        
        <CardHeader className="pb-3 bg-gradient-to-r from-primary/10 to-secondary/10">
          <div className="flex justify-between items-start">
            <CardTitle className="text-xl font-bold">{title}</CardTitle>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <span>By {author}</span>
            <span className="mx-2">•</span>
            <span>{formatDate(createdAt)}</span>
          </div>
        </CardHeader>
        
        <CardContent className="flex-grow">
          <p className="text-sm text-muted-foreground mb-4">{description}</p>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {tags.map((tag) => (
              <span
                key={tag.name}
                className={`px-2 py-1 rounded-full text-xs bg-primary/10 text-primary`}
              >
                {tag.name}
              </span>
            ))}
          </div>
          
          {aiSummary && (
            <div className="p-3 bg-secondary/20 rounded-lg mb-4">
              <p className="text-xs font-medium mb-1">AI Feedback Summary:</p>
              <p className="text-xs text-muted-foreground">{aiSummary}</p>
            </div>
          )}
          
          {/* Rating section */}
          <div className="mb-4">
            <p className="text-sm font-medium mb-2">Rate this idea:</p>
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="focus:outline-none"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill={(hoveredRating || rating) >= star ? "currentColor" : "none"}
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={(hoveredRating || rating) >= star ? "text-yellow-500" : "text-gray-300"}
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                </button>
              ))}
            </div>
          </div>
          
          {/* Feedback tags */}
          <div>
            <p className="text-sm font-medium mb-2">Add feedback tags:</p>
            <div className="flex flex-wrap gap-2">
              {availableTags.map((tag) => (
                <button
                  key={tag.name}
                  onClick={() => toggleTag(tag.name)}
                  className={`px-2 py-1 rounded-full text-xs transition-colors ${
                    feedbackTags.includes(tag.name)
                      ? tag.color
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {tag.name}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="pt-2 flex justify-between">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 mr-2"
            onClick={() => onSwipe('left', id)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1 text-red-500">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
            Pass
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 ml-2"
            onClick={() => onSwipe('right', id)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1 text-green-500">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            Like
          </Button>
        </CardFooter>
        
        <div className="p-4 border-t">
          <Button 
            variant="default" 
            size="sm" 
            className="w-full bg-gradient-to-r from-primary to-secondary"
            onClick={() => onAddFeedback(id)}
          >
            Submit Feedback
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}
