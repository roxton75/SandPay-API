import { FastifyInstance } from "fastify";
import { Merchant } from "../models/Merchant";
import { generateToken } from "../utils/jwt";

export async function merchantRoutes(app: FastifyInstance) {
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
}
