require('dotenv').config({path: __dirname + '/.env'})

cors = require("cors")

const stripe = require('stripe')(process.env.SECRET_KEY);
const express = require('express');
const app = express();
app.use(cors({
    origin: "*",
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Origin', 'X-Requested-With', 'Accept', 'x-client-key', 'x-client-token', 'x-client-secret', 'Authorization'],
    credentials: true
}));
const PORT = 4000;


const YOUR_DOMAIN = 'http://localhost:5173';

app.post('/create-checkout-session', async (req, res) => {
  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
        price: process.env.PRICE_ID,
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${YOUR_DOMAIN}/success`,
    cancel_url: `${YOUR_DOMAIN}`,
  });

  res.redirect(303, session.url);
});

app.use(express.json())

app.post("/stripe", async(request, response) => {
  const {amount, name, line1, postal_code, city, state, country} = request.body;

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      shipping: {
      name: name,
      address: {
        line1: line1,
        postal_code: postal_code,
        city: city,
        state: state,
        country: country,
      },
    },
      amount,
      currency: "usd",
      description: 'Icon pack',
    })
    response.status(200).send({secret: paymentIntent.client_secret})
  } catch (error) {
    console.log("error", error);
    response.status(500).send("error" + error);

  }
});




app.listen(PORT, (error) => {
    if (!error) {
        console.log("Server running and app listening on PORT " + PORT)
    } else {
        console.log("Error occured", error)
    }
});