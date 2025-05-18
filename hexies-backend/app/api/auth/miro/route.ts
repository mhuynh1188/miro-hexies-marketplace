// app/api/auth/miro/route.ts
import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { signToken, createApiError } from '@/lib/auth';
import { z } from 'zod';

const miroAuthSchema = z.object({
  miroUserId: z.string(),
  email: z.string().email().optional(),
  name: z.string().optional(),
  boardId: z.string().optional()
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { miroUserId, email, name, boardId } = miroAuthSchema.parse(body);
    
    // Find or create user
    let { data: user, error } = await supabaseAdmin
      .from('users')
      .select(`
        *,
        subscriptions(*,
          plan:subscription_plans(*)
        )
      `)
      .eq('miro_user_id', miroUserId)
      .single();
    
    // If user doesn't exist, create them
    if (error && error.code === 'PGRST116') {
      const { data: newUser, error: createError } = await supabaseAdmin
        .from('users')
        .insert({
          miro_user_id: miroUserId,
          email: email || `${miroUserId}@miro.temp`,
          name: name || 'Miro User'
        })
        .select()
        .single();
      
      if (createError) {
        console.error('Error creating user:', createError);
        return createApiError('Failed to create user', 500);
      }
      
      user = newUser;
      
      // Create free subscription for new user
      await supabaseAdmin
        .from('subscriptions')
        .insert({
          user_id: user.id,
          plan_id: 'free',
          status: 'active'
        });
      
      // Reload user with subscription data
      const { data: userWithSub } = await supabaseAdmin
        .from('users')
        .select(`
          *,
          subscriptions(*,
            plan:subscription_plans(*)
          )
        `)
        .eq('id', user.id)
        .single();
      
      user = userWithSub;
    }
    
    if (!user) {
      return createApiError('Authentication failed', 401);
    }
    
    // Generate JWT token
    const token = signToken({
      userId: user.id,
      miroUserId: user.miro_user_id
    });
    
    // Track login
    await supabaseAdmin
      .from('hexie_usage')
      .insert({
        user_id: user.id,
        action: 'login',
        metadata: { boardId }
      });
    
    return Response.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        subscription: user.subscriptions?.[0] || null
      }
    });
    
  } catch (error) {
    console.error('Miro auth error:', error);
    if (error instanceof z.ZodError) {
      return createApiError('Invalid request data', 400);
    }
    return createApiError('Authentication failed', 500);
  }
}