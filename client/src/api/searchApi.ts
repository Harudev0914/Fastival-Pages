// 통합 검색: 시공(포트폴리오/카테고리) + 렌탈(브랜드/상품/카테고리)
import { supabase } from '../supabaseClient';

export type SearchChannel = 'construction' | 'rental' | 'dj';

export interface SearchHit {
  kind: 'brand' | 'product' | 'portfolio' | 'category';
  channel: SearchChannel;
  id: number;
  title: string;
  meta?: string;
  image?: string | null;
  to: string;            // 클릭 시 이동 경로
  typeLabel: string;     // 우측 라벨 (브랜드/상품/시공 사례/카테고리)
}

const won = (n: number) => `₩${Number(n || 0).toLocaleString()}`;

export async function searchAll(q: string): Promise<SearchHit[]> {
  const term = q.trim();
  if (!term) return [];
  const like = `%${term}%`;

  const [brands, products, portfolios, rentalCats, conCats] = await Promise.all([
    supabase.from('rental_brands').select('id, name, logo_url').eq('is_active', true).ilike('name', like).limit(5),
    supabase.from('rental_products').select('id, name, daily_price, thumbnail_url, rental_brands(name)').eq('is_active', true).ilike('name', like).limit(8),
    supabase.from('construction_portfolio').select('id, title, thumbnail_url, link_url, construction_categories(name)').eq('is_active', true).ilike('title', like).limit(8),
    supabase.from('rental_categories').select('id, name').eq('is_active', true).ilike('name', like).limit(5),
    supabase.from('construction_categories').select('id, name').eq('is_active', true).ilike('name', like).limit(5),
  ]);

  const hits: SearchHit[] = [];

  (brands.data || []).forEach((b: any) => hits.push({
    kind: 'brand', channel: 'rental', id: b.id, title: b.name,
    meta: '렌탈 브랜드', image: b.logo_url, to: '/rental', typeLabel: '브랜드',
  }));

  (products.data || []).forEach((p: any) => hits.push({
    kind: 'product', channel: 'rental', id: p.id, title: p.name,
    meta: `${p.rental_brands?.name ? p.rental_brands.name + ' · ' : ''}일 ${won(p.daily_price)}`,
    image: p.thumbnail_url, to: `/rental/product/${p.id}`, typeLabel: '렌탈 상품',
  }));

  (portfolios.data || []).forEach((p: any) => hits.push({
    kind: 'portfolio', channel: 'construction', id: p.id, title: p.title,
    meta: p.construction_categories?.name || '시공 사례',
    image: p.thumbnail_url, to: p.link_url || '/portfolio', typeLabel: '시공 사례',
  }));

  (conCats.data || []).forEach((c: any) => hits.push({
    kind: 'category', channel: 'construction', id: c.id, title: c.name,
    meta: '시공 카테고리', to: '/portfolio', typeLabel: '카테고리',
  }));

  (rentalCats.data || []).forEach((c: any) => hits.push({
    kind: 'category', channel: 'rental', id: c.id, title: c.name,
    meta: '렌탈 카테고리', to: '/rental/best', typeLabel: '카테고리',
  }));

  return hits;
}
