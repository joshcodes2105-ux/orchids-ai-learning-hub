import OpenAI from 'openai';
import { ExtractedSection, SectionIntent } from '../types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateCurriculumFromTopic(topic: string): Promise<{ sections: ExtractedSection[], overallTopic: string }> {
  const prompt = `
    You are an expert curriculum designer. Generate a structured learning curriculum for the topic: "${topic}".
    
    Break the topic into 5-8 logical learning sections.
    For each section, provide:
    1. Title
    2. Learning Objective (what the student will learn)
    3. Key Concepts (3-5 core ideas)
    4. Keywords for search (3-5 specific terms)
    5. Intent:
       - Type: concept, derivation, example, theory, or implementation
       - Depth: beginner, intermediate, or advanced
       - needsVisual: boolean
       - needsPractice: boolean
    
    Output the result as a JSON object with the following structure:
    {
      "overallTopic": "string",
      "sections": [
        {
          "title": "string",
          "learningObjective": "string",
          "keyConcepts": ["string"],
          "keywords": ["string"],
          "intent": {
            "type": "concept" | "derivation" | "example" | "theory" | "implementation",
            "depth": "beginner" | "intermediate" | "advanced",
            "needsVisual": boolean,
            "needsPractice": boolean
          }
        }
      ]
    }
  `;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
  });

  const data = JSON.parse(response.choices[0].message.content || '{}');
  
  const sections: ExtractedSection[] = data.sections.map((s: any, index: number) => ({
    id: crypto.randomUUID(),
    ...s,
    content: s.learningObjective, // Using objective as initial content
    order: index,
  }));

  return {
    sections,
    overallTopic: data.overallTopic || topic,
  };
}

export async function generateCurriculumFromDocument(text: string, fileName: string): Promise<{ sections: ExtractedSection[], overallTopic: string }> {
  const prompt = `
    You are an expert at analyzing educational documents. I have extracted text from a file named "${fileName}".
    
    Analyze the following content and break it into structured learning sections.
    Perform semantic segmentation and topic clustering to detect concept boundaries.
    
    Document Content:
    ${text.slice(0, 15000)} // Truncating for safety, though GPT-4o has large context
    
    For each section, provide:
    1. Title (clean and descriptive)
    2. Learning Objective (what the student should understand from this part of the document)
    3. Key Concepts (3-5 core ideas found in this section)
    4. Keywords for search (3-5 specific terms to find related videos)
    5. Intent (based on the content):
       - Type: concept, derivation, example, theory, or implementation
       - Depth: beginner, intermediate, or advanced
       - needsVisual: boolean
       - needsPractice: boolean
    
    Output the result as a JSON object:
    {
      "overallTopic": "string",
      "sections": [
        {
          "title": "string",
          "learningObjective": "string",
          "keyConcepts": ["string"],
          "keywords": ["string"],
          "intent": { "type": "...", "depth": "...", "needsVisual": boolean, "needsPractice": boolean }
        }
      ]
    }
  `;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
  });

  const data = JSON.parse(response.choices[0].message.content || '{}');
  
  const sections: ExtractedSection[] = data.sections.map((s: any, index: number) => ({
    id: crypto.randomUUID(),
    ...s,
    content: s.learningObjective,
    order: index,
  }));

  return {
    sections,
    overallTopic: data.overallTopic || fileName,
  };
}
