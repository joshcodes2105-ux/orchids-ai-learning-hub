import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { verifyToken } from '@/lib/auth/jwt';

export async function GET(request: NextRequest) {
  try {
    const accessToken = request.cookies.get('access_token')?.value;

    if (!accessToken) {
      return NextResponse.json({ user: null });
    }

    const payload = await verifyToken(accessToken);

    if (!payload || payload.type !== 'access') {
      return NextResponse.json({ user: null });
    }

    const supabase = await createServiceClient();

    const { data: user, error } = await supabase
      .from('profiles')
      .select('id, email, name, avatar_url, preferred_topics, created_at')
      .eq('id', payload.userId)
      .single();

    if (error || !user) {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatar_url,
        preferredTopics: user.preferred_topics,
        createdAt: user.created_at,
      },
    });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json({ user: null });
  }
}
