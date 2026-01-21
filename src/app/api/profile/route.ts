import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { z } from 'zod';

const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  avatarUrl: z.string().url().optional(),
  preferredTopics: z.array(z.string()).optional(),
});

export async function GET(request: NextRequest) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    const supabase = await createServiceClient();

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id, email, name, avatar_url, preferred_topics, created_at, updated_at')
      .eq('id', req.userId)
      .single();

    if (error || !profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    const [searchHistory, bookmarks, viewedResources, uploadedFiles] = await Promise.all([
      supabase
        .from('search_history')
        .select('id, topic, created_at')
        .eq('user_id', req.userId)
        .order('created_at', { ascending: false })
        .limit(20),
      supabase
        .from('bookmarks')
        .select('id, resource_id, resource_data, created_at')
        .eq('user_id', req.userId)
        .order('created_at', { ascending: false }),
      supabase
        .from('viewed_resources')
        .select('id, resource_id, resource_data, viewed_at, view_count')
        .eq('user_id', req.userId)
        .order('viewed_at', { ascending: false })
        .limit(50),
      supabase
        .from('uploaded_files')
        .select('id, file_name, file_type, overall_topic, created_at')
        .eq('user_id', req.userId)
        .order('created_at', { ascending: false })
        .limit(20),
    ]);

    return NextResponse.json({
      profile: {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        avatarUrl: profile.avatar_url,
        preferredTopics: profile.preferred_topics,
        createdAt: profile.created_at,
        updatedAt: profile.updated_at,
      },
      stats: {
        totalSearches: searchHistory.data?.length || 0,
        totalBookmarks: bookmarks.data?.length || 0,
        totalViewed: viewedResources.data?.length || 0,
        totalUploads: uploadedFiles.data?.length || 0,
      },
      searchHistory: searchHistory.data || [],
      bookmarks: bookmarks.data || [],
      recentlyViewed: viewedResources.data || [],
      uploadedFiles: uploadedFiles.data || [],
    });
  });
}

export async function PATCH(request: NextRequest) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const body = await req.json();
      const validation = updateProfileSchema.safeParse(body);

      if (!validation.success) {
        return NextResponse.json(
          { error: validation.error.errors[0].message },
          { status: 400 }
        );
      }

      const supabase = await createServiceClient();

      const updateData: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };

      if (validation.data.name) updateData.name = validation.data.name;
      if (validation.data.avatarUrl) updateData.avatar_url = validation.data.avatarUrl;
      if (validation.data.preferredTopics) updateData.preferred_topics = validation.data.preferredTopics;

      const { data: profile, error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', req.userId)
        .select('id, email, name, avatar_url, preferred_topics, created_at, updated_at')
        .single();

      if (error || !profile) {
        return NextResponse.json(
          { error: 'Failed to update profile' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        profile: {
          id: profile.id,
          email: profile.email,
          name: profile.name,
          avatarUrl: profile.avatar_url,
          preferredTopics: profile.preferred_topics,
          createdAt: profile.created_at,
          updatedAt: profile.updated_at,
        },
      });
    } catch {
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  });
}
