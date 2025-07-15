import { it } from "zod/locales";
import stripe from "../utils/stripe.js";

export const createCheckoutSession = async (req, res) => {
  const user = req.user;
  if (!user === "customer")
    return res.status(403).json({ error: "Access denied. Customers only." });

  try {
    const { items } = req.body;
    //quantity customer id prouct id
    const proudcts = await items.map(async (item) => {});
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: items.map((item) => ({
        price_data: {
          currency: "usd",
          product_data: {
            name: item.name,
          },
          unit_amount: item.price * 100,
        },
        quantity: item.quantity,
      })),
      mode: "payment",
      success_url: "http://localhost:4000/success",
      cancel_url: "http://localhost:4000/cancel",
      metadata: {
        userId: user.id,
      },
    });

    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error("Stripe Checkout Error:", err);
    res.status(500).json({ error: "Something went wrong." });
  }
};

export const handleStripeWebhook = (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature error:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  const metadata = event.data.object.metadata;
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    console.log("✅ Checkout session completed:", metadata.userId);
  }

  res.status(200).json({ received: true });
};
