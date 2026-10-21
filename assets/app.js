// Tuvio test site. Every pattern below is a deliberate mistake for Tuvio's site scanner to flag.
// None of it reaches a real backend: there is no server, no Stripe account and no database.

const products = [
  { id: 'prod_ethiopia', name: 'Ethiopia Guji', price: 18 },
  { id: 'prod_colombia', name: 'Colombia Huila', price: 16 },
];

const cart = [];
let total = 0;

function render() {
  const list = document.getElementById('products');
  list.innerHTML = '';
  for (const p of products) {
    const li = document.createElement('li');
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = `Add ${p.name} ($${p.price})`;
    button.addEventListener('click', () => {
      cart.push(p.id);
      total += p.price;
      document.getElementById('total').textContent = `$${total.toFixed(2)}`;
    });
    li.appendChild(button);
    list.appendChild(li);
  }
}

function say(text) {
  document.getElementById('status').textContent = text;
}

// Mistake 1 (site.payments.client-price): the browser sends the amount to the checkout route.
async function checkout() {
  const r = await fetch('/api/create-checkout-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items: cart, amount: total * 100 }),
  });
  say(r.ok ? 'Redirecting…' : 'Test site: there is no checkout server.');
}

// A stand-in for Stripe.js, so nothing is ever sent to Stripe.
const stripe = {
  redirectToCheckout: () => Promise.resolve(say('Test site: Stripe is not connected.')),
};

// Mistake 2 (site.payments.client-only-checkout): client-only Checkout with items chosen in the browser.
function quickBuy() {
  stripe.redirectToCheckout({
    lineItems: [{ price: 'price_demo_ethiopia', quantity: 1 }],
    mode: 'payment',
    successUrl: location.href,
    cancelUrl: location.href,
  });
}

// Mistake 4 (database checks, for a verified owner who confirms this backend): a real, throwaway Supabase
// project with fake data. Its URL and anon key are public by design; what anyone can read with them is up
// to the tables' Row Level Security. "profiles" is left readable on purpose, "products" is public by design,
// "orders" is locked.
const SUPABASE_URL = 'https://qaeynzofqahoembukerh.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhZXluem9mcWFob2VtYnVrZXJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI2MTU2MjcsImV4cCI6MjEwODE5MTYyN30.E42gZRdPxhThSUScA4jYSCrQiyESVWTaWuqi05HDUhc';

// A stand-in for supabase-js (createClient(SUPABASE_URL, SUPABASE_ANON_KEY)), so this page never sends
// anything anywhere: the scanner reads the code, the browser does not call the database.
const supabase = {
  url: SUPABASE_URL,
  key: SUPABASE_ANON_KEY,
  from: () => ({
    select: () => Promise.resolve({ data: [], error: null }),
    insert: () => Promise.resolve({ error: { message: 'Test site: no database.' } }),
  }),
};

// The tables this page would read.
async function loadAccount() {
  return supabase.from('profiles').select('full_name, email');
}

async function loadProducts() {
  return supabase.from('products').select('id, name, price_cents');
}

// Mistake 3 (site.payments.client-price, table variant): the browser writes the total into the orders table.
async function saveOrder() {
  const { error } = await supabase.from('orders').insert({ user_id: 'demo', total: total });
  say(error ? error.message : 'Saved.');
}

document.getElementById('checkout').addEventListener('click', checkout);
document.getElementById('quick-buy').addEventListener('click', quickBuy);
document.getElementById('save-order').addEventListener('click', saveOrder);
render();
