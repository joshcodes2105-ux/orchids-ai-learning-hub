import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';

export async function GET(request: NextRequest) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    const supabase = await createServiceClient();

    const { data, error } = await supabase
      .from('bookmarks')
      .select('id, resource_id, resource_data, created_at')
      .eq('user_id', req.userId)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch bookmarks' },
        { status: 500 }
      );
    }

    return NextResponse.json({ bookmarks: data || [] });
  });
}

export async function POST(request: NextRequest) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const { resourceId, resourceData } = await req.json();

      if (!resourceId || !resourceData) {
        return NextResponse.json(
          { error: 'Resource ID and data are required' },
          { status: 400 }
        );
      }

      const supabase = await createServiceClient();

      const { data: existing } = await supabase
        .from('bookmarks')
        .select('id')
        .eq('user_id', req.userId)
        .eq('resource_id', resourceId)
        .single();

      if (existing) {
        await supabase
          .from('bookmarks')
          .delete()
          .eq('id', existing.id);

        return NextResponse.json({ bookmarked: false });
      }

      await supabase
        .from('bookmarks')
        .insert({
          user_id: req.userId,
          resource_id: resourceId,
          resource_data: resourceData,
        });

      return NextResponse.json({ bookmarked: true });
    } catch {
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  });
}

export async function DELETE(request: NextRequest) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const { searchParams } = new URL(req.url);
      const resourceId = searchParams.get('resourceId');

      if (!resourceId) {
        return NextResponse.json(
          { error: 'Resource ID is required' },
          { status: 400 }
        );
      }

      const supabase = await createServiceClient();

      await supabase
        .from('bookmarks')
        .delete()
        .eq('user_id', req.userId)
        .eq('resource_id', resourceId);

      return NextResponse.json({ success: true });
    } catch {
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  });
}
