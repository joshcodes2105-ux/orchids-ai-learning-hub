import { NextRequest, NextResponse } from "next/server";
import { LearningResource } from "@/lib/types";
import { RANKING_WEIGHTS } from "@/lib/constants";

function calculateRankingScore(resource: Partial<LearningResource>): number {
  const viewsScore = Math.min((resource.views || 0) / 1000000, 1) * 100;
  const likesScore = Math.min((resource.likes || 0) / 50000, 1) * 100;
  
  const durationMinutes = parseDuration(resource.duration || "0:00");
  const durationScore = durationMinutes >= 10 && durationMinutes <= 30 ? 100 : 
                        durationMinutes > 30 && durationMinutes <= 60 ? 80 :
                        durationMinutes < 10 ? 60 : 50;
  
  const relevanceScore = resource.relevanceScore || 70;
  const credibilityScore = (resource.views || 0) > 100000 ? 90 : 
                           (resource.views || 0) > 10000 ? 70 : 50;

  const score = 
    viewsScore * RANKING_WEIGHTS.views +
    likesScore * RANKING_WEIGHTS.likes +
    durationScore * RANKING_WEIGHTS.duration +
    relevanceScore * RANKING_WEIGHTS.relevance +
    credibilityScore * RANKING_WEIGHTS.credibility;

  return Math.round(Math.min(Math.max(score, 0), 100));
}

function parseDuration(duration: string): number {
  const parts = duration.split(":").reverse();
  let minutes = 0;
  if (parts[1]) minutes += parseInt(parts[1]);
  if (parts[2]) minutes += parseInt(parts[2]) * 60;
  return minutes;
}

const REAL_VIDEO_IDS = [
  "PkZNo7MFNFg",
  "rfscVS0vtbw",
  "8hly31xKli0",
  "W6NZfCO5SIk",
  "kqtD5dpn9C8",
  "DHjqpvDnNGE",
  "bMknfKXIFA8",
  "Ke90Tje7VS0",
  "eIrMbAQSU34",
];

