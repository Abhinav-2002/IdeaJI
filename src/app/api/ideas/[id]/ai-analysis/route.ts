import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import OpenAI from "openai";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// POST handler for generating AI analysis
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "You must be logged in to generate AI analysis" },
        { status: 401 }
      );
    }

    const ideaId = params.id;

    // Check if idea exists and get its details
    const idea = await prisma.idea.findUnique({
      where: { id: ideaId },
      include: {
        tags: true,
        feedbacks: true,
      },
    });

    if (!idea) {
      return NextResponse.json(
        { error: "Idea not found" },
        { status: 404 }
      );
    }

    // Check if user is the owner or an admin
    if (idea.userId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "You don't have permission to generate AI analysis for this idea" },
        { status: 403 }
      );
    }

    // Check if idea already has an AI summary
    const existingAnalysis = await prisma.aISummary.findUnique({
      where: { ideaId },
    });

    // Prepare idea data for AI analysis
    const ideaData = {
      title: idea.title,
      description: idea.description,
      problem: idea.problem,
      solution: idea.solution,
      targetAudience: idea.targetAudience || "Not specified",
      marketSize: idea.marketSize || "Not specified",
      competition: idea.competition || "Not specified",
      businessModel: idea.businessModel || "Not specified",
      tags: idea.tags.map(tag => tag.name).join(", "),
      feedbackCount: idea.feedbacks.length,
      averageRating: idea.feedbacks.length > 0 
        ? idea.feedbacks.reduce((sum, fb) => sum + fb.rating, 0) / idea.feedbacks.length 
        : 0,
    };

    // Generate AI analysis using OpenAI
    const prompt = `
      Please analyze the following startup/app idea and provide a comprehensive SWOT analysis (Strengths, Weaknesses, Opportunities, Threats).
      
      IDEA DETAILS:
      Title: ${ideaData.title}
      Description: ${ideaData.description}
      Problem Statement: ${ideaData.problem}
      Proposed Solution: ${ideaData.solution}
      Target Audience: ${ideaData.targetAudience}
      Market Size: ${ideaData.marketSize}
      Competition: ${ideaData.competition}
      Business Model: ${ideaData.businessModel}
      Tags/Categories: ${ideaData.tags}
      
      Community Feedback:
      - Number of feedback submissions: ${ideaData.feedbackCount}
      - Average rating (1-5): ${ideaData.averageRating.toFixed(1)}
      
      Please structure your analysis as follows:
      1. Summary (2-3 paragraphs summarizing the idea and its potential)
      2. Strengths (bullet points)
      3. Weaknesses (bullet points)
      4. Opportunities (bullet points)
      5. Threats (bullet points)
      
      Be honest, constructive, and provide actionable insights. Focus on both business and technical aspects.
    `;

    const aiResponse = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are an expert business analyst and startup advisor with deep knowledge of technology, market trends, and business models." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 1500,
    });

    const analysisText = aiResponse.choices[0].message.content || "";
    
    // Extract sections from the AI response
    const sections = extractSections(analysisText);

    // Create or update AI summary in the database
    let aiSummary;
    if (existingAnalysis) {
      aiSummary = await prisma.aISummary.update({
        where: { ideaId },
        data: {
          content: sections.summary,
          strengths: sections.strengths,
          weaknesses: sections.weaknesses,
          opportunities: sections.opportunities,
          threats: sections.threats,
        },
      });
    } else {
      aiSummary = await prisma.aISummary.create({
        data: {
          content: sections.summary,
          strengths: sections.strengths,
          weaknesses: sections.weaknesses,
          opportunities: sections.opportunities,
          threats: sections.threats,
          idea: {
            connect: { id: ideaId },
          },
        },
      });
    }

    return NextResponse.json({
      message: "AI analysis generated successfully",
      aiSummary,
    });
  } catch (error) {
    console.error("Error generating AI analysis:", error);
    return NextResponse.json(
      { error: "An error occurred while generating AI analysis" },
      { status: 500 }
    );
  }
}

// Helper function to extract sections from AI response
function extractSections(text: string) {
  // Default values
  const defaultResult = {
    summary: "Analysis could not be generated properly.",
    strengths: "Not available.",
    weaknesses: "Not available.",
    opportunities: "Not available.",
    threats: "Not available.",
  };

  try {
    // Extract summary (everything before "Strengths" or first section)
    const summaryMatch = text.match(/(?:Summary:?\s*)([\s\S]+?)(?=\s*(?:Strengths|Strengths:|\d+\.\s*Strengths|•|\*))/i);
    const summary = summaryMatch ? summaryMatch[1].trim() : defaultResult.summary;

    // Extract strengths
    const strengthsMatch = text.match(/(?:Strengths:?\s*)([\s\S]+?)(?=\s*(?:Weaknesses|Weaknesses:|\d+\.\s*Weaknesses))/i);
    const strengths = strengthsMatch ? strengthsMatch[1].trim() : defaultResult.strengths;

    // Extract weaknesses
    const weaknessesMatch = text.match(/(?:Weaknesses:?\s*)([\s\S]+?)(?=\s*(?:Opportunities|Opportunities:|\d+\.\s*Opportunities))/i);
    const weaknesses = weaknessesMatch ? weaknessesMatch[1].trim() : defaultResult.weaknesses;

    // Extract opportunities
    const opportunitiesMatch = text.match(/(?:Opportunities:?\s*)([\s\S]+?)(?=\s*(?:Threats|Threats:|\d+\.\s*Threats))/i);
    const opportunities = opportunitiesMatch ? opportunitiesMatch[1].trim() : defaultResult.opportunities;

    // Extract threats (everything after "Threats:" to the end)
    const threatsMatch = text.match(/(?:Threats:?\s*)([\s\S]+)/i);
    const threats = threatsMatch ? threatsMatch[1].trim() : defaultResult.threats;

    return {
      summary,
      strengths,
      weaknesses,
      opportunities,
      threats,
    };
  } catch (error) {
    console.error("Error extracting sections from AI response:", error);
    return defaultResult;
  }
}

// GET handler for retrieving AI analysis
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const ideaId = params.id;

    // Check if idea exists
    const idea = await prisma.idea.findUnique({
      where: { id: ideaId },
    });

    if (!idea) {
      return NextResponse.json(
        { error: "Idea not found" },
        { status: 404 }
      );
    }

    // Get AI summary
    const aiSummary = await prisma.aISummary.findUnique({
      where: { ideaId },
    });

    if (!aiSummary) {
      return NextResponse.json(
        { error: "AI analysis not found for this idea" },
        { status: 404 }
      );
    }

    return NextResponse.json(aiSummary);
  } catch (error) {
    console.error("Error fetching AI analysis:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching AI analysis" },
      { status: 500 }
    );
  }
}
