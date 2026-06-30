import { useEffect } from 'react';

// 페이지별 SEO/OG 메타 적용 (SPA용 동적 head 업데이트)
interface SeoProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  noindex?: boolean;
}

const SITE = 'Klipse 클립스';
const DEFAULT_DESC = '클립스(Klipse) — 카페·바·라운지 등 상업공간 사운드 설계와 인테리어 시공, 음향 장비 렌탈 전문.';
const DEFAULT_IMG = '/Klipse_Logo.png';

function upsertMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) { el = document.createElement('meta'); el.setAttribute(attr, key); document.head.appendChild(el); }
  el.setAttribute('content', content);
}

const Seo: React.FC<SeoProps> = ({ title, description, keywords, image, noindex }) => {
  useEffect(() => {
    const fullTitle = title ? `${title} | ${SITE}` : `${SITE} — 공간 사운드·시공·렌탈`;
    const desc = description || DEFAULT_DESC;
    const img = image || DEFAULT_IMG;
    document.title = fullTitle;
    upsertMeta('name', 'description', desc);
    if (keywords) upsertMeta('name', 'keywords', keywords);
    upsertMeta('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow');
    upsertMeta('property', 'og:site_name', SITE);
    upsertMeta('property', 'og:title', fullTitle);
    upsertMeta('property', 'og:description', desc);
    upsertMeta('property', 'og:image', img);
    upsertMeta('property', 'og:type', 'website');
    upsertMeta('property', 'og:url', window.location.href);
    upsertMeta('name', 'twitter:card', 'summary');
    upsertMeta('name', 'twitter:title', fullTitle);
    upsertMeta('name', 'twitter:description', desc);
    upsertMeta('name', 'twitter:image', img);
  }, [title, description, keywords, image, noindex]);
  return null;
};

export default Seo;
