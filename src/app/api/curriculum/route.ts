import { NextRequest, NextResponse } from "next/server";
import { generateCurriculumFromTopic } from "@/lib/intelligence/curriculum";

export async function POST(request: NextRequest) {
  try {
    const { topic } = await request.json();

    if (!topic || typeof topic !== "string") {
      return NextResponse.json(
        { error: "Topic is required" },
        { status: 400 }
      );
    }

    const { sections, overallTopic } = await generateCurriculumFromTopic(topic);

    return NextResponse.json({
      sections,
      overallTopic,
    });
  } catch (error) {
    console.error("Curriculum generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate curriculum" },
      { status: 500 }
    );
  }
}
