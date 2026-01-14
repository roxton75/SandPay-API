import { FastifyRequest, FastifyReply } from "fastify";
import { verifyToken } from "../utils/jwt";

export const authenticateMerchant = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return reply.code(401).send({ error: "Authorization header missing" });
    }

    // Format: Bearer TOKEN
    const token = authHeader.split(" ")[1];

    if (!token) {
      return reply.code(401).send({ error: "Token missing" });
    }

    const decoded = verifyToken(token);

    // Attach merchant info to request
    (req as any).merchant = decoded;
  } catch (error) {
    return reply.code(401).send({ error: "Invalid or expired token" });
  }
};
