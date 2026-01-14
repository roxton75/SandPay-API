import mongoose from "mongoose";

const MerchantSchema = new mongoose.Schema(
  {
    merch_id: { type: String, required: true, unique: true },
    merch_pass: { type: String, required: true },
    merch_name: { type: String, required: true },
    webhook_url: { type: String }, // Webhook URL for payment notifications
  },
  { timestamps: true }
);

export const Merchant = mongoose.model("Merchant", MerchantSchema);
