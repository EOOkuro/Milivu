import Stripe from "stripe";
import { PRODUCTS } from "../src/data/products.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const origin = req.headers.origin || `https://${req.headers.host}`;
    const line_items = (req.body.items || []).map((i) => {
      const p = PRODUCTS.find((x) => x.id === i.id);
      if (!p) throw new Error("Unknown item");
      const note = p.custom && i.custom ? `Name: ${i.custom.name} / Number: ${i.custom.number}` : undefined;
      return {
        quantity: Math.min(Math.max(parseInt(i.qty) || 1, 1), 50),
        price_data: {
          currency: "usd",
          unit_amount: p.price * 100,
          product_data: { name: `${p.name} (${i.size})`, description: note },
        },
      };
    });
    if (!line_items.length) throw new Error("Cart is empty");
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items,
      shipping_address_collection: { allowed_countries: ["US"] },
      success_url: `${origin}/success`,
      cancel_url: `${origin}/cart`,
    });
    res.status(200).json({ url: session.url });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
}
