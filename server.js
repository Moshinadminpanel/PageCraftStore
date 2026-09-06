const express = require('express');
const cors = require('cors');

// Ensure this is your SECRET KEY (starts with sk_test_ or sk_live_)
const stripe = require('stripe')('sk_test_51U4ILJREDLicYAwlvciTn1t4246ZSarZZIoRycCdXf66csV0b7lt7TqDs5q3m0K6NY9m1UgRVvowUYNzgXWmIHzI00AceJn4eT');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/create-checkout-session', async (req, res) => {
  const { title, price } = req.body;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: title,
            },
            unit_amount: Math.round(price * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.origin || 'http://localhost:3000'}?success=true`,
      cancel_url: `${req.headers.origin || 'http://localhost:3000'}?canceled=true`,
    });

    res.json({ url: session.url });
  } catch (e) {
    // Print the full error in your terminal to trace issues instantly
    console.error("Stripe Error Details:", e.message);
    res.status(500).json({ error: e.message });
  }
});

app.listen(4242, () => console.log('Server running on port 4242'));