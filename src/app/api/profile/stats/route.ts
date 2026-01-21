import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';

export async function GET(request: NextRequest) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    const supabase = await createServiceClient();

    const [searchHistory, viewedResources, bookmarks, uploadedFiles, learningProgress] =
      await Promise.all([
        supabase
          .from('search_history')
          .select('topic, created_at')
          .eq('user_id', req.userId)
          .order('created_at', { ascending: false }),
        supabase
          .from('viewed_resources')
          .select('resource_data, view_count')
          .eq('user_id', req.userId),
        supabase
          .from('bookmarks')
          .select('id')
          .eq('user_id', req.userId),
        supabase
          .from('uploaded_files')
          .select('id, overall_topic, sections')
          .eq('user_id', req.userId),
        supabase
          .from('learning_progress')
          .select('progress, completed')
          .eq('user_id', req.userId),
      ]);

    const topicFrequency: Record<string, number> = {};
    searchHistory.data?.forEach((item) => {
      const topic = item.topic.toLowerCase();
      topicFrequency[topic] = (topicFrequency[topic] || 0) + 1;
    });

    const topTopics = Object.entries(topicFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([topic, count]) => ({ topic, count }));

    const completedSections = learningProgress.data?.filter((p) => p.completed).length || 0;
    const totalSections = learningProgress.data?.length || 0;

    const totalViews = viewedResources.data?.reduce((acc, v) => acc + v.view_count, 0) || 0;

    const sourceBreakdown: Record<string, number> = { youtube: 0, article: 0, blog: 0 };
    viewedResources.data?.forEach((v) => {
      const source = (v.resource_data as { source?: string })?.source;
      if (source && sourceBreakdown[source] !== undefined) {
        sourceBreakdown[source]++;
      }
    });

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const dailyActivity: Record<string, number> = {};

    searchHistory.data?.forEach((item) => {
      const date = new Date(item.created_at);
      if (date >= thirtyDaysAgo) {
        const dateKey = date.toISOString().split('T')[0];
        dailyActivity[dateKey] = (dailyActivity[dateKey] || 0) + 1;
      }
    });

    return NextResponse.json({
      stats: {
        totalSearches: searchHistory.data?.length || 0,
        totalResourcesViewed: viewedResources.data?.length || 0,
        totalViews,
        totalBookmarks: bookmarks.data?.length || 0,
        totalFilesUploaded: uploadedFiles.data?.length || 0,
        completedSections,
        totalSections,
        completionRate: totalSections > 0 ? Math.round((completedSections / totalSections) * 100) : 0,
      },
      topTopics,
      sourceBreakdown,
      dailyActivity,
      recentTopics: searchHistory.data?.slice(0, 5).map((s) => s.topic) || [],
    });
  });
}
