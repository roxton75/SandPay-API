# SandPay API – Sandbox Payment Gateway

SandPay is a **sandbox (fake) payment gateway API** built for developers to **integrate and test payment flows** without real money, banks, or third-party costs.

It simulates real payment gateways like Razorpay / Stripe for **development and learning purposes only**.

---

## 🚀 What SandPay Does (in simple words)

* Merchants log in
* Merchants create orders
* A QR code is generated
* User scans QR (via app)
* Payment is confirmed
* Merchant gets instant update (real-time + webhook)

No real payments are involved.

---

## 🛠 Tech Stack

* Node.js + TypeScript
* Fastify
* MongoDB Atlas
* JWT Authentication
* Socket.IO (real-time)
* QR Code generation

---

## 🔐 Authentication (Merchant Login)

### Login Merchant

Merchants must log in to get a **JWT token**.

**POST**

```
/merchant/login
```

**Request Body**

```json
{
  "merch_id": "MERCH_001",
  "merch_pass": "secret123"
}
```

**Response**

```json
{
  "success": true,
  "token": "JWT_TOKEN"
}
```

👉 Save this token. It is required for protected APIs.

---

## 📦 Create Order (Protected)

Creates a new payment order.
Only logged-in merchants can do this.

**POST**

```
/create-order
```

**Headers**

```
Authorization: Bearer JWT_TOKEN
```

**Request Body**

```json
{
  "items": [
    { "name": "Coffee", "quantity": 1, "price": 150 }
  ],
  "total_amount": 150
}
```

**Response**

```json
{
  "order_id": "ORD_1719xxxx",
  "status": "created",
  "expiresAt": "ISO_DATE"
}
```

---

## 🔳 Generate QR Code

Generates a QR code for a specific order.

**GET**

```
/order/qr/:order_id
```

**Response**

```json
{
  "order_id": "ORD_1719xxxx",
  "qr": "data:image/png;base64,..."
}
```

👉 Display this QR on the merchant website.

---

## 💰 Confirm Payment

Simulates a successful payment.
This API is usually called by the **user mobile app after scanning QR**.

**POST**

```
/payment/confirm
```

**Request Body**

```json
{
  "order_id": "ORD_1719xxxx"
}
```

**Response**

```json
{
  "success": true,
  "message": "Payment successful",
  "order": {
    "status": "paid"
  }
}
```

---

## ⚡ Real-Time Payment Updates (Socket.IO)

Merchants receive **instant updates** when payment succeeds.

### Flow

1. Merchant joins socket room using `order_id`
2. On payment success, backend emits event

### Event Emitted

```
payment-success
```

**Payload**

```json
{
  "order_id": "ORD_1719xxxx",
  "status": "paid"
}
```

---

## 🔔 Webhooks (Server-to-Server Notification)

If a merchant has a `webhook_url` set, SandPay will notify it automatically on payment success.

### Webhook Payload

```json
{
  "event": "payment.success",
  "order_id": "ORD_1719xxxx",
  "amount": 150,
  "status": "paid",
  "timestamp": "ISO_DATE"
}
```

Webhooks are **best-effort** and do not affect payment success.

---

## ⏱ Order Expiry

* Orders expire automatically after a fixed time
* Expired orders:

  * Cannot generate QR
  * Cannot be paid
* MongoDB TTL auto-cleans expired orders

---

## ❌ Error Responses (Common)

```json
{ "error": "Invalid credentials" }
```

```json
{ "error": "Order not found" }
```

```json
{ "error": "Order expired" }
```

```json
{ "error": "Authorization header missing" }
```

---

## ⚠️ Important Disclaimer

SandPay is a **sandbox / fake payment gateway**.

* No real money involved
* No real cards, UPI, or banks
* For development & testing only

---

## 📄 License
 [MIT](LICENSE)
