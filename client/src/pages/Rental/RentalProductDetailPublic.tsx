import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ShieldCheck, Truck, ChevronRight, Share2, Bookmark } from 'lucide-react';
import { productApi, orderApi, type RentalProduct } from '../../api/rentalApi';
import { mainVisualApi, type MainVisual } from '../../api/mainVisualApi';
import { requestTossPayment, genOrderId } from '../../lib/toss';
import { shareOrCopy } from '../../utils/share';
import './RentalPage.css';

const won = (n: number) => `₩${Number(n || 0).toLocaleString()}`;
const TEAL = '#2563eb';
// 예약 옵션·신청자·동의·결제 요약·신청 버튼 노출 여부 (현재 비노출 — 상품 정보만 표시)
const SHOW_BOOKING = false;

const label: React.CSSProperties = { display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#475569', marginBottom: '6px' };
const input: React.CSSProperties = { width: '100%', padding: '11px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.92rem', boxSizing: 'border-box' };
// 아이콘 액션 버튼(북마크·공유)
const iconBtn = (active: boolean): React.CSSProperties => ({ width: '58px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '3px', padding: '9px 0', border: `1px solid ${active ? TEAL : '#e2e8f0'}`, borderRadius: '12px', background: active ? TEAL : '#fff', color: active ? '#fff' : '#475569', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', flexShrink: 0 });

const phoneOk = (v: string) => /^01[016789]-?\d{3,4}-?\d{4}$/.test(v.replace(/\s/g, ''));
const emailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

const RentalProductDetailPublic: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<RentalProduct | null>(null);
  const [ad, setAd] = useState<MainVisual | null>(null);
  const [recommends, setRecommends] = useState<RentalProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);

  // 렌탈 옵션
  const [startDate, setStartDate] = useState('');
  const [days, setDays] = useState(1);
  const [optIdx, setOptIdx] = useState(-1);
  const [qty, setQty] = useState(1);
  // 고객
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [agree, setAgree] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  // 상세페이지 하단 탭(리뷰/상세/추천) — 스크롤 시 헤더 아래 고정 + 스크롤스파이
  const TABBAR_H = 52;
  const reviewRef = useRef<HTMLDivElement>(null);
  const detailRef = useRef<HTMLDivElement>(null);
  const recommendRef = useRef<HTMLDivElement>(null);
  const [headerH, setHeaderH] = useState(110);
  const [activeTab, setActiveTab] = useState<'review' | 'detail' | 'recommend'>('review');

  // 하단 고정 구매바 — 상단 액션바가 화면 밖으로 올라가면 노출, 푸터 보이면 숨김
  const actionRef = useRef<HTMLDivElement>(null);
  const [showBuyBar, setShowBuyBar] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true); setActiveImg(0);
      // 상품·AD배너·추천목록은 서로 독립 → 병렬 조회(직렬 대비 지연 1/3)
      const [{ data }, { data: mv }, { data: all }] = await Promise.all([
        productApi.get(id!),
        mainVisualApi.listBySection('rental'),   // 렌탈 AD 배너(메인비주얼 관리 · 렌탈 섹션 AD)
        productApi.listActive(),                 // 추천 상품 풀
      ]);
      if (data) { setProduct(data); setDays(data.min_days || 1); }
      setAd((mv || []).find((b) => b.is_ad) || null);
      // 추천 상품 — 같은 브랜드 우선, 나머지 활성 상품으로 채움(현재 상품 제외)
      if (data && all) {
        const others = all.filter((p) => p.id !== data.id);
        const sameBrand = others.filter((p) => p.brand_id && p.brand_id === data.brand_id);
        const rest = others.filter((p) => !(p.brand_id && p.brand_id === data.brand_id));
        setRecommends([...sameBrand, ...rest].slice(0, 10));
      }
      setLoading(false);
    })();
  }, [id]);

  const gallery = useMemo(() => {
    if (!product) return [] as string[];
    const imgs = [product.thumbnail_url, ...(product.images || [])].filter(Boolean) as string[];
    return imgs.length ? Array.from(new Set(imgs)) : [];
  }, [product]);

  const selectedOption = product && optIdx >= 0 ? product.options[optIdx] : null;
  const optionAdd = selectedOption ? Number(selectedOption.add_price) || 0 : 0;

  const total = useMemo(() => {
    if (!product) return 0;
    const perUnit = Number(product.daily_price) * days + optionAdd;
    return perUnit * qty + Number(product.delivery_fee);
  }, [product, days, optionAdd, qty]);

  // 고정 헤더 높이 측정 (탭바 sticky top · 스크롤 오프셋 기준)
  useEffect(() => {
    const measure = () => {
      const h = document.querySelector('.site-header')?.getBoundingClientRect().height;
      if (h) setHeaderH(Math.round(h));
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  // 스크롤스파이 — 현재 보이는 섹션에 맞춰 탭 활성화
  useEffect(() => {
    const onScroll = () => {
      const threshold = headerH + TABBAR_H + 12;
      const secs: [typeof activeTab, HTMLDivElement | null][] = [
        ['review', reviewRef.current], ['detail', detailRef.current], ['recommend', recommendRef.current],
      ];
      let active: typeof activeTab = 'review';
      for (const [key, el] of secs) if (el && el.getBoundingClientRect().top <= threshold) active = key;
      setActiveTab(active);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [headerH]);

  // 하단 고정 구매바 노출 제어 — 상단 액션바가 위로 사라지면 보이고, 푸터가 화면에 들어오면 숨김
  useEffect(() => {
    const onScroll = () => {
      const anchor = actionRef.current;
      const footer = document.querySelector('.site-footer');
      let show = anchor ? anchor.getBoundingClientRect().bottom < 80 : false;
      if (footer && footer.getBoundingClientRect().top < window.innerHeight) show = false;
      setShowBuyBar(show);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    onScroll();
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); };
  }, [product]);

  if (loading) return <div style={{ padding: '80px 0', textAlign: 'center', color: '#94a3b8' }}>불러오는 중...</div>;
  if (!product) return <div style={{ padding: '80px 0', textAlign: 'center', color: '#94a3b8' }}>상품을 찾을 수 없습니다.</div>;

  const maxDays = product.max_days || 365;

  // 가격 표시 (이미지처럼 정가 취소선 → 할인율 + 판매가 → 쿠폰 적용가)
  const listPrice = Number(product.list_price) || 0;
  const couponPrice = Number(product.coupon_price) || 0;
  const hasDiscount = listPrice > Number(product.daily_price);
  const discountPct = hasDiscount ? Math.round(((listPrice - Number(product.daily_price)) / listPrice) * 100) : 0;

  const submit = async () => {
    if (!startDate) return alert('대여 시작일을 선택해주세요.');
    if (days < product.min_days) return alert(`최소 ${product.min_days}일 이상 대여 가능합니다.`);
    if (product.max_days && days > product.max_days) return alert(`최대 ${product.max_days}일까지 대여 가능합니다.`);
    if (product.stock <= 0) return alert('재고가 없습니다.');
    if (!name.trim()) return alert('이름을 입력해주세요.');
    if (!phoneOk(phone)) return alert('연락처를 정확히 입력해주세요.');
    if (email && !emailOk(email)) return alert('이메일 형식을 확인해주세요.');
    if (!agree) return alert('개인정보 수집·이용에 동의해주세요.');

    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(end.getDate() + days);

    setSubmitting(true);
    // 1) 결제 전 'pending' 주문 선생성 (merchant orderId 를 payment_id 에 보관)
    const orderId = genOrderId();
    const { error } = await orderApi.create({
      product_id: product.id,
      product_name: product.name,
      brand_name: product.rental_brands?.name || null,
      option_name: selectedOption ? selectedOption.name : null,
      customer_name: name.trim(),
      customer_phone: phone.trim(),
      customer_email: email.trim() || null,
      rental_start: start.toISOString(),
      rental_days: days,
      rental_end: end.toISOString(),
      quantity: qty,
      daily_price: Number(product.daily_price),
      deposit: Number(product.deposit),
      delivery_fee: Number(product.delivery_fee),
      total_amount: total,
      payment_status: 'pending',
      payment_method: 'toss',
      payment_id: orderId,
      order_status: 'reserved',
    });
    if (error) { setSubmitting(false); return alert(`주문 생성 오류: ${error}`); }

    // 2) 토스 결제창 호출 → 성공 시 /rental/payment/success 로 리다이렉트(서버 승인)
    try {
      await requestTossPayment({
        orderId,
        orderName: qty > 1 ? `${product.name} 외 ${qty - 1}건` : product.name,
        amount: total,
        customerName: name.trim(),
        customerEmail: email.trim(),
        customerMobilePhone: phone.trim(),
      });
    } catch (e: any) {
      setSubmitting(false);
      if (e?.code !== 'USER_CANCEL') alert(`결제를 시작할 수 없습니다: ${e?.message || e}`);
    }
  };

  // 탭 클릭 → 해당 섹션으로 (고정 헤더+탭바 높이만큼 오프셋)
  const scrollToSec = (key: 'review' | 'detail' | 'recommend') => {
    const el = { review: reviewRef, detail: detailRef, recommend: recommendRef }[key].current;
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - headerH - TABBAR_H + 1;
    window.scrollTo({ top: y, behavior: 'smooth' });
  };

  // 하단 탭 구성 — 내용 없는 섹션(상세/추천)은 숨김, 리뷰는 항상 노출(빈 상태 안내)
  const hasDetail = !!(product.detail_html && product.detail_html.trim());
  const tabs = ([
    { key: 'review' as const, label: '리뷰 0', show: true },
    { key: 'detail' as const, label: '상세', show: hasDetail },
    { key: 'recommend' as const, label: '추천', show: recommends.length > 0 },
  ]).filter((t) => t.show);

  // PC: 클립보드 복사 / 모바일·태블릿: 시스템 공유 시트
  const shareProduct = () => shareOrCopy({ title: product.name });

  return (
    <div className="rental-page">
      <div className="rpd-cols">
        {/* 갤러리 */}
        <div className="rpd-gallery">
          <div style={{ width: '100%', aspectRatio: '1/1', borderRadius: '16px', overflow: 'hidden', background: '#f1f5f9' }}>
            {gallery[activeImg] ? <img src={gallery[activeImg]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : null}
          </div>
          {gallery.length > 1 && (
            <div className="rv-thumbs">
              {gallery.map((g, i) => (
                <button key={i} onClick={() => setActiveImg(i)} style={{ flex: '0 0 64px', width: '64px', height: '64px', borderRadius: '8px', overflow: 'hidden', border: i === activeImg ? `2px solid ${TEAL}` : '1px solid #e2e8f0', padding: 0, cursor: 'pointer', background: '#f1f5f9' }}>
                  <img src={g} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 정보 + 예약 폼 */}
        <div className="rpd-info">
          {/* 가격 — 금액 없으면 "- / 재고 없음", 있으면 정가(취소선) → 할인율 + 판매가 → 쿠폰 적용가 */}
          {Number(product.daily_price) > 0 ? (<>
            {hasDiscount && (
              <div style={{ fontSize: '0.95rem', color: '#94a3b8', textDecoration: 'line-through', marginBottom: '2px' }}>{won(listPrice)}</div>
            )}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', flexWrap: 'wrap', marginBottom: couponPrice > 0 ? '4px' : '10px' }}>
              {hasDiscount && <span style={{ fontSize: '1.7rem', fontWeight: 800, color: '#ef4444' }}>{discountPct}%</span>}
              <span style={{ fontSize: '1.7rem', fontWeight: 800, color: '#1e293b' }}>{won(product.daily_price)}</span>
              <span style={{ color: '#94a3b8', fontSize: '0.95rem' }}>/ 일</span>
            </div>
            {couponPrice > 0 && (
              <div style={{ fontSize: '0.9rem', color: TEAL, fontWeight: 700, marginBottom: '10px' }}>쿠폰 적용가 {won(couponPrice)} / 일</div>
            )}
          </>) : (
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }}>
              <span style={{ fontSize: '1.7rem', fontWeight: 800, color: '#94a3b8' }}>-</span>
              <span style={{ color: '#94a3b8', fontSize: '0.95rem' }}>/ 재고 없음</span>
            </div>
          )}

          {/* 상품명 — 모바일에서 작게(clamp) */}
          <h1 style={{ fontSize: 'clamp(1.05rem, 4.5vw, 1.4rem)', fontWeight: 800, color: '#1e293b', margin: '2px 0 4px', lineHeight: 1.3 }}>{product.name}</h1>

          {/* 영문 부제 등 설명 — 상품명 바로 아래 */}
          {product.description && (
            <div style={{ color: '#475569', lineHeight: 1.5, fontSize: '0.9rem', margin: '0 0 10px' }} dangerouslySetInnerHTML={{ __html: product.description }} />
          )}

          {/* 카테고리 태그 (브랜드 · 카테고리) — 브랜드 클릭 시 해당 브랜드 상세로 이동 */}
          {(product.rental_brands?.name || product.rental_categories?.name) && (
            <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '12px' }}>
              {product.rental_brands?.name && product.brand_id && (
                <span
                  role="button"
                  tabIndex={0}
                  onClick={() => navigate(`/rental/brands?brand=${product.brand_id}`)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate(`/rental/brands?brand=${product.brand_id}`); } }}
                  style={{ color: '#121212', fontWeight: 700, cursor: 'pointer' }}
                >
                  {product.rental_brands.name}
                </span>
              )}
              {product.rental_brands?.name && product.rental_categories?.name && ' · '}
              {product.rental_categories?.name}
            </div>
          )}

          {/* 정보 안내 행 (정품보증 · 배송) — 정품보증만 좌우 밝은 회색→가운데 흰색 그라데이션 카드, 배송은 흰색 */}
          <div style={{ border: '1px solid #eef2f6', borderRadius: '12px', overflow: 'hidden', marginBottom: '18px', boxShadow: '0 1px 3px rgba(15,23,42,0.06)' }}>
            {[
              { icon: <ShieldCheck size={16} color="#2563eb" />, text: <><b style={{ color: '#1e293b' }}>100% 정품 보증</b> · 전문가 책임 검수 · 가품 3배 보상</>, bg: 'linear-gradient(90deg, #eef2f6 0%, #ffffff 50%, #eef2f6 100%)' },
              { icon: <Truck size={16} color="#64748b" />, text: <>일반배송 {Number(product.delivery_fee) > 0 ? won(product.delivery_fee) : '무료'} · 5~7일 내 도착 예정</>, bg: '#fff' },
            ].map((r, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '13px 16px', borderTop: i ? '1px solid #f1f5f9' : 'none', fontSize: '0.86rem', color: '#475569', background: r.bg }}>
                {r.icon}
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.text}</span>
                <ChevronRight size={16} color="#cbd5e1" />
              </div>
            ))}
          </div>

          {/* 렌탈 AD 배너 (메인비주얼 관리 · 렌탈 AD) */}
          {ad && (ad.image_url || ad.title) && (
            <div
              onClick={() => { if (ad.link_url) { if (/^https?:\/\//.test(ad.link_url)) window.open(ad.link_url, '_blank', 'noopener'); else navigate(ad.link_url); } }}
              style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid #eef2f6', borderRadius: '12px', padding: '12px 14px', marginBottom: '18px', cursor: ad.link_url ? 'pointer' : 'default', background: '#fff' }}
            >
              {(ad.image_mobile_url || ad.image_url) && (
                <img src={ad.image_mobile_url || ad.image_url || ''} alt={ad.title} style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: '10px', flexShrink: 0, background: '#f1f5f9' }} />
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontWeight: 700, color: '#1e293b', fontSize: '0.92rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ad.title}</p>
                {ad.subtitle && <p style={{ margin: '3px 0 0', color: '#64748b', fontSize: '0.82rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ad.subtitle}</p>}
              </div>
              <span style={{ position: 'absolute', top: '8px', right: '10px', fontSize: '0.68rem', color: '#94a3b8', fontWeight: 700 }}>AD</span>
            </div>
          )}

          {/* 액션 바 — 북마크 · 공유 아이콘 + 구매하기(파란색) */}
          <div ref={actionRef} style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
            <button onClick={() => setBookmarked((v) => !v)} title="북마크" style={iconBtn(bookmarked)}>
              <Bookmark size={20} fill={bookmarked ? '#fff' : 'none'} /> 북마크
            </button>
            <button onClick={shareProduct} title="공유" style={iconBtn(false)}>
              <Share2 size={20} /> 공유
            </button>
            <button
              onClick={() => navigate('/signup')}
              style={{ padding: '0 16px', background: '#fff', color: TEAL, border: `1px solid ${TEAL}`, borderRadius: '12px', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}
            >
              판매하기
            </button>
            <button
              onClick={() => navigate('/signup')}
              disabled={submitting}
              style={{ flex: 1, background: TEAL, color: '#fff', border: 'none', borderRadius: '12px', fontSize: '1.05rem', fontWeight: 800, cursor: 'pointer', opacity: submitting ? 0.6 : 1 }}
            >
              구매하기
            </button>
          </div>

          {SHOW_BOOKING && (<>
          {/* 예약 옵션 */}
          <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '18px', marginBottom: '18px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <div>
                <label style={label}>대여 시작일</label>
                <input type="date" style={input} value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div>
                <label style={label}>대여 일수 ({product.min_days}~{product.max_days || '무제한'})</label>
                <input type="number" min={product.min_days} max={maxDays} style={input} value={days} onChange={(e) => setDays(Math.max(product.min_days, Number(e.target.value) || product.min_days))} />
              </div>
            </div>
            {product.options.length > 0 && (
              <div style={{ marginBottom: '12px' }}>
                <label style={label}>옵션 선택</label>
                <select style={input} value={optIdx} onChange={(e) => setOptIdx(Number(e.target.value))}>
                  <option value={-1}>선택 안 함</option>
                  {product.options.map((o, i) => <option key={i} value={i}>{o.name}{o.add_price ? ` (+${won(o.add_price)})` : ''}</option>)}
                </select>
              </div>
            )}
            <div>
              <label style={label}>수량</label>
              <input type="number" min={1} style={input} value={qty} onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))} />
            </div>
          </div>

          {/* 신청자 */}
          <div style={{ display: 'grid', gap: '12px', marginBottom: '14px' }}>
            <div><label style={label}>이름 *</label><input style={input} value={name} onChange={(e) => setName(e.target.value)} /></div>
            <div><label style={label}>연락처 *</label><input style={input} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="010-0000-0000" /></div>
            <div><label style={label}>이메일</label><input style={input} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="선택" /></div>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#475569', marginBottom: '18px', cursor: 'pointer' }}>
            <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} /> 개인정보 수집·이용에 동의합니다 (필수)
          </label>

          {/* 결제 요약 */}
          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: '#64748b', marginBottom: '6px' }}>
              <span>일일 단가 × {days}일 {qty > 1 ? `× ${qty}개` : ''}{optionAdd ? ' + 옵션' : ''}</span>
              <span>{won(Number(product.daily_price) * days * qty + optionAdd * qty)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: '#64748b', marginBottom: '6px' }}>
              <span>배송/설치비</span><span>{won(product.delivery_fee)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: '#94a3b8', marginBottom: '10px' }}>
              <span>보증금 (반환)</span><span>{won(product.deposit * qty)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontWeight: 700, color: '#1e293b' }}>결제 예정액</span>
              <span style={{ fontSize: '1.4rem', fontWeight: 800, color: TEAL }}>{won(total)}</span>
            </div>
          </div>

          <button onClick={submit} disabled={submitting} style={{ width: '100%', background: TEAL, color: '#fff', border: 'none', borderRadius: '10px', padding: '15px', fontSize: '1rem', fontWeight: 700, cursor: 'pointer', opacity: submitting ? 0.6 : 1 }}>
            {submitting ? '처리 중...' : '렌탈 신청하기'}
          </button>
          </>)}
        </div>
      </div>

      {/* 하단 탭 (리뷰 · 상세 · 추천) — 스크롤 시 헤더 아래 고정 */}
      <nav className="rpd-tabs" style={{ top: headerH }}>
        {tabs.map((t) => (
          <button key={t.key} type="button" className={`rpd-tab ${activeTab === t.key ? 'on' : ''}`} onClick={() => scrollToSec(t.key)}>
            {t.label}
          </button>
        ))}
      </nav>

      {/* 리뷰 — 등록된 리뷰가 없으면 빈 상태 안내 */}
      <div className="rpd-sec" ref={reviewRef}>
        <div className="rpd-sec__head">
          <div>
            <span className="rpd-sec__title">리뷰</span>
            <span className="rpd-sec__muted">등록된 리뷰 없음</span>
          </div>
          <button type="button" className="rpd-sec__action" onClick={() => navigate('/signup')}>+ 리뷰 올리기</button>
        </div>
      </div>

      {/* 상세 — 어드민 HTML 에디터로 작성한 상품 상세 본문 (없으면 탭·섹션 숨김) */}
      {hasDetail && (
        <div className="rpd-sec" ref={detailRef}>
          <div className="rpd-sec__head"><span className="rpd-sec__title">상세</span></div>
          <div className="rpd-detail" dangerouslySetInnerHTML={{ __html: product.detail_html || '' }} />
        </div>
      )}

      {/* 함께 보면 좋은 상품 (크림·무신사 스타일 추천 그리드) */}
      {recommends.length > 0 && (
        <div className="rpd-sec" ref={recommendRef}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1e293b', marginBottom: '16px' }}>추천 상품</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '18px 14px' }}>
            {recommends.map((p) => {
              const lp = Number(p.list_price) || 0;
              const disc = lp > Number(p.daily_price) ? Math.round(((lp - Number(p.daily_price)) / lp) * 100) : 0;
              return (
                <div key={p.id} onClick={() => navigate(`/rental/product/${p.id}`)} style={{ cursor: 'pointer' }}>
                  <div style={{ width: '100%', aspectRatio: '1/1', borderRadius: '10px', overflow: 'hidden', background: '#f1f5f9', marginBottom: '8px' }}>
                    {p.thumbnail_url && <img src={p.thumbnail_url} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                  </div>
                  {p.rental_brands?.name && <div style={{ fontSize: '0.76rem', fontWeight: 700, color: '#1e293b', marginBottom: '2px' }}>{p.rental_brands.name}</div>}
                  <div style={{ fontSize: '0.82rem', color: '#475569', lineHeight: 1.35, marginBottom: '6px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{p.name}</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '5px', flexWrap: 'wrap' }}>
                    {Number(p.daily_price) > 0 ? (<>
                      {disc > 0 && <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#ef4444' }}>{disc}%</span>}
                      <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#1e293b' }}>{won(p.daily_price)}</span>
                      <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>/ 일</span>
                    </>) : (
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#94a3b8' }}>재고 없음</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 하단 고정 구매바 (PC·태블릿·모바일) — 상단 액션바가 사라지면 노출, 푸터 전까지 유지 */}
      <div className={`rpd-buybar ${showBuyBar ? 'on' : ''}`}>
        {gallery[0] && <img className="rpd-buybar__thumb" src={gallery[0]} alt="" />}
        <div className="rpd-buybar__info">
          <div className="rpd-buybar__name">{product.name}</div>
          <div className="rpd-buybar__price">
            {Number(product.daily_price) > 0 ? (<>
              {hasDiscount && <span className="pct">{discountPct}%</span>}
              {won(product.daily_price)}<span className="per"> / 일</span>
            </>) : (
              <span className="soldout">재고 없음</span>
            )}
          </div>
        </div>
        <div className="rpd-buybar__actions">
          <button className="rpd-buybar__mark" onClick={() => setBookmarked((v) => !v)} title="북마크" aria-label="북마크">
            <Bookmark size={20} fill={bookmarked ? TEAL : 'none'} color={bookmarked ? TEAL : '#475569'} />
          </button>
          <button className="rpd-buybar__buy" onClick={() => navigate('/signup')}>구매하기</button>
        </div>
      </div>
    </div>
  );
};

export default RentalProductDetailPublic;
