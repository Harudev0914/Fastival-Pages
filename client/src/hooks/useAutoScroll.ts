import { useEffect, useRef } from 'react';

export const useAutoScroll = (dependencies: any[], threshold = 100) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  // 컴포넌트가 마운트된 후 첫 자동 스크롤을 방지하기 위한 flag
  const isFirstRender = useRef(true);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // MutationObserver를 사용하여 콘텐츠 변경 시 스크롤
    const observer = new MutationObserver(() => {
      // 첫 렌더링 이후에만 동작하도록 제한
      if (isFirstRender.current) {
        isFirstRender.current = false;
        return;
      }
      scrollToBottom();
    });

    observer.observe(container, { childList: true, subtree: true, characterData: true });

    const scrollToBottom = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const distanceToBottom = scrollHeight - (scrollTop + clientHeight);

      if (distanceToBottom <= threshold) {
        requestAnimationFrame(() => {
            bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
        });
      }
    };

    return () => observer.disconnect();
  }, [dependencies, threshold]);

  return { containerRef, bottomRef };
};
