<template>
  <v-container class="py-8" max-width="800">
    <v-card>
      <v-card-title>Live Order Notifications</v-card-title>
      <v-divider></v-divider>

      <v-card-text class="py-6" style="min-height: 500px">
        <div
          v-if="notifications.length === 0"
          class="text-center text-grey py-8"
        >
          <p class="text-sm">No notifications yet</p>
        </div>

        <div v-else>
          <div
            v-for="(notification, index) in notifications"
            :key="index"
            class="mb-4 pb-4"
            :style="
              index < notifications.length - 1
                ? 'border-bottom: 1px solid #eee;'
                : ''
            "
          >
            <p class="text-sm ma-0">
              Order placed for {{ notification.data.lensName }} by
              {{ notification.data.customerName }}
            </p>
            <p class="text-xs text-grey-darken-1 mt-1">
              {{ formatTime(notification.timestamp) }}
            </p>
          </div>
        </div>
      </v-card-text>

      <v-divider v-if="notifications.length > 0"></v-divider>
      <v-card-actions v-if="notifications.length > 0">
        <v-spacer></v-spacer>
        <v-btn size="small" variant="text" @click="clearNotifications">
          Clear
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";

const notifications = ref([]);
const isConnected = ref(false);

// Sesuaikan URL dengan port notification-service kamu (3003)
const WS_URL = "ws://localhost:3003/ws";

let ws = null;

function connectWebSocket() {
  ws = new WebSocket(WS_URL);

  ws.onopen = () => {
    isConnected.value = true;
    console.log("✅ Terhubung ke WebSocket");
  };

  ws.onmessage = (event) => {
    try {
      const payload = JSON.parse(event.data);
      
      // Filter agar hanya event order.placed yang muncul
      if (payload?.event === "order.placed") {
        // Masukkan ke array (data terbaru di atas)
        notifications.value.unshift({
          ...payload,
          timestamp: payload.timestamp || new Date().toISOString()
        });
        
        // Batasi maksimal 10 notifikasi agar tidak penuh
        if (notifications.value.length > 10) notifications.value.pop();
      }
    } catch (e) {
      console.error("Gagal membaca pesan:", e);
    }
  };

  ws.onclose = () => {
    isConnected.value = false;
    console.log("❌ WebSocket terputus");
  };
}

onMounted(() => {
  connectWebSocket();
});

onBeforeUnmount(() => {
  if (ws) ws.close();
});

function formatTime(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function clearNotifications() {
  notifications.value = [];
}
</script>
