# Tuvio test site

A deliberately insecure static page that Tuvio's live site scanner is tested against, served at
https://demo.tuvio.dev. It has no server, no Stripe account and no database: the mistakes live only in
`assets/app.js`, as code for the scanner to read.

- `fetch('/api/create-checkout-session', … amount …)`: `site.payments.client-price`
- `stripe.redirectToCheckout({ lineItems })`: `site.payments.client-only-checkout`
- `supabase.from('orders').insert({ total })`: `site.payments.client-price` (table variant)

Backend checks for verified owners (probes) also find, on purpose:

- `/.env` with dummy values: an exposed .env file
- `/openapi.json`: public API docs
- `404.html` showing a fake Node.js stack trace: error pages that show code details

Search engines are asked not to index it (robots.txt and a noindex meta tag).
