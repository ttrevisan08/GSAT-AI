import Stripe from 'stripe'
import { getStripe } from './client'
import { createServiceClient } from '@/lib/supabase/server'
import crypto from 'crypto'

export async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const customerEmail = session.customer_details?.email || session.customer_email
  if (!customerEmail) {
    throw new Error('No customer email in checkout session')
  }

  const supabase = await createServiceClient()

  // Check if student already exists (idempotency)
  const { data: existing } = await supabase
    .from('students')
    .select('id')
    .eq('email', customerEmail)
    .single()

  if (existing) return // Already created

  // Generate temporary password
  const tempPassword = crypto.randomBytes(12).toString('base64url')

  // Create Supabase auth user
  const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
    email: customerEmail,
    password: tempPassword,
    email_confirm: true,
  })

  if (authError) throw authError

  const customerName =
    session.customer_details?.name || customerEmail.split('@')[0]

  // Create student record
  const { error: studentError } = await supabase.from('students').insert({
    id: authUser.user.id,
    email: customerEmail,
    full_name: customerName,
    stripe_customer_id: session.customer as string,
    subscription_status: 'active',
  })

  if (studentError) throw studentError

  // Create gamification record
  const { error: gamError } = await supabase
    .from('student_gamification')
    .insert({ student_id: authUser.user.id })

  if (gamError) throw gamError

  // TODO: Send welcome email with credentials via Resend or Supabase
  console.log(`Account created for ${customerEmail} with temp password: ${tempPassword}`)
}

export async function verifyStripeWebhook(
  body: string,
  signature: string
): Promise<Stripe.Event> {
  return getStripe().webhooks.constructEvent(
    body,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET!
  )
}
