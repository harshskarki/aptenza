import Razorpay from 'razorpay'

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
})

const PLAN_PRICES = {
  pro: 29900,      // ₹299 in paise
  premium: 79900   // ₹799 in paise
}

export async function POST(request) {
  const { plan } = await request.json()

  if (!PLAN_PRICES[plan]) {
    return Response.json({ error: 'Invalid plan' }, { status: 400 })
  }

  try {
    const order = await razorpay.orders.create({
      amount: PLAN_PRICES[plan],
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      notes: { plan }
    })

    return Response.json({ orderId: order.id, amount: order.amount })
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}