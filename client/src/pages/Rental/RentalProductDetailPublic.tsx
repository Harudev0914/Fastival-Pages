import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { productApi, orderApi, type RentalProduct } from '../../api/rentalApi';
import { requestTossPayment, genOrderId } from '../../lib/toss';

const won = (n: number) => `₩${Number(n || 0).toLocaleString()}`;
const TEAL = '#2563eb';

const label: React.CSSProperties = { display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#475569', marginBottom: '6px' };
const input: React.CSSProperties = { width: '100%', padding: '11px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.92rem', boxSizing: 'border-box' };

const phoneOk = (v: string) => /^01[016789]-?\d{3,4}-?\d{4}$/.test(v.replace(/\s/g, ''));
const emailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

const RentalProductDetailPublic: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<RentalProduct | null>(null);
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

  useEffect(() => {
    (async () => {
      const { data } = await productApi.get(id!);
      if (data) { setProduct(data); setDays(data.min_days || 1); }
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

  if (loading) return <div style={{ padding: '80px 0', textAlign: 'center', color: '#94a3b8' }}>불러오는 중...</div>;
  if (!product) return <div style={{ padding: '80px 0', textAlign: 'center', color: '#94a3b8' }}>상품을 찾을 수 없습니다.</div>;

  const maxDays = product.max_days || 365;

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

  return (
    <div className="rental-page">
      <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', marginBottom: '16px', fontSize: '0.9rem' }}>← 뒤로</button>

      <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
        {/* 갤러리 */}
        <div style={{ flex: '1 1 360px', minWidth: '300px' }}>
          <div style={{ width: '100%', aspectRatio: '1/1', borderRadius: '16px', overflow: 'hidden', background: '#f1f5f9' }}>
            {gallery[activeImg] ? <img src={gallery[activeImg]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : null}
          </div>
          {gallery.length > 1 && (
            <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
              {gallery.map((g, i) => (
                <button key={i} onClick={() => setActiveImg(i)} style={{ width: '64px', height: '64px', borderRadius: '8px', overflow: 'hidden', border: i === activeImg ? `2px solid ${TEAL}` : '1px solid #e2e8f0', padding: 0, cursor: 'pointer' }}>
                  <img src={g} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 정보 + 예약 폼 */}
        <div style={{ flex: '1 1 380px', minWidth: '300px' }}>
          <p style={{ color: TEAL, fontWeight: 700, margin: 0 }}>{product.rental_brands?.name || ''}</p>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1e293b', margin: '6px 0 2px' }}>{product.name}</h1>

          {/* 제품 설명 — 제목 바로 아래 */}
          {product.description && (
            <div style={{ color: '#475569', lineHeight: 1.5, fontSize: '0.9rem', margin: '0 0 16px' }} dangerouslySetInnerHTML={{ __html: product.description }} />
          )}

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1e293b' }}>{won(product.daily_price)}</span>
            <span style={{ color: '#94a3b8' }}>/ 일</span>
          </div>
          <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '20px' }}>
            보증금 {won(product.deposit)} · 배송/설치비 {won(product.delivery_fee)} · 재고 {product.stock}개
          </div>

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
        </div>
      </div>
    </div>
  );
};

export default RentalProductDetailPublic;
