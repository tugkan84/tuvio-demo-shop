# Tuvio test site

A deliberately insecure static page that Tuvio's live site scanner is tested against, served at
https://demo.tuvio.dev. It has no server, no Stripe account and no database: the mistakes live only in
`assets/app.js`, as code for the scanner to read.

- `fetch('/api/create-checkout-session', … amount …)`: `site.payments.client-price`
- `stripe.redirectToCheckout({ lineItems })`: `site.payments.client-only-checkout`
- `supabase.from('orders').insert({ total })`: `site.payments.client-price` (table variant)

Search engines are asked not to index it (robots.txt and a noindex meta tag).
