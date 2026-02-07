import express from 'express';
import userAuth from '../Middlewares/auth.js';
import razorpayInstance from '../utils/razorpay.js';
import Payment from '../Models/payment.js';
import { membershipAmount } from '../utils/constant.js';
import { validateWebhookSignature } from 'razorpay/dist/utils/razorpay-utils.js';
import User from '../Models/user.js';
import crypto from "crypto";

const paymentRouter = express.Router();
paymentRouter.post("/payment/webhook", async (req, res) => {
  try {
    const signature = req.headers["x-razorpay-signature"];

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(req.body)
      .digest("hex");

    if (signature !== expectedSignature) {
      return res.status(400).json({ message: "Invalid webhook signature" });
    }

    const event = JSON.parse(req.body.toString());

    if (event.event === "payment.captured") {
      const paymentDetails = event.payload.payment.entity;

      const payment = await Payment.findOne({
        orderId: paymentDetails.order_id,
      });

      if (!payment) {
        return res.status(404).json({ message: "Payment not found" });
      }

      payment.paymentId = paymentDetails.id;
      payment.status = paymentDetails.status;
      await payment.save();

      const user = await User.findById(payment.userId);

      user.isPremium = true;
      user.membershipType = payment.notes.membershipType;
      await user.save();
    }

    if (event.event === "payment.failed") {
      const paymentDetails = event.payload.payment.entity;

      await Payment.findOneAndUpdate(
        { orderId: paymentDetails.order_id },
        { status: "failed" }
      );
    }

    res.status(200).json({ message: "Webhook processed successfully" });

  } catch (err) {
    console.error("Webhook error:", err);
    res.status(500).json({ message: "Webhook error" });
  }
});

//when user clicks on buy now button, this route will be hit and it will create an order in razorpay and return the order details to the frontend

paymentRouter.post('/payment/create', userAuth, async (req, res) => {
  try {
    const { membershipType } = req.body;
    const { firstName, lastName, emailId } = req.user;

    const amount = membershipAmount[membershipType];// amount in the smallest currency unit ex. paise

    if (!amount) {
      return res.status(400).json({ message: "Invalid membership type" });
    }

    const order = await razorpayInstance.orders.create({
      amount,
      currency: "INR",
      receipt: `receipt_order_${Date.now()}`,
      notes: {
        firstName,
        lastName,
        emailId,
        membershipType
      }
    });

    //here we have recieved the ordrerid and other details from razorpay
    // once order is created(means recieved) , save the order details in the database

    console.log("Order created:", order);

    const payment = new Payment({
      userId: req.user._id,
      orderId: order.id,
      amount: order.amount,
      status: order.status,
      currency: order.currency,
      receipt: order.receipt,
      notes: order.notes, //Notes are custom metadata you attach to an order or payment
      //You add meaning: Who paid? For what? Which plan?
    });

    const savedPayment = await payment.save();

    // send the order details to the frontend
    res.status(201).json({
      ...savedPayment.toJSON(),
      keyId: process.env.RAZORPAY_KEY_ID
    });
// keyid is sent to open checkout , without keyid Razorpay Checkout fails to initialize ,Payment UI won’t open

  } catch (e) {
    console.error("Payment creation failed:", e);
    res.status(500).json({ message: "Payment creation failed" });
  }
});

//this api should be called after the payment is successful to verify if the user is premium or not
//add handler function in options of razorpay in frontend to call this api

paymentRouter.get('/premium/verify', userAuth, (req, res) => {
  const user = req.user.toJSON();
  if (user.isPremium) {
    res.status(200).json({ isPremium: true, membershipType: user.membershipType });

  }
  return res.json({ isPremium: false });
})

export default paymentRouter;