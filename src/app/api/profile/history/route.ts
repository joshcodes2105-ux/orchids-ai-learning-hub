import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';

export async function GET(request: NextRequest) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    const supabase = await createServiceClient();

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '20');

    const { data, error } = await supabase
      .from('search_history')
      .select('id, topic, resources, created_at')
      .eq('user_id', req.userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch search history' },
        { status: 500 }
      );
    }

    return NextResponse.json({ history: data || [] });
  });
}

export async function POST(request: NextRequest) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const { topic, resources } = await req.json();

      if (!topic) {
        return NextResponse.json(
          { error: 'Topic is required' },
          { status: 400 }
        );
      }

      const supabase = await createServiceClient();

      const { data, error } = await supabase
        .from('search_history')
        .insert({
          user_id: req.userId,
          topic,
          resources: resources || [],
        })
        .select('id, topic, created_at')
        .single();

      if (error) {
        return NextResponse.json(
          { error: 'Failed to save search history' },
          { status: 500 }
        );
      }

      return NextResponse.json({ history: data });
    } catch {
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  });
}
