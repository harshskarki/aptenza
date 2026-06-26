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
    plan,
    userId
  } = await request.json()

  // Verify the payment signature using HMAC SHA256
  const body = razorpay_order_id + '|' + razorpay_payment_id
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex')

  const isValid = expectedSignature === razorpay_signature

  if (!isValid) {
    return Response.json({ success: false, error: 'Invalid signature' }, { status: 400 })
  }

  // Payment is verified — upgrade the user's plan
  const { error } = await supabaseAdmin
    .from('profiles')
    .update({ plan: plan, interviews_used: 0 })
    .eq('id', userId)

  if (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 })
  }

  return Response.json({ success: true })
}