import { FileType, ExtractedSection, SectionIntent } from "@/lib/types";

export function detectFileType(mimeType: string): FileType {
  if (mimeType === "application/pdf") return "pdf";
  if (mimeType.includes("wordprocessingml")) return "docx";
  if (mimeType === "text/plain") return "txt";
  if (mimeType.includes("presentation") || mimeType.includes("powerpoint")) return "ppt";
  if (mimeType.startsWith("image/")) return "image";
  return "txt";
}

export async function extractTextFromFile(
  file: ArrayBuffer,
  fileType: FileType,
  fileName: string
): Promise<string> {
  switch (fileType) {
    case "txt":
      return extractFromText(file);
    case "pdf":
      return await extractFromPDF(file);
    case "docx":
      return await extractFromDocx(file);
    case "ppt":
      return await extractFromPPT(file);
    case "image":
      return extractFromImage(file, fileName);
    default:
      throw new Error(`Unsupported file type: ${fileType}`);
  }
}

function extractFromText(buffer: ArrayBuffer): string {
  const decoder = new TextDecoder("utf-8");
  return decoder.decode(buffer);
}

async function extractFromPDF(buffer: ArrayBuffer): Promise<string> {
  try {
    const pdfParse = (await import("pdf-parse")).default;
    const uint8Array = new Uint8Array(buffer);
    const nodeBuffer = Buffer.from(uint8Array);
    
    const data = await pdfParse(nodeBuffer);
    
    if (data.text && data.text.trim().length > 0) {
      return cleanExtractedText(data.text);
    }
    
    return fallbackPDFExtraction(buffer);
  } catch (error) {
    console.error("PDF parsing error:", error);
    return fallbackPDFExtraction(buffer);
  }
}

function fallbackPDFExtraction(buffer: ArrayBuffer): string {
  const uint8Array = new Uint8Array(buffer);
  const str = new TextDecoder("latin1").decode(uint8Array);
  const textParts: string[] = [];
  
  const streamRegex = /stream\s*([\s\S]*?)\s*endstream/g;
  let match;
  
  while ((match = streamRegex.exec(str)) !== null) {
    const content = match[1];
    
    const tjMatches = content.match(/\[(.*?)\]\s*TJ/g) || [];
    for (const tjMatch of tjMatches) {
      const strings = tjMatch.match(/\((.*?)\)/g);
      if (strings) {
        textParts.push(strings.map((s) => s.slice(1, -1)).join(""));
      }
    }
    
    const singleTjMatches = content.match(/\((.*?)\)\s*Tj/g) || [];
    for (const tjMatch of singleTjMatches) {
      const textMatch = tjMatch.match(/\((.*?)\)/);
      if (textMatch) {
        textParts.push(textMatch[1]);
      }
    }
  }
  
  if (textParts.length === 0) {
    const parenRegex = /\(((?:[^()\\]|\\.){3,})\)/g;
    while ((match = parenRegex.exec(str)) !== null) {
      const text = match[1]
        .replace(/\\n/g, "\n")
        .replace(/\\r/g, "")
        .replace(/\\\(/g, "(")
        .replace(/\\\)/g, ")");
      
      if (/[a-zA-Z]{2,}/.test(text)) {
        textParts.push(text);
      }
    }
  }
  
  return cleanExtractedText(textParts.join(" "));
}

async function extractFromDocx(buffer: ArrayBuffer): Promise<string> {
  try {
    const mammoth = await import("mammoth");
    const uint8Array = new Uint8Array(buffer);
    const nodeBuffer = Buffer.from(uint8Array);
    
    const result = await mammoth.extractRawText({ buffer: nodeBuffer });
    
    if (result.value && result.value.trim().length > 0) {
      return cleanExtractedText(result.value);
    }
    
    return fallbackDocxExtraction(buffer);
  } catch (error) {
    console.error("DOCX parsing error:", error);
    return fallbackDocxExtraction(buffer);
  }
}

function fallbackDocxExtraction(buffer: ArrayBuffer): string {
  const uint8Array = new Uint8Array(buffer);
  const str = new TextDecoder("utf-8", { fatal: false }).decode(uint8Array);
  
  const textMatches: string[] = [];
  
  const wtRegex = /<w:t[^>]*>(.*?)<\/w:t>/g;
  let match;
  while ((match = wtRegex.exec(str)) !== null) {
    if (match[1].trim()) {
      textMatches.push(match[1]);
    }
  }
  
  if (textMatches.length > 0) {
    return cleanExtractedText(textMatches.join(" "));
  }
  
  return cleanExtractedText(
    str.replace(/<[^>]*>/g, " ").replace(/[^\x20-\x7E\n\r\t]/g, " ")
  );
}

