require("dotenv").config();
import express, { json } from "express";
import cors from "cors";
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const app = express();
app.use(cors());
app.use(json()); // ✅ Make sure this is included

app.post("/create-payment-intent", async (req, res) => {
    try {
        const { amount, currency, userId } = req.body;

        if (!amount || !currency || !userId) {
            return res.status(400).json({ error: "Amount and currency are required" });
        }

        const paymentIntent = await stripe.paymentIntents.create({
            userId,
            amount,
            currency,
            automatic_payment_methods: { enabled: true },
        });

        res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`✅ Server is running on port ${PORT}`));
