import Razorpay from 'razorpay'

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
})

// Credit packages
const CREDIT_PACKAGES = {
  starter: { credits: 3, amount: 4900, label: '3 interviews' },    // ₹49
  popular: { credits: 10, amount: 14900, label: '10 interviews' },  // ₹149
  pro: { credits: 25, amount: 29900, label: '25 interviews' },      // ₹299
}

export async function POST(request) {
  const { package: pkg } = await request.json()

  if (!CREDIT_PACKAGES[pkg]) {
    return Response.json({ error: 'Invalid package' }, { status: 400 })
  }

  const { credits, amount, label } = CREDIT_PACKAGES[pkg]

  try {
    const order = await razorpay.orders.create({
      amount,
      currency: 'INR',
      receipt: `credits_${Date.now()}`,
      notes: { package: pkg, credits, label }
    })

    return Response.json({ orderId: order.id, amount: order.amount, credits, label })
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}