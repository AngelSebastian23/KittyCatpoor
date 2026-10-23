import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    // Proxy API requests to the server running on port 4242.
    //proxy: {
    //   "/create-checkout-session": "http://localhost:4242",
    //   "/session-status": "http://localhost:4242",
    //   "/create.php": "http://localhost:4242",
    //   "/status.php": "http://localhost:4242",
    // },
  },
});