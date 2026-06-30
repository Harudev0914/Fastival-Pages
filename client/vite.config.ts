import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // 프로덕션 정적 서빙(vite preview) — 클라우드 도메인/프록시 뒤에서도 접근 허용
  // PORT 환경변수(Cloudtype 등)가 있으면 사용, 없으면 3000 (OS 무관)
  preview: {
    host: true,
    port: Number(process.env.PORT) || 3000,
    allowedHosts: true,
  },
})
