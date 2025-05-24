"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

// Define form validation schema
const ideaSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  problem: z.string().min(10, "Problem statement must be at least 10 characters"),
  solution: z.string().min(10, "Solution must be at least 10 characters"),
  targetAudience: z.string().optional(),
  marketSize: z.string().optional(),
  competition: z.string().optional(),
  businessModel: z.string().optional(),
  tags: z.string().optional(),
  mediaUrls: z.string().optional(),
});

type IdeaFormValues = z.infer<typeof ideaSchema>;

interface IdeaFormProps {
  onSuccess?: () => void;
  initialData?: Partial<IdeaFormValues>;
  isEdit?: boolean;
  ideaId?: string;
}

export function IdeaForm({ 
  onSuccess, 
  initialData = {}, 
  isEdit = false,
  ideaId
}: IdeaFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<IdeaFormValues>({
    resolver: zodResolver(ideaSchema),
    defaultValues: {
      title: initialData.title || "",
      description: initialData.description || "",
      problem: initialData.problem || "",
      solution: initialData.solution || "",
      targetAudience: initialData.targetAudience || "",
      marketSize: initialData.marketSize || "",
      competition: initialData.competition || "",
      businessModel: initialData.businessModel || "",
      tags: initialData.tags || "",
      mediaUrls: initialData.mediaUrls || "",
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    try {
      setIsLoading(true);
      setError(null);

      // Process tags from comma-separated string to array
      const processedTags = data.tags 
        ? data.tags.split(',').map(tag => tag.trim()).filter(Boolean) 
        : [];

      // Prepare the data for submission
      const ideaData = {
        ...data,
        tags: processedTags,
      };

      // Determine if we're creating a new idea or updating an existing one
      const url = isEdit && ideaId 
        ? `/api/ideas/${ideaId}` 
        : '/api/ideas';
      
      const method = isEdit ? 'PATCH' : 'POST';

      // Submit the idea
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ideaData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to submit idea");
      }

      // Success!
      setIsSubmitted(true);
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      } else {
        // Otherwise, redirect to the idea page
        const newIdeaId = isEdit ? ideaId : result.idea.id;
        router.push(`/ideas/${newIdeaId}`);
        router.refresh();
      }
    } catch (error: any) {
      console.error("Error submitting idea:", error);
      setError(error.message || "An error occurred while submitting your idea");
    } finally {
      setIsLoading(false);
    }
  });

  if (isSubmitted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Success!</CardTitle>
          <CardDescription>
            Your idea has been {isEdit ? 'updated' : 'submitted'} successfully.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            {isEdit 
              ? "Your idea has been updated and is now available for the community to review."
              : "Your idea has been submitted and is now available for the community to review. You've earned 50 Forge Points for your contribution!"}
          </p>
          <div className="flex gap-4">
            <Button 
              onClick={() => router.push('/dashboard')}
              variant="outline"
            >
              Go to Dashboard
            </Button>
            <Button 
              onClick={() => router.push('/ideas')}
            >
              Explore Ideas
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEdit ? 'Edit Your Idea' : 'Submit Your Idea'}</CardTitle>
        <CardDescription>
          {isEdit 
            ? "Update your idea details to improve it based on feedback"
            : "Share your innovative idea with our community for feedback and validation"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form id="ideaForm" onSubmit={onSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium mb-1">
                Title *
              </label>
              <input
                id="title"
                {...register("title")}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="A concise title for your idea"
              />
              {errors.title && (
                <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium mb-1">
                Description *
              </label>
              <textarea
                id="description"
                {...register("description")}
                rows={3}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Provide a brief overview of your idea"
              />
              {errors.description && (
                <p className="text-sm text-red-500 mt-1">{errors.description.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="problem" className="block text-sm font-medium mb-1">
                Problem Statement *
              </label>
              <textarea
                id="problem"
                {...register("problem")}
                rows={3}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="What problem does your idea solve?"
              />
              {errors.problem && (
                <p className="text-sm text-red-500 mt-1">{errors.problem.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="solution" className="block text-sm font-medium mb-1">
                Solution *
              </label>
              <textarea
                id="solution"
                {...register("solution")}
                rows={3}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="How does your idea solve the problem?"
              />
              {errors.solution && (
                <p className="text-sm text-red-500 mt-1">{errors.solution.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="targetAudience" className="block text-sm font-medium mb-1">
                  Target Audience
                </label>
                <input
                  id="targetAudience"
                  {...register("targetAudience")}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Who will use your product/service?"
                />
              </div>

              <div>
                <label htmlFor="marketSize" className="block text-sm font-medium mb-1">
                  Market Size
                </label>
                <input
                  id="marketSize"
                  {...register("marketSize")}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Estimated market size"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="competition" className="block text-sm font-medium mb-1">
                  Competition
                </label>
                <input
                  id="competition"
                  {...register("competition")}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Who are your competitors?"
                />
              </div>

              <div>
                <label htmlFor="businessModel" className="block text-sm font-medium mb-1">
                  Business Model
                </label>
                <input
                  id="businessModel"
                  {...register("businessModel")}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="How will you monetize?"
                />
              </div>
            </div>

            <div>
              <label htmlFor="tags" className="block text-sm font-medium mb-1">
                Tags
              </label>
              <input
                id="tags"
                {...register("tags")}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Enter tags separated by commas (e.g., Tech, Health, B2B)"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Separate tags with commas
              </p>
            </div>

            <div>
              <label htmlFor="mediaUrls" className="block text-sm font-medium mb-1">
                Media URLs
              </label>
              <input
                id="mediaUrls"
                {...register("mediaUrls")}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Links to images, videos, or presentations (optional)"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Add links to mockups, prototypes, or presentations
              </p>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
        </form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={() => router.back()}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          form="ideaForm"
          disabled={isLoading}
          className="bg-gradient-to-r from-primary to-accent"
        >
          {isLoading 
            ? (isEdit ? "Updating..." : "Submitting...") 
            : (isEdit ? "Update Idea" : "Submit Idea")}
        </Button>
      </CardFooter>
    </Card>
  );
}
