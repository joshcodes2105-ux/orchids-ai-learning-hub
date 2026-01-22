import OpenAI from 'openai';
import { fetchTranscript } from 'youtube-transcript-plus';
import yts from 'yt-search';
import { ExtractedSection, LearningResource } from '../types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function getEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  });
  return response.data[0].embedding;
}

function cosineSimilarity(a: number[], b: number[]): number {
  const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const normA = Math.sqrt(a.reduce((sum, val) => sum + val ** 2, 0));
  const normB = Math.sqrt(b.reduce((sum, val) => sum + val ** 2, 0));
  return dot / (normA * normB);
}

export async function findBestVideosForSection(
  section: ExtractedSection,
  isDocumentDriven: boolean = false
): Promise<LearningResource[]> {
  const query = `${section.title} ${section.keywords.join(' ')}`;
  const searchResults = await yts(query);
  const candidateVideos = searchResults.videos.slice(0, 5); // Take top 5 for matching

  const sectionText = `${section.title}: ${section.learningObjective}. Key concepts: ${section.keyConcepts.join(', ')}`;
  const sectionEmbedding = await getEmbedding(sectionText);

  const matchedVideos: LearningResource[] = await Promise.all(
    candidateVideos.map(async (video) => {
      let transcript = '';
      let matchConfidence = 0;
      let matchExplanation = '';
      let transcriptHighlights: { text: string; timestamp: number }[] = [];

      try {
        const transcriptItems = await fetchTranscript(video.videoId);
        transcript = transcriptItems.map(t => t.text).join(' ');

        // Clean transcript
        const cleanedTranscript = transcript.slice(0, 8000); // Take first 8000 chars for similarity

        if (cleanedTranscript) {
          const transcriptEmbedding = await getEmbedding(cleanedTranscript);
          const semanticScore = cosineSimilarity(sectionEmbedding, transcriptEmbedding);
          
          // Compute match confidence (0-100)
          matchConfidence = Math.round(semanticScore * 100);

          // Get AI explanation and highlights
          const explanationPrompt = `
            Section to match: ${sectionText}
            Video Title: ${video.title}
            Video Transcript (excerpt): ${cleanedTranscript.slice(0, 2000)}
            
            Compare the video transcript against the section requirements.
            1. Why is this video a good match (or not)?
            2. Identify 3 specific timestamps (in seconds) where key concepts are explained.
            
            Output JSON:
            {
              "explanation": "string",
              "highlights": [{"text": "concept name", "timestamp": number}]
            }
          `;

          const explanationResponse = await openai.chat.completions.create({
            model: 'gpt-4o-mini', // Using mini for speed and cost
            messages: [{ role: 'user', content: explanationPrompt }],
            response_format: { type: 'json_object' },
          });

          const explanationData = JSON.parse(explanationResponse.choices[0].message.content || '{}');
          matchExplanation = explanationData.explanation || '';
          transcriptHighlights = (explanationData.highlights || []).map((h: any) => ({
            text: h.text,
            timestamp: h.timestamp,
          }));
        }
      } catch (error) {
        console.warn(`Could not fetch transcript for ${video.videoId}:`, error);
        matchConfidence = 50; // Fallback score if no transcript
        matchExplanation = "Transcript unavailable. Match based on metadata.";
      }

      // Metadata score
      const metadataScore = (video.views / 1000000) * 10 + 10; // Simple boost for popular videos
      
      const totalScore = Math.min(matchConfidence + metadataScore, 100);

      return {
        id: crypto.randomUUID(),
        title: video.title,
        source: 'youtube',
        url: video.url,
        thumbnail: video.thumbnail,
        channel: video.author.name,
        duration: video.timestamp,
        views: video.views,
        publishedAt: video.ago,
        description: video.description,
        rankingScore: totalScore,
        relevanceScore: matchConfidence,
        matchConfidence,
        matchExplanation,
        transcriptHighlights,
      };
    })
  );

  return matchedVideos.sort((a, b) => (b.rankingScore || 0) - (a.rankingScore || 0));
}
