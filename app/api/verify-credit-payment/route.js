import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(request) {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    credits,
    userId,
    amount
  } = await request.json()

  // Verify signature
  const body = razorpay_order_id + '|' + razorpay_payment_id
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex')

  if (expectedSignature !== razorpay_signature) {
    return Response.json({ success: false, error: 'Invalid signature' }, { status: 400 })
  }

  // Add credits to user
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('interview_credits')
    .eq('id', userId)
    .single()

  const { error } = await supabaseAdmin
    .from('profiles')
    .update({ interview_credits: (profile?.interview_credits || 0) + credits })
    .eq('id', userId)

  if (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 })
  }

  // Record transaction
  await supabaseAdmin.from('credit_transactions').insert({
    user_id: userId,
    credits,
    amount,
    payment_id: razorpay_payment_id
  })

  return Response.json({ success: true, credits })
}