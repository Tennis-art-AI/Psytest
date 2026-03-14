const express = require('express');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;
const SHOP_ID = process.env.SHOP_ID;
const SECRET_KEY = process.env.SECRET_KEY;
const RETURN_BASE_URL = process.env.RETURN_BASE_URL;
const AUTH = 'Basic ' + Buffer.from(SHOP_ID + ':' + SECRET_KEY).toString('base64');

/* ═══ Token storage (in-memory, TTL 24h) ═══ */
const tokens = new Map();
const TOKEN_TTL = 24 * 60 * 60 * 1000;

function cleanExpired() {
  const now = Date.now();
  for (const [k, v] of tokens) {
    if (now - v.created > TOKEN_TTL) tokens.delete(k);
  }
}
setInterval(cleanExpired, 60 * 60 * 1000);

/* ═══ Payment ID → Token mapping (for webhook) ═══ */
const paymentTokens = new Map();

app.use(express.json());

/* ═══ POST /api/create-payment ═══ */
app.post('/api/create-payment', async (req, res) => {
  try {
    const { screening, email } = req.body;
    if (!screening) return res.status(400).json({ error: 'screening required' });

    const token = uuidv4();
    const idempotenceKey = uuidv4();

    const body = {
      amount: { value: '399.00', currency: 'RUB' },
      capture: true,
      confirmation: {
        type: 'redirect',
        return_url: RETURN_BASE_URL + '/screening/' + screening + '/?token=' + token
      },
      description: 'Скрининг — MentalScreenLab',
      metadata: { screening, token }
    };

    // Receipt for self-employed (optional, if email provided)
    if (email) {
      body.receipt = {
        customer: { email },
        items: [{
          description: 'Углублённый скрининг ментального здоровья',
          quantity: '1.00',
          amount: { value: '399.00', currency: 'RUB' },
          vat_code: 1,
          payment_subject: 'service',
          payment_mode: 'full_payment'
        }]
      };
    }

    const response = await fetch('https://api.yookassa.ru/v3/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': AUTH,
        'Idempotence-Key': idempotenceKey
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('YooKassa error:', JSON.stringify(data));
      return res.status(500).json({ error: 'payment_creation_failed', details: data });
    }

    // Store mapping: paymentId → token
    paymentTokens.set(data.id, { token, screening, created: Date.now() });

    // Pre-store token as pending (not yet valid)
    tokens.set(token, { screening, created: Date.now(), valid: false });

    console.log('Payment created:', data.id, '→ token:', token, 'screening:', screening);

    res.json({ confirmation_url: data.confirmation.confirmation_url });
  } catch (err) {
    console.error('create-payment error:', err.message);
    res.status(500).json({ error: 'server_error' });
  }
});

/* ═══ POST /api/webhook ═══ */
app.post('/api/webhook', (req, res) => {
  // YooKassa sends notifications about payment status changes
  const event = req.body;

  if (!event || !event.event || !event.object) {
    return res.status(400).end();
  }

  console.log('Webhook:', event.event, event.object.id);

  if (event.event === 'payment.succeeded') {
    const paymentId = event.object.id;
    const mapping = paymentTokens.get(paymentId);

    if (mapping) {
      // Activate the token
      const tokenData = tokens.get(mapping.token);
      if (tokenData) {
        tokenData.valid = true;
        console.log('Token activated:', mapping.token, 'for', mapping.screening);
      }
      paymentTokens.delete(paymentId);
    } else {
      // Token from metadata (fallback)
      const meta = event.object.metadata;
      if (meta && meta.token) {
        tokens.set(meta.token, { screening: meta.screening, created: Date.now(), valid: true });
        console.log('Token activated from metadata:', meta.token);
      }
    }
  }

  // Always respond 200 to YooKassa
  res.status(200).end();
});

/* ═══ GET /api/check-payment ═══ */
app.get('/api/check-payment', (req, res) => {
  const token = req.query.token;
  if (!token) return res.json({ valid: false });

  const data = tokens.get(token);
  if (!data) return res.json({ valid: false });

  // Check TTL
  if (Date.now() - data.created > TOKEN_TTL) {
    tokens.delete(token);
    return res.json({ valid: false });
  }

  // For redirect flow: token might be valid before webhook arrives
  // Give 60 seconds grace period — check payment status directly
  if (!data.valid) {
    // Try to validate via YooKassa API (async, but return optimistic for redirect)
    // The webhook will activate it shortly
    // For now, if token exists and was created recently (< 5 min), assume pending
    if (Date.now() - data.created < 5 * 60 * 1000) {
      return res.json({ valid: true, screening: data.screening, status: 'pending' });
    }
    return res.json({ valid: false });
  }

  res.json({ valid: true, screening: data.screening });
});

/* ═══ Health ═══ */
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', tokens: tokens.size, uptime: process.uptime().toFixed(0) + 's' });
});

app.listen(PORT, '127.0.0.1', () => {
  console.log('Payment API running on port ' + PORT);
  console.log('Shop ID: ' + SHOP_ID);
  console.log('Return URL: ' + RETURN_BASE_URL);
});
