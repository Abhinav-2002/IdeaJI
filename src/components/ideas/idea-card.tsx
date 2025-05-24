import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';

interface IdeaTag {
  name: string;
  color?: string;
}

interface IdeaCardProps {
  id: string;
  title: string;
  description: string;
  createdAt: Date;
  author: string;
  rating: number;
  reviewCount: number;
  tags: IdeaTag[];
  aiSummary?: string;
}

export function IdeaCard({
  id,
  title,
  description,
  createdAt,
  author,
  rating,
  reviewCount,
  tags,
  aiSummary,
}: IdeaCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="idea-card h-full flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <CardTitle className="text-xl">{title}</CardTitle>
            <div className="flex items-center">
              {Array.from({ length: 5 }).map((_, i) => (
                <svg
                  key={i}
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill={i < rating ? "currentColor" : "none"}
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={i < rating ? "text-primary" : "text-muted"}
                >
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              ))}
              <span className="text-xs text-muted-foreground ml-2">({reviewCount})</span>
            </div>
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
            <div className="p-3 bg-secondary/50 rounded-lg">
              <p className="text-xs font-medium mb-1">AI Feedback Summary:</p>
              <p className="text-xs text-muted-foreground">{aiSummary}</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="pt-2">
          <Button variant="outline" size="sm" className="w-full" asChild>
            <Link href={`/ideas/${id}`}>View Details</Link>
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