async function extractFromPPT(buffer: ArrayBuffer): Promise<string> {
  const uint8Array = new Uint8Array(buffer);
  const str = new TextDecoder("utf-8", { fatal: false }).decode(uint8Array);
  
  const textMatches: string[] = [];
  
  const atRegex = /<a:t>(.*?)<\/a:t>/g;
  let match;
  while ((match = atRegex.exec(str)) !== null) {
    if (match[1].trim()) {
      textMatches.push(match[1]);
    }
  }
  
  const pRegex = /<p:txBody[^>]*>([\s\S]*?)<\/p:txBody>/g;
  while ((match = pRegex.exec(str)) !== null) {
    const innerText = match[1].replace(/<[^>]*>/g, " ").trim();
    if (innerText) {
      textMatches.push(innerText);
    }
  }
  
  if (textMatches.length === 0) {
    return fallbackDocxExtraction(buffer);
  }
  
  return cleanExtractedText(textMatches.join("\n\n"));
}

function extractFromImage(_buffer: ArrayBuffer, fileName: string): string {
  return `[Image file: ${fileName}]

This appears to be an image file. For full OCR text extraction, please integrate with an OCR service like Tesseract or a cloud OCR API.

In a production environment, this would:
1. Process the image through OCR
2. Extract all visible text
3. Identify diagrams, charts, and visual elements
4. Structure the content for learning`;
}

function cleanExtractedText(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/^\s+|\s+$/gm, "")
    .trim();
}

export function segmentIntoSections(text: string): ExtractedSection[] {
  const sections: ExtractedSection[] = [];
  
  const lines = text.split("\n");
  const headings: { title: string; index: number; lineIndex: number }[] = [];
  
  let charIndex = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (isHeading(line)) {
      headings.push({ title: line, index: charIndex, lineIndex: i });
    }
    
    charIndex += lines[i].length + 1;
  }
  
  if (headings.length === 0) {
    return segmentByParagraphs(text);
  }
  
  const uniqueHeadings = headings.filter(
    (h, i, arr) => i === 0 || h.lineIndex - arr[i - 1].lineIndex > 2
  );
  
  for (let i = 0; i < uniqueHeadings.length; i++) {
    const heading = uniqueHeadings[i];
    const nextHeading = uniqueHeadings[i + 1];
    
    const contentLines = lines.slice(
      heading.lineIndex + 1,
      nextHeading ? nextHeading.lineIndex : lines.length
    );
    
    const content = contentLines.join("\n").trim();
    
    if (content.length > 30) {
      const section = createSection(heading.title, content, i);
      sections.push(section);
    }
  }
  
  if (sections.length === 0) {
    return segmentByParagraphs(text);
  }
  
  return sections;
}

