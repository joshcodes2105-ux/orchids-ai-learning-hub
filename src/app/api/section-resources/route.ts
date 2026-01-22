import { NextRequest, NextResponse } from "next/server";
import { ExtractedSection, SectionResources } from "@/lib/types";
import { findBestVideosForSection } from "@/lib/intelligence/matching";

export async function POST(request: NextRequest) {
  try {
    const { sections } = (await request.json()) as { sections: ExtractedSection[] };

    if (!sections || !Array.isArray(sections) || sections.length === 0) {
      return NextResponse.json(
        { error: "No sections provided" },
        { status: 400 }
      );
    }

    const sectionResources: SectionResources[] = await Promise.all(
      sections.map(async (section) => {
        const videos = await findBestVideosForSection(section);
        
        const theory = {
          title: `Theoretical Foundation: ${section.title}`,
          content: section.learningObjective,
          keyConcepts: section.keyConcepts,
          relatedTopics: section.keywords,
        };

        const summary = `This section focuses on ${section.title}. Learning objectives include ${section.learningObjective}. Key concepts covered: ${section.keyConcepts.join(", ")}.`;

        return {
          sectionId: section.id,
          videos,
          theory,
          summary,
        };
      })
    );

    return NextResponse.json({ sectionResources });
  } catch (error) {
    console.error("Section resources error:", error);
    return NextResponse.json(
      { error: "Failed to fetch resources for sections" },
      { status: 500 }
    );
  }
}
