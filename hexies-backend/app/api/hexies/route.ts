// app/api/hexies/route.ts - Hexies CRUD endpoints
import { NextRequest } from 'next/server';
import { supabaseAdmin, setAuthContext } from '@/lib/supabase';
import { withAuth, createApiError } from '@/lib/auth';
import { z } from 'zod';

const hexieSchema = z.object({
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

// GET /api/hexies - Get hexies (with permission filtering)
export async function GET(request: NextRequest) {
  return withAuth(request, async (user) => {
    try {
      const { searchParams } = new URL(request.url);
      const category = searchParams.get('category');
      const includeUser = searchParams.get('includeUser') === 'true';
      
      // Set auth context for RLS
      await setAuthContext(user.id);
      
      let query = supabaseAdmin
        .from('hexies')
        .select('*')
        .order('created_at', { ascending: false });
      
      // Filter by category if specified
      if (category) {
        query = query.eq('category', category);
      }
      
      // Filter user hexies if not includeUser
      if (!includeUser) {
        query = query.eq('is_user_created', false);
      }
      
      const { data: hexies, error } = await query;
      
      if (error) {
        console.error('Error fetching hexies:', error);
        return createApiError('Failed to fetch hexies', 500);
      }
      
      return Response.json(hexies);
      
    } catch (error) {
      console.error('Get hexies error:', error);
      return createApiError('Failed to fetch hexies', 500);
    }
  });
}

// POST /api/hexies - Create new hexie
export async function POST(request: NextRequest) {
  return withAuth(request, async (user) => {
    try {
      const body = await request.json();
      const hexieData = hexieSchema.parse(body);
      
      // Check user's hexie limit for free plan
      const subscription = user.subscriptions?.[0];
      if (subscription?.plan_id === 'free') {
        const { count } = await supabaseAdmin
          .from('hexies')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('is_user_created', true);
        
        if ((count || 0) >= 5) {
          return createApiError('Free plan limited to 5 custom hexies. Please upgrade.', 403);
        }
      }
      
      // Create hexie
      const { data: hexie, error } = await supabaseAdmin
        .from('hexies')
        .insert({
          ...hexieData,
          user_id: user.id,
          is_user_created: true
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error creating hexie:', error);
        return createApiError('Failed to create hexie', 500);
      }
      
      // Track creation
      await supabaseAdmin
        .from('hexie_usage')
        .insert({
          user_id: user.id,
          hexie_id: hexie.id,
          action: 'created'
        });
      
      return Response.json(hexie);
      
    } catch (error) {
      console.error('Create hexie error:', error);
      if (error instanceof z.ZodError) {
        return createApiError('Invalid hexie data', 400);
      }
      return createApiError('Failed to create hexie', 500);
    }
  });
}