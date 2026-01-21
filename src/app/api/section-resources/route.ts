import { NextRequest, NextResponse } from "next/server";
import { ExtractedSection, LearningResource, SectionResources, TheoryExplanation } from "@/lib/types";
import { RANKING_WEIGHTS } from "@/lib/constants";

function calculateRankingScore(
  resource: Partial<LearningResource>,
  sectionKeywords: string[]
): number {
  const viewsScore = Math.min((resource.views || 0) / 1000000, 1) * 100;
  const likesScore = Math.min((resource.likes || 0) / 50000, 1) * 100;

  const durationMinutes = parseDuration(resource.duration || "0:00");
  const durationScore =
    durationMinutes >= 10 && durationMinutes <= 30
      ? 100
      : durationMinutes > 30 && durationMinutes <= 60
      ? 80
      : durationMinutes < 10
      ? 60
      : 50;

  const titleLower = resource.title?.toLowerCase() || "";
  const keywordMatches = sectionKeywords.filter((kw) =>
    titleLower.includes(kw.toLowerCase())
  ).length;
  const relevanceScore = Math.min(50 + keywordMatches * 15, 100);

  const credibilityScore =
    (resource.views || 0) > 100000 ? 90 : (resource.views || 0) > 10000 ? 70 : 50;

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

function generateResourcesForSection(section: ExtractedSection): LearningResource[] {
  const { title, keywords, intent } = section;
  const searchTerm = title.length > 30 ? keywords.slice(0, 3).join(" ") : title;

  const depthLabel =
    intent.depth === "beginner"
      ? "Beginner"
      : intent.depth === "advanced"
      ? "Advanced"
      : "";
  const typeLabel =
    intent.type === "derivation"
      ? "Explained"
      : intent.type === "example"
      ? "Examples"
      : intent.type === "implementation"
      ? "Tutorial"
      : "";

  const mockResources: LearningResource[] = [
    {
      id: crypto.randomUUID(),
      title: `${searchTerm} - Complete ${depthLabel} Guide ${typeLabel}`.trim(),
      source: "youtube",
      url: `https://www.youtube.com/watch?v=mock1`,
      thumbnail: `https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=640&h=360&fit=crop`,
      channel: "freeCodeCamp.org",
      duration: "25:30",
      views: 1800000,
      likes: 65000,
      publishedAt: "2024-08-15",
      description: `Comprehensive guide to ${searchTerm}`,
      rankingScore: 0,
      relevanceScore: 90,
      summary: {
        bullets: [
          `Clear explanation of ${searchTerm} fundamentals`,
          "Step-by-step walkthrough with examples",
          "Best practices and common pitfalls",
          "Hands-on exercises included",
        ],
        paragraph: `This video provides a thorough introduction to ${searchTerm}, covering all essential concepts.`,
        keyConcepts: keywords.slice(0, 4),
      },
    },
    {
      id: crypto.randomUUID(),
      title: `Understanding ${searchTerm} in Depth`,
      source: "youtube",
      url: `https://www.youtube.com/watch?v=mock2`,
      thumbnail: `https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=640&h=360&fit=crop`,
      channel: "Fireship",
      duration: "12:45",
      views: 950000,
      likes: 42000,
      publishedAt: "2024-09-20",
      description: `Deep dive into ${searchTerm} concepts`,
      rankingScore: 0,
      relevanceScore: 85,
      summary: {
        bullets: [
          `Core concepts of ${searchTerm}`,
          "Visual explanations",
          "Quick reference guide",
        ],
        paragraph: `A focused look at ${searchTerm} with visual aids.`,
        keyConcepts: keywords.slice(0, 3),
      },
    },
    {
      id: crypto.randomUUID(),
      title: `${searchTerm} - Practical Examples & Use Cases`,
      source: "youtube",
      url: `https://www.youtube.com/watch?v=mock3`,
      thumbnail: `https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=640&h=360&fit=crop`,
      channel: "Traversy Media",
      duration: "18:20",
      views: 720000,
      likes: 28000,
      publishedAt: "2024-07-10",
      description: `Practical examples for ${searchTerm}`,
      rankingScore: 0,
      relevanceScore: 82,
    },
    {
      id: crypto.randomUUID(),
      title: `${searchTerm} Crash Course`,
      source: "youtube",
      url: `https://www.youtube.com/watch?v=mock4`,
      thumbnail: `https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=640&h=360&fit=crop`,
      channel: "Web Dev Simplified",
      duration: "32:15",
      views: 580000,
      likes: 22000,
      publishedAt: "2024-06-28",
      description: `Quick crash course on ${searchTerm}`,
      rankingScore: 0,
      relevanceScore: 78,
    },
    {
      id: crypto.randomUUID(),
      title: `The Ultimate ${searchTerm} Reference`,
      source: "article",
      url: `https://example.com/article/${encodeURIComponent(searchTerm)}`,
      thumbnail: `https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=640&h=360&fit=crop`,
      author: "Tech Documentation",
      views: 320000,
      publishedAt: "2024-10-05",
      description: `Comprehensive article on ${searchTerm}`,
      rankingScore: 0,
      relevanceScore: 88,
    },
  ];

  return mockResources
    .map((r) => ({
      ...r,
      rankingScore: calculateRankingScore(r, keywords),
    }))
    .sort((a, b) => b.rankingScore - a.rankingScore)
    .slice(0, 5);
}

function generateTheoryExplanation(section: ExtractedSection): TheoryExplanation {
  const { title, keyConcepts, keywords, content } = section;

  const contentPreview = content.slice(0, 300).trim();
  const explanationParagraph =
    contentPreview.length > 100
      ? contentPreview + "..."
      : `${title} is a fundamental concept that encompasses several key ideas. Understanding this topic requires familiarity with ${keyConcepts.slice(0, 2).join(" and ") || "core principles"}. This section explores the theoretical foundations and practical applications.`;

  return {
    title: `Understanding ${title}`,
    content: explanationParagraph,
    keyConcepts: keyConcepts.length > 0 ? keyConcepts : keywords.slice(0, 4),
    relatedTopics: keywords.slice(0, 5).map((kw) => kw.charAt(0).toUpperCase() + kw.slice(1)),
  };
}

function generateSectionSummary(section: ExtractedSection): string {
  const { title, intent, keyConcepts } = section;

  const depthDescription =
    intent.depth === "beginner"
      ? "foundational"
      : intent.depth === "advanced"
      ? "advanced"
      : "intermediate";

  const typeDescription =
    intent.type === "derivation"
      ? "mathematical derivations and proofs"
      : intent.type === "example"
      ? "practical examples and case studies"
      : intent.type === "implementation"
      ? "implementation details and code"
      : intent.type === "theory"
      ? "theoretical concepts and principles"
      : "core concepts";

  const conceptsList =
    keyConcepts.length > 0
      ? `Key concepts include: ${keyConcepts.join(", ")}.`
      : "";

  return `This section covers ${depthDescription} ${typeDescription} related to ${title}. ${conceptsList} ${
    intent.needsVisual
      ? "Visual learning resources are recommended."
      : ""
  } ${intent.needsPractice ? "Hands-on practice is suggested." : ""}`.trim();
}

export async function POST(request: NextRequest) {
  try {
    const { sections } = (await request.json()) as { sections: ExtractedSection[] };

    if (!sections || !Array.isArray(sections) || sections.length === 0) {
      return NextResponse.json(
        { error: "No sections provided" },
        { status: 400 }
      );
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));

    const sectionResources: SectionResources[] = sections.map((section) => {
      const videos = generateResourcesForSection(section);
      const theory = generateTheoryExplanation(section);
      const summary = generateSectionSummary(section);

      return {
        sectionId: section.id,
        videos,
        theory,
        summary,
      };
    });

    return NextResponse.json({ sectionResources });
  } catch (error) {
    console.error("Section resources error:", error);
    return NextResponse.json(
      { error: "Failed to fetch resources for sections" },
      { status: 500 }
    );
  }
}
