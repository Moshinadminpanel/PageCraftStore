require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Polar } = require("@polar-sh/sdk");

// Ensure this is your SECRET KEY (starts with polar_)
// Make sure you have a .env file in the same folder with POLAR_ACCESS_TOKEN and POLAR_SUCCESS_URL

const app = express();
app.use(cors());
app.use(express.json());

app.post('/create-checkout-session', async (req, res) => {
  const { title, price } = req.body;

  try {
    const polar = new Polar({
      accessToken: process.env.POLAR_ACCESS_TOKEN,
    });

    const checkout = await polar.checkouts.create({
      products: [
            "70b86c86-7843-4ecf-88d3-791437e001c0"

      ],
      successUrl: process.env.POLAR_SUCCESS_URL // Ensure this URL ends with ?success=true
    });

    res.json({ url: checkout.url });
  } catch (e) {
    // Print the full error in your terminal to trace issues instantly
    console.error("Polar API Error Details:", e.message);
    res.status(500).json({ error: e.message });
  }
});

app.listen(4242, () => console.log('Server running on port 4242'));