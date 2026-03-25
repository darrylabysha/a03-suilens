import { Elysia } from "elysia";
import { startConsumer } from "./consumer";
import { swagger } from "@elysiajs/swagger";
import { cors } from "@elysiajs/cors";

const app = new Elysia()
  .use(cors())
  .use(
    swagger({
      path: "/docs",
      documentation: {
        info: {
          title: "SuiLens Notification Service API",
          version: "1.0.0",
        },
      },
    })
  )
  .get("/health", () => ({ status: "ok", service: "notification-service" }))
  // MENDAPATKAN SEMUA NOTIFIKASI YANG ADA (Untuk inisialisasi awal)
  .get("/api/notifications", async () => {
      // Karena kita hanya butuh WS untuk notifikasi real-time sesuai instruksi,
      // kita biarkan endpoint REST ini ada jika nanti dibutuhkan.
      return { message: "Gunakan WebSocket di /ws untuk notifikasi" };
  })
  // IMPLEMENTASI WEBSOCKET
  .ws("/ws", {
    open(ws) {
      console.log("Client connected via WebSocket");
    },
    message(ws, message) {
      console.log("Received message:", message);
    },
    close(ws) {
      console.log("Client disconnected");
    },
  })
  .listen(3003);

// Fungsi untuk menyiarkan (broadcast) pesan ke semua client WS yang terhubung
export const broadcastNotification = (notificationData: any) => {
  // Mengecek apakah ada client yang terhubung ke topic "notifications" (secara default Elysia WS mem-publish ke seluruh koneksi aktif jika tidak di-specify room-nya)
  app.server?.publish("notifications", JSON.stringify(notificationData));
};

// Modifikasi cara WebSocket subscribe ke channel
app.ws('/ws', {
    open(ws) {
        ws.subscribe('notifications'); // Memasukkan setiap client baru ke room "notifications"
        console.log("Client subscribed to notifications");
    }
});

startConsumer().catch(console.error);

console.log(`Notification Service running on port ${app.server?.port}`);