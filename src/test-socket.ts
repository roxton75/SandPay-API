import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:3000";
const ORDER_ID = "ORD_1768389446982";

const socket = io(SOCKET_URL);

socket.on("connect", () => {
  console.log("Connected to socket server");

  // Join order room (merchant side)
  socket.emit("join-order", ORDER_ID);
  console.log("Joined order room:", ORDER_ID);
});

socket.on("payment-success", (data) => {
  console.log("🔥 REAL-TIME EVENT RECEIVED:", data);
});
