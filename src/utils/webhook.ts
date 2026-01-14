import axios from "axios";

export const sendWebhook = async (webhookUrl: string, payload: any) => {
  try {
    await axios.post(webhookUrl, payload, {
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 5000, // 5 seconds timeout
    });
  } catch (error) {
    console.error("Webhook failed:", webhookUrl);
  }
};
