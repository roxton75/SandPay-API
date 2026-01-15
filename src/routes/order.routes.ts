import { FastifyInstance } from "fastify";
import { Order } from "../models/Order";

export async function orderRoutes(app: FastifyInstance) {
  app.post("/create-order", async (req) => {
    const { merch_id, items, total_amount } = req.body as any;

    const order = await Order.create({
      order_id: `ORD_${Date.now()}`,
      merch_id,
      items,
      total_amount,
      status: "created",
    });

    return order;
  });
}
