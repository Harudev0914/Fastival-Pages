
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './fonts.css'
import App from './App.tsx'

// HTTPS 강제: 운영 도메인에서 http 접속 시 https로 리다이렉트 (localhost 제외)
if (typeof window !== 'undefined'
  && window.location.protocol === 'http:'
  && !['localhost', '127.0.0.1'].includes(window.location.hostname)) {
  window.location.replace('https://' + window.location.host + window.location.pathname + window.location.search + window.location.hash);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
