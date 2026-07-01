import { defineConfig, type Plugin, type Connect } from 'vite'
import react from '@vitejs/plugin-react'

// 보안 헤더 (clickjacking·sniffing·정보노출 방지 + HTTPS 강제 + CSP)
const SECURITY_HEADERS: Record<string, string> = {
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  'X-Frame-Options': 'SAMEORIGIN',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(self "https://js.tosspayments.com")',
  'X-DNS-Prefetch-Control': 'off',
  'Content-Security-Policy': [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'self'",
    "img-src 'self' data: blob: https:",
    "media-src 'self' https:",
    "font-src 'self' https: data:",
    "style-src 'self' 'unsafe-inline' https:",
    "script-src 'self' 'unsafe-inline' https://js.tosspayments.com",
    "connect-src 'self' https: wss:",
    "frame-src 'self' https://*.tosspayments.com",
  ].join('; '),
}

const applyHeaders: Connect.NextHandleFunction = (_req, res, next) => {
  for (const [k, v] of Object.entries(SECURITY_HEADERS)) res.setHeader(k, v)
  res.removeHeader('X-Powered-By')
  next()
}

// preview(운영) + dev 서버 모두에 보안 헤더 적용
const securityHeaders = (): Plugin => ({
  name: 'security-headers',
  configurePreviewServer(server) { server.middlewares.use(applyHeaders) },
  configureServer(server) { server.middlewares.use(applyHeaders) },
})

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), securityHeaders()],
  // 프로덕션 정적 서빙(vite preview) — 클라우드 도메인/프록시 뒤에서도 접근 허용
  // PORT 환경변수(Cloudtype 등)가 있으면 사용, 없으면 3000 (OS 무관)
  preview: {
    host: true,
    port: Number(process.env.PORT) || 3000,
    allowedHosts: true,
  },
})
