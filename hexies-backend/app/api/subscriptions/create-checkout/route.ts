// app/api/subscriptions/create-checkout/route.ts - Stripe checkout
import { NextRequest } from 'next/server';
import Stripe from 'stripe';
import { supabaseAdmin } from '@/lib/supabase';
import { withAuth, createApiError } from '@/lib/auth';
import { z } from 'zod';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
});

const checkoutSchema = z.object({
  planId: z.enum(['pro', 'pro_yearly']),
  successUrl: z.string().url(),
  cancelUrl: z.string().url()
});

export async function POST(request: NextRequest) {
  return withAuth(request, async (user) => {
    try {
      const body = await request.json();
      const { planId, successUrl, cancelUrl } = checkoutSchema.parse(body);
      
      // Get plan details
      const { data: plan } = await supabaseAdmin
        .from('subscription_plans')
        .select('*')
        .eq('id', planId)
        .single();
      
      if (!plan) {
        return createApiError('Plan not found', 404);
      }
      
      // Find or create Stripe customer
      let stripeCustomer;
      const { data: existingSub } = await supabaseAdmin
        .from('subscriptions')
        .select('stripe_customer_id')
        .eq('user_id', user.id)
        .single();
      
      if (existingSub?.stripe_customer_id) {
        stripeCustomer = await stripe.customers.retrieve(existingSub.stripe_customer_id);
      } else {
        stripeCustomer = await stripe.customers.create({
          email: user.email,
          metadata: {
            userId: user.id,
            miroUserId: user.miro_user_id
          }
        });
      }
      
      // Create checkout session
      const session = await stripe.checkout.sessions.create({
        customer: stripeCustomer.id,
        payment_method_types: ['card'],
        line_items: [
          {
            price: plan.stripe_price_id,
            quantity: 1
          }
        ],
        mode: 'subscription',
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          userId: user.id,
          planId: plan.id
        }
      });
      
      return Response.json({ checkoutUrl: session.url });
      
    } catch (error) {
      console.error('Checkout error:', error);
      if (error instanceof z.ZodError) {
        return createApiError('Invalid request data', 400);
      }
      return createApiError('Failed to create checkout session', 500);
    }
  });
}