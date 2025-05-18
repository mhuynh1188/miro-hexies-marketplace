// app/api/admin/users/route.ts - Admin users management
import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { createApiError } from '@/lib/auth';

async function verifyAdmin(request: NextRequest) {
  // Simple admin verification - in production, use proper RBAC
  return true;
}

// GET /api/admin/users - Get all users with subscription info
export async function GET(request: NextRequest) {
  try {
    if (!await verifyAdmin(request)) {
      return createApiError('Admin access required', 403);
    }
    
    const { data: users, error } = await supabaseAdmin
      .from('users')
      .select(`
        *,
        subscriptions(
          *,
          plan:subscription_plans(id, name)
        )
      `)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching admin users:', error);
      return createApiError('Failed to fetch users', 500);
    }
    
    return Response.json(users);
  } catch (error) {
    console.error('Admin users error:', error);
    return createApiError('Failed to fetch users', 500);
  }
}

// app/api/admin/stats/route.ts - Admin dashboard stats
export async function GET(request: NextRequest) {
  try {
    if (!await verifyAdmin(request)) {
      return createApiError('Admin access required', 403);
    }
    
    // Get various counts in parallel
    const [
      { count: totalUsers },
      { count: activeSubscriptions },
      { count: totalHexies },
      { count: userHexies },
      { count: freeHexies },
      { count: premiumHexies }
    ] = await Promise.all([
      supabaseAdmin
        .from('users')
        .select('*', { count: 'exact', head: true }),
      supabaseAdmin
        .from('subscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')
        .neq('plan_id', 'free'),
      supabaseAdmin
        .from('hexies')
        .select('*', { count: 'exact', head: true }),
      supabaseAdmin
        .from('hexies')
        .select('*', { count: 'exact', head: true })
        .eq('is_user_created', true),
      supabaseAdmin
        .from('hexies')
        .select('*', { count: 'exact', head: true })
        .eq('free', true),
      supabaseAdmin
        .from('hexies')
        .select('*', { count: 'exact', head: true })
        .eq('free', false)
        .eq('is_user_created', false)
    ]);
    
    const stats = {
      totalUsers: totalUsers || 0,
      activeSubscriptions: activeSubscriptions || 0,
      totalHexies: totalHexies || 0,
      userHexies: userHexies || 0,
      freeHexies: freeHexies || 0,
      premiumHexies: premiumHexies || 0
    };
    
    return Response.json(stats);
  } catch (error) {
    console.error('Admin stats error:', error);
    return createApiError('Failed to fetch stats', 500);
  }
}