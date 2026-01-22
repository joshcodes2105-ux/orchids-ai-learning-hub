export interface LearningResource {
  id: string;
  title: string;
  source: 'youtube' | 'article' | 'blog';
  url: string;
  thumbnail: string;
  channel?: string;
  author?: string;
  duration?: string;
  views?: number;
  likes?: number;
  publishedAt?: string;
  description?: string;
  rankingScore: number;
  relevanceScore: number;
  summary?: ResourceSummary;
  bookmarked?: boolean;
  matchConfidence?: number;
  matchExplanation?: string;
  transcriptHighlights?: { text: string; timestamp: number }[];
}

export interface ResourceSummary {
  bullets: string[];
  paragraph: string;
  keyConcepts: string[];
}

export interface SearchSession {
  id: string;
  topic: string;
  timestamp: number;
  resources: LearningResource[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface UserSession {
  sessions: SearchSession[];
  bookmarks: LearningResource[];
  currentTopic?: string;
}

export interface SearchResponse {
  resources: LearningResource[];
  topic: string;
  totalResults: number;
}

export interface SummarizeRequest {
  resourceId: string;
  url: string;
  type: 'youtube' | 'article';
}

export interface RankingFactors {
  views: number;
  likes: number;
  duration: number;
  relevance: number;
  credibility: number;
}

export type FileType = 'pdf' | 'docx' | 'txt' | 'ppt' | 'image';

export type ProcessingStage = 
  | 'uploading'
  | 'extracting'
  | 'understanding'
  | 'sectioning'
  | 'fetching'
  | 'complete'
  | 'error';

export interface FileUploadState {
  file: File | null;
  stage: ProcessingStage;
  progress: number;
  error?: string;
}

export interface ExtractedSection {
  id: string;
  title: string;
  content: string;
  learningObjective: string;
  keyConcepts: string[];
  keywords: string[];
  intent: SectionIntent;
  order: number;
}

export interface SectionIntent {
  type: 'concept' | 'derivation' | 'example' | 'theory' | 'implementation';
  depth: 'beginner' | 'intermediate' | 'advanced';
  needsVisual: boolean;
  needsPractice: boolean;
}

export interface SectionResources {
  sectionId: string;
  videos: LearningResource[];
  theory: TheoryExplanation;
  summary: string;
}

export interface TheoryExplanation {
  title: string;
  content: string;
  keyConcepts: string[];
  relatedTopics: string[];
}

export interface ProcessedFile {
  id: string;
  fileName: string;
  fileType: FileType;
  uploadedAt: number;
  sections: ExtractedSection[];
  sectionResources: SectionResources[];
  overallTopic: string;
}

export interface FileProcessingResponse {
  fileId: string;
  sections: ExtractedSection[];
  overallTopic: string;
}

export interface SectionResourcesResponse {
  sectionId: string;
  resources: SectionResources;
}
