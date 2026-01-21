import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt';
import { createServiceClient } from '@/lib/supabase/server';

export interface AuthenticatedRequest extends NextRequest {
  userId: string;
  userEmail: string;
}

export async function withAuth(
  request: NextRequest,
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  const accessToken = request.cookies.get('access_token')?.value;

  if (!accessToken) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }

  const payload = await verifyToken(accessToken);

  if (!payload || payload.type !== 'access') {
    return NextResponse.json(
      { error: 'Invalid or expired token' },
      { status: 401 }
    );
  }

  const authenticatedRequest = request as AuthenticatedRequest;
  authenticatedRequest.userId = payload.userId;
  authenticatedRequest.userEmail = payload.email;

  return handler(authenticatedRequest);
}

export async function getAuthUser(request: NextRequest) {
  const accessToken = request.cookies.get('access_token')?.value;

  if (!accessToken) {
    return null;
  }

  const payload = await verifyToken(accessToken);

  if (!payload || payload.type !== 'access') {
    return null;
  }

  const supabase = await createServiceClient();
  const { data: user } = await supabase
    .from('profiles')
    .select('id, email, name, avatar_url, preferred_topics, created_at')
    .eq('id', payload.userId)
    .single();

  return user;
}

export async function optionalAuth(request: NextRequest) {
  const accessToken = request.cookies.get('access_token')?.value;

  if (!accessToken) {
    return { userId: null, userEmail: null };
  }

  const payload = await verifyToken(accessToken);

  if (!payload || payload.type !== 'access') {
    return { userId: null, userEmail: null };
  }

  return { userId: payload.userId, userEmail: payload.email };
}
