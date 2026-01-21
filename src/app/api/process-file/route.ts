import { NextRequest, NextResponse } from "next/server";
import {
  detectFileType,
  extractTextFromFile,
  segmentIntoSections,
  identifyOverallTopic,
} from "@/lib/file-processing/extractor";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const maxSize = 20 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size exceeds 20MB limit" },
        { status: 400 }
      );
    }

    const fileType = detectFileType(file.type);
    
    const buffer = await file.arrayBuffer();
    
    const extractedText = await extractTextFromFile(buffer, fileType, file.name);

    if (!extractedText || extractedText.length < 50) {
      return NextResponse.json(
        { error: "Could not extract meaningful text from the file" },
        { status: 400 }
      );
    }

    const sections = segmentIntoSections(extractedText);

    if (sections.length === 0) {
      return NextResponse.json(
        { error: "Could not identify learning sections in the file" },
        { status: 400 }
      );
    }

    const overallTopic = identifyOverallTopic(sections);

    const fileId = crypto.randomUUID();

    return NextResponse.json({
      fileId,
      fileName: file.name,
      fileType,
      sections,
      overallTopic,
      extractedLength: extractedText.length,
    });
  } catch (error) {
    console.error("File processing error:", error);
    return NextResponse.json(
      { error: "Failed to process file. Please try again." },
      { status: 500 }
    );
  }
}
