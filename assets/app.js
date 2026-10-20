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

// A stand-in for supabase-js, so nothing is ever written anywhere.
const supabase = {
  from: () => ({ insert: () => Promise.resolve({ error: { message: 'Test site: no database.' } }) }),
};

// Mistake 3 (site.payments.client-price, table variant): the browser writes the total into the orders table.
async function saveOrder() {
  const { error } = await supabase.from('orders').insert({ user_id: 'demo', total: total });
  say(error ? error.message : 'Saved.');
}

document.getElementById('checkout').addEventListener('click', checkout);
document.getElementById('quick-buy').addEventListener('click', quickBuy);
document.getElementById('save-order').addEventListener('click', saveOrder);
render();
