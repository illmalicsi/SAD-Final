const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// POST /api/payments/stripe/charge
router.post('/charge', async (req, res) => {
  try {
    const { amount, currency, source, description } = req.body;
    if (!amount || !currency || !source) {
      return res.status(400).json({ success: false, message: 'Missing required payment fields.' });
    }
    const charge = await stripe.charges.create({
      amount,
      currency,
      source,
      description: description || 'Payment',
    });
    res.json({ success: true, charge });
  } catch (err) {
    console.error('Stripe charge error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
