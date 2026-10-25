import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(request) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-razorpay-signature')

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(body)
      .digest('hex')

    if (expectedSignature !== signature) {
      console.error('Invalid webhook signature')
      return Response.json({ error: 'Invalid signature' }, { status: 400 })
    }

    const event = JSON.parse(body)
    const eventType = event.event

    console.log(`Razorpay webhook received: ${eventType}`)

    switch (eventType) {

      case 'payment.captured': {
        const payment = event.payload.payment.entity
        const notes = payment.notes || {}

        // Log successful payment
        console.log(`Payment captured: ${payment.id} for ₹${payment.amount / 100}`)

        // If it's a plan upgrade
        if (notes.plan && notes.userId) {
          await supabaseAdmin
            .from('profiles')
            .update({ plan: notes.plan, interviews_used: 0 })
            .eq('id', notes.userId)

          console.log(`Plan upgraded to ${notes.plan} for user ${notes.userId}`)
        }

        // If it's a credit purchase
        if (notes.credits && notes.userId) {
          const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('interview_credits')
            .eq('id', notes.userId)
            .single()

          await supabaseAdmin
            .from('profiles')
            .update({
              interview_credits: (profile?.interview_credits || 0) + parseInt(notes.credits)
            })
            .eq('id', notes.userId)

          console.log(`Added ${notes.credits} credits for user ${notes.userId}`)
        }

        break
      }

      case 'payment.failed': {
        const payment = event.payload.payment.entity
        console.error(`Payment failed: ${payment.id} — ${payment.error_description}`)

        // Log failed payment for monitoring
        await supabaseAdmin.from('credit_transactions').insert({
          user_id: payment.notes?.userId || null,
          credits: 0,
          amount: payment.amount,
          payment_id: payment.id,
          status: 'failed'
        }).catch(() => {}) // Don't fail if logging fails

        break
      }

      case 'refund.created': {
        const refund = event.payload.refund.entity
        console.log(`Refund created: ${refund.id} for payment ${refund.payment_id}`)
        break
      }

      case 'subscription.activated': {
        const subscription = event.payload.subscription.entity
        console.log(`Subscription activated: ${subscription.id}`)
        break
      }

      case 'subscription.cancelled': {
        const subscription = event.payload.subscription.entity
        console.log(`Subscription cancelled: ${subscription.id}`)

        // Downgrade user to free plan
        if (subscription.notes?.userId) {
          await supabaseAdmin
            .from('profiles')
            .update({ plan: 'free' })
            .eq('id', subscription.notes.userId)
        }
        break
      }

      default:
        console.log(`Unhandled webhook event: ${eventType}`)
    }

    return Response.json({ received: true })

  } catch (error) {
    console.error('Webhook error:', error)
    return Response.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}