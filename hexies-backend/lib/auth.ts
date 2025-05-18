// lib/auth.ts - Authentication utilities
import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import { supabaseAdmin } from './supabase';

const JWT_SECRET = process.env.JWT_SECRET!;

export interface JWTPayload {
  userId: string;
  miroUserId: string;
  iat?: number;
  exp?: number;
}

export function signToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
}

export async function getUserFromRequest(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  const token = authHeader.substring(7);
  const payload = verifyToken(token);
  
  if (!payload) {
    return null;
  }
  
  // Get user from database
  const { data: user } = await supabaseAdmin
    .from('users')
    .select(`
      *,
      subscriptions(*,
        plan:subscription_plans(*)
      )
    `)
    .eq('id', payload.userId)
    .single();
  
  return user;
}

export function createApiError(message: string, status: number = 400) {
  return Response.json({ error: message }, { status });
}

// Middleware helper for auth
export async function withAuth(
  request: NextRequest,
  handler: (user: any, request: NextRequest) => Promise<Response>
) {
  const user = await getUserFromRequest(request);
  
  if (!user) {
    return createApiError('Unauthorized', 401);
  }
  
  return handler(user, request);
}