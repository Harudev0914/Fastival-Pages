import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // 프로덕션 정적 서빙(vite preview) — 클라우드 도메인/프록시 뒤에서도 접근 허용
  preview: {
    host: true,
    port: 3000,
    allowedHosts: true,
  },
})
