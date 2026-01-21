import { NextRequest, NextResponse } from "next/server";
import { ResourceSummary } from "@/lib/types";

function generateSummary(title: string, topic: string): ResourceSummary {
  const bullets = [
    `Comprehensive coverage of ${topic} fundamentals`,
    "Step-by-step explanations with practical examples",
    "Real-world applications and use cases demonstrated",
    "Tips for common pitfalls and best practices",
    "Resources for further learning and practice"
  ];

  const paragraph = `This resource provides an in-depth exploration of ${topic}, starting from the basics and progressing to more advanced concepts. The content is well-structured with clear explanations, making it suitable for learners at various levels. Key topics include core principles, practical implementation strategies, and industry best practices.`;

  const keyConcepts = [
    topic,
    "Fundamentals",
    "Best Practices",
    "Implementation",
    "Examples"
  ];

  return {
    bullets: bullets.slice(0, 4),
    paragraph,
    keyConcepts: keyConcepts.slice(0, 5),
  };
}

export async function POST(request: NextRequest) {
  try {
    const { resourceId, title, topic } = await request.json();

    if (!resourceId || !title) {
      return NextResponse.json(
        { error: "Resource ID and title are required" },
        { status: 400 }
      );
    }

    await new Promise(resolve => setTimeout(resolve, 2000));

    const summary = generateSummary(title, topic || "the subject");

    return NextResponse.json({
      resourceId,
      summary,
    });
  } catch (error) {
    console.error("Summarize error:", error);
    return NextResponse.json(
      { error: "Failed to generate summary" },
      { status: 500 }
    );
  }
}
