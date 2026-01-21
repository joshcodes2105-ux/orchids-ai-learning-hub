import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';

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
        .from('viewed_resources')
        .select('id, view_count')
        .eq('user_id', req.userId)
        .eq('resource_id', resourceId)
        .single();

      if (existing) {
        await supabase
          .from('viewed_resources')
          .update({
            view_count: existing.view_count + 1,
            viewed_at: new Date().toISOString(),
          })
          .eq('id', existing.id);
      } else {
        await supabase
          .from('viewed_resources')
          .insert({
            user_id: req.userId,
            resource_id: resourceId,
            resource_data: resourceData,
          });
      }

      return NextResponse.json({ success: true });
    } catch {
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  });
}

export async function GET(request: NextRequest) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    const supabase = await createServiceClient();

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '50');

    const { data, error } = await supabase
      .from('viewed_resources')
      .select('id, resource_id, resource_data, viewed_at, view_count')
      .eq('user_id', req.userId)
      .order('viewed_at', { ascending: false })
      .limit(limit);

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch viewed resources' },
        { status: 500 }
      );
    }

    return NextResponse.json({ viewed: data || [] });
  });
}
