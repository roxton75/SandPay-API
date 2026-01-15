// import { initSocket, getIO } from "./socket";
// import Fastify from "fastify";
// import dotenv from "dotenv";
// dotenv.config();
// import { generateToken } from "./utils/jwt";
// import { sendWebhook } from "./utils/webhook";
// import { connectDB } from "./db";
// import { Merchant } from "./models/Merchant";
// import { Order } from "./models/Order";
// import { authenticateMerchant } from "./middleware/auth";
// import QRCode from "qrcode";
import { initSocket, getIO } from "./socket";
import Fastify from "fastify";
import dotenv from "dotenv";
import cors from "@fastify/cors";
dotenv.config();

import { generateToken } from "./utils/jwt";
import { sendWebhook } from "./utils/webhook";
import { connectDB } from "./db";
import { Merchant } from "./models/Merchant";
import { Order } from "./models/Order";
import { authenticateMerchant } from "./middleware/auth";
import QRCode from "qrcode";

const app = Fastify({ logger: true });

const EXPIRY_MINUTES = 2;

app.get("/health", async () => {
  return { status: "ok" };
});

app.get("/", async () => {
  return { message: "SandPay API running" };
});

app.post("/merchant/verify", async (req, reply) => {
  const { merch_id, merch_pass } = req.body as {
    merch_id: string;
    merch_pass: string;
  };

  const merchant = await Merchant.findOne({ merch_id, merch_pass });

  if (!merchant) {
    return reply.code(401).send({ error: "Invalid merchant" });
  }

  return { success: true, merchant };
});

app.post("/merchant/login", async (req, reply) => {
  const { merch_id, merch_pass } = req.body as {
    merch_id: string;
    merch_pass: string;
  };

  const merchant = await Merchant.findOne({ merch_id, merch_pass });

  if (!merchant) {
    return reply.code(401).send({ error: "Invalid credentials" });
  }

  const token = generateToken({
    merch_id: merchant.merch_id,
  });

  return {
    success: true,
    token,
  };
});

app.post("/create-order", { preHandler: authenticateMerchant }, async (req) => {
  const { items, total_amount } = req.body as {
    items: any[];
    total_amount: number;
  };

  const merchant = (req as any).merchant as { merch_id: string };

  const order = await Order.create({
    order_id: `ORD_${Date.now()}`,
    merch_id: merchant.merch_id,
    items,
    total_amount,
    expiresAt: new Date(Date.now() + EXPIRY_MINUTES * 60 * 1000),
  });

  return order;
});

app.post("/payment/confirm", async (req, reply) => {
  const { order_id } = req.body as { order_id: string };

  if (!order_id) {
    return reply.code(400).send({ error: "order_id is required" });
  }

  const order = await Order.findOne({ order_id });

  if (!order) {
    return reply.code(404).send({ error: "Order not found" });
  }

  if (order.status === "paid") {
    return reply.code(400).send({ error: "Order already paid" });
  }

  if (order.status === "expired") {
    return reply.code(400).send({ error: "Order expired" });
  }

  if (new Date() > order.expiresAt) {
    order.status = "expired";
    await order.save();
    return reply.code(400).send({ error: "Order expired" });
  }

  order.status = "paid";
  await order.save();

  // REAL-TIME EVENT
  getIO().to(order_id).emit("payment-success", {
    order_id,
    status: "paid",
  });

  const merchant = await Merchant.findOne({ merch_id: order.merch_id });

  if (merchant?.webhook_url) {
    sendWebhook(merchant.webhook_url, {
      event: "payment.success",
      order_id: order.order_id,
      amount: order.total_amount,
      status: order.status,
      timestamp: new Date().toISOString(),
    });
  }

  return {
    success: true,
    message: "Payment successful",
    order,
  };
});

app.get("/order/qr/:order_id", async (req, reply) => {
  const { order_id } = req.params as { order_id: string };

  const order = await Order.findOne({ order_id });

  if (!order) {
    return reply.code(404).send({ error: "Order not found" });
  }

  if (order.status === "paid") {
    return reply.code(400).send({ error: "Order already paid" });
  }

  if (new Date() > order.expiresAt) {
    order.status = "expired";
    await order.save();
    return reply.code(400).send({ error: "QR expired" });
  }

  const qrData = JSON.stringify({
    order_id: order.order_id,
  });

  const qrImage = await QRCode.toDataURL(qrData);

  return {
    order_id: order.order_id,
    qr: qrImage,
  };
});

const startServer = async () => {
  try {
    await connectDB();

    await app.register(cors, {
      origin: true,
    });

    const PORT = Number(process.env.PORT) || 4000;

    await app.listen({ port: PORT, host: "0.0.0.0" });

    console.log("Server running on http://localhost:4000");

    initSocket(app.server); // ✅ THIS IS IMPORTANT
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

startServer();
