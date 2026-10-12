# Jersey Shop

React + Vite storefront with Stripe Checkout, built to deploy on Vercel.

1. `npm install`
2. Brand name and tagline: `src/config.js`. Products and prices: `src/data/products.js`.
3. In Vercel, add the env var `STRIPE_SECRET_KEY` (use an `sk_test_` key first).
4. Deploy. Checkout lives in `api/checkout.js`. Locally, run `vercel dev` instead of `npm run dev` so `/api/checkout` works.

Prices are read from `products.js` on the server, so a customer can't change a price from the browser.
Custom kit name and number are saved on the Stripe line item description, so they appear on your Stripe order.
