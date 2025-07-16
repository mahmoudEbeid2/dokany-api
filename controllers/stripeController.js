import stripe from "../utils/stripe.js";
import prisma from "../config/db.js";

export const createCheckoutSession = async (req, res) => {
  const user = req.user;

  if (user.role !== "customer") {
    return res.status(403).json({ error: "Access denied. Customers only." });
  }

  try {
    const cartItems = await prisma.cart.findMany({
      where: { customer_id: user.id },
      include: { product: true },
    });

    if (!cartItems.length) {
      return res.status(400).json({ error: "Cart is empty." });
    }

    const items = cartItems.map((item) => ({
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.final_price,
    }));

    const total_price = items.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: items.map((item) => ({
        price_data: {
          currency: "usd",
          product_data: {
            name: item.product_id,
          },
          unit_amount: item.price * 100,
        },
        quantity: item.quantity,
      })),
      mode: "payment",
      success_url: "http://localhost:4000/success",
      cancel_url: "http://localhost:4000/cancel",
      metadata: {
        items: JSON.stringify(items),
        userId: user.id,
        total_price: total_price.toString(),
      },
    });

    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error("Stripe Checkout Error:", err);
    res.status(500).json({ error: "Something went wrong." });
  }
};

export const handleStripeWebhook = async (req, res) => {
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

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const metadata = session.metadata;

    try {
      const items = JSON.parse(metadata.items);
      const total_price = parseFloat(metadata.total_price);
      const customer_id = metadata.userId;

      const newOrder = await prisma.order.create({
        data: {
          total_price,
          order_status: "processing",
          payment_reference: session.id,
          customer: { connect: { id: customer_id } },
          items: {
            create: items.map((item) => ({
              product: { connect: { id: item.product_id } },
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
      });

      await prisma.cart.deleteMany({
        where: { customer_id },
      });

      console.log("✅ Order created successfully:", newOrder.id);
    } catch (err) {
      console.error("Error creating order:", err.message);
      return res.status(500).send("Internal Server Error");
    }
  }

  res.status(200).json({ received: true });
};