function generateMockResources(topic: string): LearningResource[] {
  const mockData: LearningResource[] = [
    {
      id: crypto.randomUUID(),
      title: `${topic} Complete Course - Beginner to Advanced`,
      source: "youtube",
      url: `https://www.youtube.com/watch?v=${REAL_VIDEO_IDS[0]}`,
      thumbnail: `https://img.youtube.com/vi/${REAL_VIDEO_IDS[0]}/maxresdefault.jpg`,
      channel: "freeCodeCamp.org",
      duration: "4:32:15",
      views: 2500000,
      likes: 85000,
      publishedAt: "2024-06-15",
      description: `Learn ${topic} from scratch with this comprehensive tutorial.`,
      rankingScore: 0,
      relevanceScore: 95,
      summary: {
        bullets: [
          `Comprehensive introduction to ${topic} fundamentals`,
          "Hands-on projects and real-world examples",
          "Best practices and industry standards covered",
          "Perfect for beginners with no prior experience"
        ],
        paragraph: `This course provides a thorough introduction to ${topic}, covering all essential concepts from basics to advanced techniques.`,
        keyConcepts: [topic, "Fundamentals", "Best Practices", "Projects"]
      }
    },
    {
      id: crypto.randomUUID(),
      title: `${topic} Tutorial for Beginners - Full Course`,
      source: "youtube",
      url: `https://www.youtube.com/watch?v=${REAL_VIDEO_IDS[1]}`,
      thumbnail: `https://img.youtube.com/vi/${REAL_VIDEO_IDS[1]}/maxresdefault.jpg`,
      channel: "Programming with Mosh",
      duration: "2:15:00",
      views: 1800000,
      likes: 62000,
      publishedAt: "2024-08-22",
      description: `Master ${topic} with clear explanations and examples.`,
      rankingScore: 0,
      relevanceScore: 92,
      summary: {
        bullets: [
          "Clear and concise explanations",
          "Step-by-step learning path",
          "Practical examples throughout",
          "Suitable for complete beginners"
        ],
        paragraph: `A beginner-friendly guide to ${topic} with practical examples.`,
        keyConcepts: [topic, "Tutorial", "Step-by-step", "Examples"]
      }
    },
    {
      id: crypto.randomUUID(),
      title: `Advanced ${topic} Concepts Explained`,
      source: "youtube",
      url: `https://www.youtube.com/watch?v=${REAL_VIDEO_IDS[2]}`,
      thumbnail: `https://img.youtube.com/vi/${REAL_VIDEO_IDS[2]}/maxresdefault.jpg`,
      channel: "Fireship",
      duration: "12:34",
      views: 950000,
      likes: 45000,
      publishedAt: "2024-09-10",
      description: `Deep dive into advanced ${topic} patterns and techniques.`,
      rankingScore: 0,
      relevanceScore: 88,
      summary: {
        bullets: [
          "Advanced concepts and patterns",
          "Performance optimization tips",
          "Real-world use cases",
          "Expert-level techniques"
        ],
        paragraph: `An advanced look at ${topic} for experienced developers.`,
        keyConcepts: [topic, "Advanced", "Patterns", "Performance"]
      }
    },
    {
      id: crypto.randomUUID(),
      title: `${topic} Crash Course - Learn in 1 Hour`,
      source: "youtube",
      url: `https://www.youtube.com/watch?v=${REAL_VIDEO_IDS[3]}`,
      thumbnail: `https://img.youtube.com/vi/${REAL_VIDEO_IDS[3]}/maxresdefault.jpg`,
      channel: "Traversy Media",
      duration: "1:05:22",
      views: 1200000,
      likes: 38000,
      publishedAt: "2024-07-05",
      description: `Quick introduction to ${topic} essentials.`,
      rankingScore: 0,
      relevanceScore: 85,
    },
    {
      id: crypto.randomUUID(),
      title: `The Ultimate Guide to ${topic}`,
      source: "article",
      url: `https://developer.mozilla.org/en-US/docs/Learn`,
      thumbnail: `https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=640&h=360&fit=crop`,
      author: "MDN Web Docs",
      views: 450000,
      publishedAt: "2024-10-01",
      description: `Comprehensive written guide covering all aspects of ${topic}.`,
      rankingScore: 0,
      relevanceScore: 90,
    },
    {
      id: crypto.randomUUID(),
      title: `${topic} Best Practices - Expert Tips`,
      source: "blog",
      url: `https://dev.to/`,
      thumbnail: `https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=640&h=360&fit=crop`,
      author: "Dev Community",
      views: 280000,
      publishedAt: "2024-09-28",
      description: `Industry best practices for ${topic} development.`,
      rankingScore: 0,
      relevanceScore: 82,
    },
    {
      id: crypto.randomUUID(),
      title: `${topic} Projects for Portfolio`,
      source: "youtube",
      url: `https://www.youtube.com/watch?v=${REAL_VIDEO_IDS[4]}`,
      thumbnail: `https://img.youtube.com/vi/${REAL_VIDEO_IDS[4]}/maxresdefault.jpg`,
      channel: "Web Dev Simplified",
      duration: "45:30",
      views: 680000,
      likes: 28000,
      publishedAt: "2024-08-15",
      description: `Build real projects to demonstrate your ${topic} skills.`,
      rankingScore: 0,
      relevanceScore: 78,
    },
    {
      id: crypto.randomUUID(),
      title: `${topic} Interview Questions & Answers`,
      source: "youtube",
      url: `https://www.youtube.com/watch?v=${REAL_VIDEO_IDS[5]}`,
      thumbnail: `https://img.youtube.com/vi/${REAL_VIDEO_IDS[5]}/maxresdefault.jpg`,
      channel: "TechLead",
      duration: "28:45",
      views: 520000,
      likes: 22000,
      publishedAt: "2024-09-05",
      description: `Prepare for ${topic} interviews with common questions.`,
      rankingScore: 0,
      relevanceScore: 75,
    },
    {
      id: crypto.randomUUID(),
      title: `${topic} in 100 Seconds`,
      source: "youtube",
      url: `https://www.youtube.com/watch?v=${REAL_VIDEO_IDS[6]}`,
      thumbnail: `https://img.youtube.com/vi/${REAL_VIDEO_IDS[6]}/maxresdefault.jpg`,
      channel: "Fireship",
      duration: "2:15",
      views: 1500000,
      likes: 75000,
      publishedAt: "2024-05-20",
      description: `Quick overview of ${topic} in under 2 minutes.`,
      rankingScore: 0,
      relevanceScore: 70,
    },
  ];

  return mockData
    .map(resource => ({
      ...resource,
      rankingScore: calculateRankingScore(resource),
    }))
    .sort((a, b) => b.rankingScore - a.rankingScore);
}

export async function POST(request: NextRequest) {
  try {
    const { topic } = await request.json();

    if (!topic || typeof topic !== "string") {
      return NextResponse.json(
        { error: "Topic is required" },
        { status: 400 }
      );
    }

    await new Promise(resolve => setTimeout(resolve, 1500));

    const resources = generateMockResources(topic);

    return NextResponse.json({
      resources,
      topic,
      totalResults: resources.length,
    });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Failed to search resources" },
      { status: 500 }
    );
  }
}
