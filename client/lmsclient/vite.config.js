import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
export default defineConfig({
  plugins: [
    tailwindcss(),
 
  ],
     server: {
    open: "/login", // 🚀 This makes Vite open localhost:5173/login
  },
})