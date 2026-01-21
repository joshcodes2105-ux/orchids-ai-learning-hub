import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { optionalAuth } from '@/lib/auth/middleware';

export async function GET(request: NextRequest) {
  const { userId } = await optionalAuth(request);

  if (!userId) {
    return NextResponse.json({
      recommendations: [],
      suggestedTopics: [],
      resumeLearning: null,
    });
  }

  const supabase = await createServiceClient();

  const [searchHistory, viewedResources, bookmarks] = await Promise.all([
    supabase
      .from('search_history')
      .select('topic, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50),
    supabase
      .from('viewed_resources')
      .select('resource_data, view_count, viewed_at')
      .eq('user_id', userId)
      .order('viewed_at', { ascending: false })
      .limit(30),
    supabase
      .from('bookmarks')
      .select('resource_data')
      .eq('user_id', userId)
      .limit(20),
  ]);

  const topicFrequency: Record<string, number> = {};
  searchHistory.data?.forEach((item) => {
    const topic = item.topic.toLowerCase();
    topicFrequency[topic] = (topicFrequency[topic] || 0) + 1;
  });

  const topTopics = Object.entries(topicFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([topic]) => topic);

  const relatedTopicSuggestions: Record<string, string[]> = {
    'javascript': ['typescript', 'react', 'node.js', 'web development'],
    'python': ['machine learning', 'data science', 'django', 'flask'],
    'react': ['next.js', 'typescript', 'redux', 'tailwind css'],
    'machine learning': ['deep learning', 'neural networks', 'tensorflow', 'python'],
    'data science': ['python', 'statistics', 'machine learning', 'pandas'],
    'web development': ['html', 'css', 'javascript', 'react'],
  };

  const suggestedTopics: string[] = [];
  topTopics.forEach((topic) => {
    const related = relatedTopicSuggestions[topic] || [];
    related.forEach((r) => {
      if (!topTopics.includes(r) && !suggestedTopics.includes(r)) {
        suggestedTopics.push(r);
      }
    });
  });

  const recentSearch = searchHistory.data?.[0];
  const resumeLearning = recentSearch
    ? {
        topic: recentSearch.topic,
        lastAccessed: recentSearch.created_at,
      }
    : null;

  const sourcePreference: Record<string, number> = { youtube: 0, article: 0, blog: 0 };
  viewedResources.data?.forEach((v) => {
    const source = (v.resource_data as { source?: string })?.source;
    if (source && sourcePreference[source] !== undefined) {
      sourcePreference[source] += v.view_count;
    }
  });

  const preferredSource = Object.entries(sourcePreference)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || 'youtube';

  const bookmarkKeywords: string[] = [];
  bookmarks.data?.forEach((b) => {
    const title = (b.resource_data as { title?: string })?.title?.toLowerCase() || '';
    const words = title.split(/\s+/).filter((w) => w.length > 4);
    bookmarkKeywords.push(...words.slice(0, 3));
  });

  const keywordFrequency: Record<string, number> = {};
  bookmarkKeywords.forEach((kw) => {
    keywordFrequency[kw] = (keywordFrequency[kw] || 0) + 1;
  });

  const topKeywords = Object.entries(keywordFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([kw]) => kw);

  return NextResponse.json({
    topTopics,
    suggestedTopics: suggestedTopics.slice(0, 6),
    resumeLearning,
    preferredSource,
    topKeywords,
    personalizationData: {
      hasEnoughData: (searchHistory.data?.length || 0) >= 3,
      searchCount: searchHistory.data?.length || 0,
      viewCount: viewedResources.data?.length || 0,
      bookmarkCount: bookmarks.data?.length || 0,
    },
  });
}
