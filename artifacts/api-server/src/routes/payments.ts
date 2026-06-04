import { Router } from "express";
import Razorpay from "razorpay";
import crypto from "crypto";

const router = Router();

function getRazorpay() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) return null;
  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

router.post("/payments/create-order", async (req, res) => {
  const { amount } = req.body as { amount: number };

  if (!amount || typeof amount !== "number" || amount < 100) {
    res.status(400).json({ error: "Minimum deposit is ₹100" });
    return;
  }
  if (amount > 50000) {
    res.status(400).json({ error: "Maximum deposit is ₹50,000 per transaction" });
    return;
  }

  const razorpay = getRazorpay();
  if (!razorpay) {
    res.status(200).json({ manual: true, message: "Razorpay not configured — use manual UPI" });
    return;
  }

  try {
    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: "INR",
      receipt: `el_${Date.now()}`,
      notes: { platform: "EliteLobby", type: "wallet_topup" },
    });

    res.json({
      orderId: order.id,
      amount,
      currency: "INR",
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err: unknown) {
    req.log.error({ err }, "Razorpay order creation failed");
    res.status(502).json({ error: "Payment gateway error. Please try again." });
  }
});

router.post("/payments/verify", (req, res) => {
  const { orderId, paymentId, signature } = req.body as {
    orderId: string;
    paymentId: string;
    signature: string;
  };

  if (!orderId || !paymentId || !signature) {
    res.status(400).json({ error: "Missing payment details" });
    return;
  }

  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) {
    res.status(503).json({ error: "Payment gateway not configured" });
    return;
  }

  const body = `${orderId}|${paymentId}`;
  const expected = crypto
    .createHmac("sha256", keySecret)
    .update(body)
    .digest("hex");

  if (expected !== signature) {
    req.log.warn({ orderId, paymentId }, "Payment signature mismatch");
    res.status(400).json({ error: "Payment verification failed. Contact support." });
    return;
  }

  const referenceId = `EL-${paymentId.slice(-8).toUpperCase()}`;
  req.log.info({ orderId, paymentId, referenceId }, "Payment verified");
  res.json({ success: true, paymentId, referenceId });
});

export default router;
