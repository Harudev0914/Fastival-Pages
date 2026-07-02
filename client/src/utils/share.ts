import { toast } from './toast';

// 공유 동작 분기
//  · PC(데스크톱): URL 을 클립보드에 복사
//  · 모바일/태블릿(Android·iOS·iPadOS): OS 네이티브 공유 시트 호출

export function isMobileOrTablet(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  // iPadOS 13+ 는 UA 를 Macintosh 로 보고하므로 터치포인트로 태블릿 판별
  const iPadOS = navigator.maxTouchPoints > 1 && /Macintosh/.test(ua);
  return /Android|iPhone|iPad|iPod|Windows Phone|webOS|BlackBerry|Opera Mini|IEMobile|Mobile/i.test(ua) || iPadOS;
}

/** 모바일/태블릿이면 시스템 공유, 아니면 클립보드 복사(실패 시 프롬프트 폴백) */
export async function shareOrCopy(opts: { title?: string; text?: string; url?: string } = {}): Promise<void> {
  const url = opts.url || window.location.href;

  if (isMobileOrTablet() && typeof navigator !== 'undefined' && !!navigator.share) {
    try {
      await navigator.share({ title: opts.title, text: opts.text, url });
    } catch {
      /* 사용자가 공유를 취소한 경우 등은 무시 */
    }
    return;
  }

  // PC: 클립보드 복사 → 하단 정중앙 토스트 안내
  try {
    await navigator.clipboard.writeText(url);
    toast('링크가 복사되었습니다.');
  } catch {
    // 클립보드 API 미지원/차단 시 수동 복사 폴백
    window.prompt('아래 링크를 복사하세요', url);
  }
}