function isHeading(line: string): boolean {
  if (!line || line.length < 3 || line.length > 100) return false;
  
  if (/^#{1,6}\s+.+$/.test(line)) return true;
  
  if (/^\d+\.\s+[A-Z]/.test(line) && line.length < 80) return true;
  
  if (/^(?:Chapter|Section|Part|Unit|Module|Lesson)\s+\d*/i.test(line)) return true;
  
  if (/^[A-Z][A-Z\s]{4,}$/.test(line) && !/\s{2,}/.test(line)) return true;
  
  if (
    /^[A-Z][a-zA-Z\s]+$/.test(line) &&
    line.length >= 5 &&
    line.length <= 60 &&
    !line.endsWith(".") &&
    !line.endsWith(",") &&
    !line.endsWith(";")
  ) {
    const words = line.split(/\s+/);
    if (words.length <= 8) return true;
  }
  
  return false;
}

function segmentByParagraphs(text: string): ExtractedSection[] {
  const paragraphs = text.split(/\n\n+/).filter((p) => p.trim().length > 50);
  
  const sections: ExtractedSection[] = [];
  let currentContent = "";
  let sectionIndex = 0;
  
  for (let i = 0; i < paragraphs.length; i++) {
    const paragraph = paragraphs[i];
    currentContent += paragraph + "\n\n";
    
    const isLastParagraph = i === paragraphs.length - 1;
    const hasEnoughContent = currentContent.length > 400;
    
    if (hasEnoughContent || isLastParagraph) {
      if (currentContent.trim().length > 50) {
        const title = generateSectionTitle(currentContent, sectionIndex);
        const section = createSection(title, currentContent.trim(), sectionIndex);
        sections.push(section);
        sectionIndex++;
      }
      currentContent = "";
    }
  }
  
  if (sections.length === 0 && text.length > 50) {
    const title = generateSectionTitle(text, 0);
    sections.push(createSection(title, text, 0));
  }
  
  return sections;
}

function createSection(title: string, content: string, order: number): ExtractedSection {
  const keyConcepts = extractKeyConcepts(content);
  const keywords = extractKeywords(content);
  const intent = analyzeIntent(content);
  
  return {
    id: crypto.randomUUID(),
    title: cleanTitle(title),
    content,
    keyConcepts,
    keywords,
    intent,
    order,
  };
}

function cleanTitle(title: string): string {
  return title
    .replace(/^#+\s*/, "")
    .replace(/^\d+\.\s*/, "")
    .replace(/^(?:Chapter|Section|Part|Unit|Module|Lesson)\s*\d*:?\s*/i, "")
    .trim();
}

function generateSectionTitle(content: string, index: number): string {
  const lines = content.split("\n").filter((l) => l.trim());
  const firstLine = lines[0]?.trim() || "";
  
  if (firstLine.length >= 10 && firstLine.length <= 60 && !firstLine.endsWith(".")) {
    return firstLine;
  }
  
  const firstSentence = content.split(/[.!?]/)[0]?.trim();
  if (firstSentence && firstSentence.length >= 10 && firstSentence.length <= 60) {
    return firstSentence;
  }
  
  const keywords = extractKeywords(content).slice(0, 3);
  if (keywords.length > 0) {
    const formattedKeywords = keywords.map(
      (k) => k.charAt(0).toUpperCase() + k.slice(1)
    );
    return `Section ${index + 1}: ${formattedKeywords.join(", ")}`;
  }
  
  return `Section ${index + 1}`;
}

function extractKeyConcepts(content: string): string[] {
  const concepts: string[] = [];
  
  const definitionPatterns = [
    /(?:is defined as|refers to|means|is called|is a|are)\s+["']?([^.,"'\n]{5,40})/gi,
    /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/g,
  ];
  
  for (const pattern of definitionPatterns) {
    let match;
    const patternCopy = new RegExp(pattern.source, pattern.flags);
    while ((match = patternCopy.exec(content)) !== null) {
      const concept = match[1]?.trim();
      if (concept && concept.length > 3 && concept.length < 50) {
        concepts.push(concept);
      }
    }
  }
  
  return [...new Set(concepts)].slice(0, 5);
}

function extractKeywords(content: string): string[] {
  const words = content.toLowerCase().match(/\b[a-z]{4,}\b/g) || [];
  
  const stopWords = new Set([
    "this", "that", "with", "from", "have", "been", "were", "will", "would",
    "could", "should", "about", "which", "their", "there", "these", "those",
    "then", "than", "when", "what", "where", "while", "also", "into", "only",
    "other", "more", "most", "some", "such", "each", "very", "just", "over",
    "after", "before", "between", "through", "during", "under", "being",
    "they", "them", "your", "because", "make", "like", "using", "used",
    "does", "done", "doing", "made", "many", "much", "even", "well",
  ]);
  
  const wordFreq: Record<string, number> = {};
  
  for (const word of words) {
    if (!stopWords.has(word) && word.length > 3) {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    }
  }
  
  return Object.entries(wordFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word]) => word);
}

function analyzeIntent(content: string): SectionIntent {
  const lowerContent = content.toLowerCase();
  
  let type: SectionIntent["type"] = "concept";
  
  if (/formula|equation|derive|proof|theorem|calculate|=\s*\d/.test(lowerContent)) {
    type = "derivation";
  } else if (/example|instance|case study|scenario|consider|for instance/i.test(lowerContent)) {
    type = "example";
  } else if (/implement|code|program|function|class|method|```|def |const |let |var /i.test(lowerContent)) {
    type = "implementation";
  } else if (/theory|principle|law|rule|concept|definition|overview|introduction/i.test(lowerContent)) {
    type = "theory";
  }
  
  let depth: SectionIntent["depth"] = "intermediate";
  
  if (/basic|beginner|introduction|fundamental|simple|getting started|what is/i.test(lowerContent)) {
    depth = "beginner";
  } else if (/advanced|complex|sophisticated|expert|in-depth|optimization|performance/i.test(lowerContent)) {
    depth = "advanced";
  }
  
  const needsVisual = /diagram|figure|chart|graph|illustration|image|visual|screenshot/i.test(lowerContent);
  const needsPractice = /exercise|practice|try|implement|build|create|write|hands-on|assignment/i.test(lowerContent);
  
  return { type, depth, needsVisual, needsPractice };
}

export function identifyOverallTopic(sections: ExtractedSection[]): string {
  const allKeywords: string[] = [];
  const allConcepts: string[] = [];
  
  for (const section of sections) {
    allKeywords.push(...section.keywords);
    allConcepts.push(...section.keyConcepts);
  }
  
  const wordFreq: Record<string, number> = {};
  
  for (const word of [...allKeywords, ...allConcepts]) {
    const normalized = word.toLowerCase().trim();
    if (normalized.length > 2) {
      wordFreq[normalized] = (wordFreq[normalized] || 0) + 1;
    }
  }
  
  const topWords = Object.entries(wordFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([word]) => word.charAt(0).toUpperCase() + word.slice(1));
  
  if (topWords.length > 0) {
    return topWords.join(" & ");
  }
  
  if (sections.length > 0 && sections[0].title) {
    return sections[0].title;
  }
  
  return "Learning Content";
}
