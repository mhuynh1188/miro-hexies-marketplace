// app/api/analytics/track/route.ts - Analytics tracking
import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { withAuth, createApiError } from '@/lib/auth';
import { z } from 'zod';

const analyticsSchema = z.object({
  hexieId: z.string().uuid().optional(),
  action: z.string(),
  metadata: z.record(z.any()).optional()
});

export async function POST(request: NextRequest) {
  return withAuth(request, async (user) => {
    try {
      const body = await request.json();
      const { hexieId, action, metadata } = analyticsSchema.parse(body);
      
      // Insert analytics event
      const { error } = await supabaseAdmin
        .from('hexie_usage')
        .insert({
          user_id: user.id,
          hexie_id: hexieId || null,
          action,
          metadata: metadata || {}
        });
      
      if (error) {
        console.error('Error tracking analytics:', error);
        return createApiError('Failed to track event', 500);
      }
      
      return Response.json({ success: true });
      
    } catch (error) {
      console.error('Analytics error:', error);
      if (error instanceof z.ZodError) {
        return createApiError('Invalid analytics data', 400);
      }
      return createApiError('Failed to track event', 500);
    }
  });
}