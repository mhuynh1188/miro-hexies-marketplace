// app/api/admin/hexies/route.ts - Admin hexies management
import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { createApiError } from '@/lib/auth';
import { z } from 'zod';

const adminHexieSchema = z.object({
  title: z.string().min(1).max(100),
  category: z.enum(['methods', 'teams', 'product', 'leadership', 'anti-patterns']),
  icon: z.string().max(10),
  summary: z.string().min(1).max(200),
  details: z.string().optional(),
  reference_url: z.string().url().optional().or(z.literal('')),
  tags: z.array(z.string()).optional(),
  benefits: z.array(z.string()).optional(),
  free: z.boolean().default(false),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).default('beginner'),
  duration: z.string().optional(),
  team_size: z.string().optional()
});

async function verifyAdmin(request: NextRequest) {
  // Simple admin verification - in production, use proper RBAC
  const authHeader = request.headers.get('authorization');
  // TODO: Implement proper admin authentication
  // For now, we'll skip this check - add admin auth later
  return true;
}

// GET /api/admin/hexies - Get all hexies
export async function GET(request: NextRequest) {
  try {
    if (!await verifyAdmin(request)) {
      return createApiError('Admin access required', 403);
    }
    
    const { data: hexies, error } = await supabaseAdmin
      .from('hexies')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching admin hexies:', error);
      return createApiError('Failed to fetch hexies', 500);
    }
    
    return Response.json(hexies);
  } catch (error) {
    console.error('Admin hexies error:', error);
    return createApiError('Failed to fetch hexies', 500);
  }
}

// POST /api/admin/hexies - Create system hexie
export async function POST(request: NextRequest) {
  try {
    if (!await verifyAdmin(request)) {
      return createApiError('Admin access required', 403);
    }
    
    const body = await request.json();
    const hexieData = adminHexieSchema.parse(body);
    
    const { data: hexie, error } = await supabaseAdmin
      .from('hexies')
      .insert({
        ...hexieData,
        is_user_created: false,
        user_id: null
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating admin hexie:', error);
      return createApiError('Failed to create hexie', 500);
    }
    
    return Response.json(hexie);
  } catch (error) {
    console.error('Create admin hexie error:', error);
    if (error instanceof z.ZodError) {
      return createApiError('Invalid hexie data', 400);
    }
    return createApiError('Failed to create hexie', 500);
  }
}