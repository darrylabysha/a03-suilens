import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { cors } from "@elysiajs/cors";
import { startConsumer } from "./consumer";

// 1. Tambahkan export agar bisa di-import oleh consumer.ts
export const app = new Elysia()
  .use(cors())
  .use(swagger({ path: "/docs" }))
  // 2. Tambahkan konfigurasi WebSocket
  .ws("/ws", {
    open(ws) {
      ws.subscribe("notifications"); // Membuat client mendengarkan topik 'notifications'
      console.log("Client connected and subscribed to notifications");
    },
    close(ws) {
      ws.unsubscribe("notifications");
      console.log("Client disconnected");
    }
  })
  .get("/health", () => ({ status: "ok", service: "notification-service" }))
  .listen(3003);

startConsumer().catch(console.error);
console.log(`Notification Service running on port ${app.server?.port}`);