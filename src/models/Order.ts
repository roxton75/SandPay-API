import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema(
  {
    order_id: { type: String, required: true, unique: true },
    merch_id: { type: String, required: true },
    items: { type: Array, required: true },
    total_amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["created", "paid", "expired"],
      default: "created",
    },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

export const Order = mongoose.model("Order", OrderSchema);
