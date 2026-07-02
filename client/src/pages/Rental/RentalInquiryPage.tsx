import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { HelpCircle } from 'lucide-react';
import { productApi, rentalCategoryApi, purchaseApi, GRADES, type Grade, type RentalProduct } from '../../api/rentalApi';
import { supabase } from '../../supabaseClient';
import ImageUploader from '../../components/UI/ImageUploader';
import Seo from '../../components/Seo';

const won = (n: number) => `₩${Number(n || 0).toLocaleString()}`;
const TEAL = '#2563eb';
const label: React.CSSProperties = { display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '7px' };

const GRADE_DESC: Record<Grade, string> = {
  'C': '사용감 많음 / 일부 손상', 'B': '사용감 있음 / 정상 작동', 'A': '양호 / 생활기스',
  'A+': '우수 / 거의 새것', 'A++': '미개봉급 / 최상',
};

// 신청 회원 정보 (계정에서 자동 수집 → 어드민 노출)
interface Applicant { name: string; phone: string; email: string; userId: string; }

const RentalInquiryPage: React.FC = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const productId = params.get('product');

  const [authState, setAuthState] = useState<'loading' | 'in' | 'out'>('loading');
  const [applicant, setApplicant] = useState<Applicant | null>(null);
  const [product, setProduct] = useState<RentalProduct | null>(null);
  const [cats, setCats] = useState<{ parent: string | null; child: string | null }>({ parent: null, child: null });
  const [loading, setLoading] = useState(true);

  const [grade, setGrade] = useState<Grade>('A');
  const [price, setPrice] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [agree, setAgree] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    (async () => {
      // 1) 로그인 확인 — 회원만 판매 신청 가능
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setAuthState('out'); setLoading(false); return; }
      setAuthState('in');
      setApplicant({
        name: user.user_metadata?.name || '',
        phone: user.user_metadata?.phone || '',
        email: user.email || '',
        userId: user.id,
      });

      // 2) 대상 상품 조회 + 카테고리(1차/2차) 자동 해석
      if (productId) {
        const { data: p } = await productApi.get(productId);
        if (p) {
          setProduct(p);
          if (p.category_id) {
            const { data: cat } = await rentalCategoryApi.get(p.category_id);
            if (cat) {
              if (cat.parent_id) {
                const { data: parent } = await rentalCategoryApi.get(cat.parent_id);
                setCats({ parent: parent?.name || null, child: cat.name });  // 상위=1차, 현재=2차
              } else {
                setCats({ parent: cat.name, child: null });                  // 최상위=1차
              }
            }
          }
        }
      }
      setLoading(false);
    })();
  }, [productId]);

  const gallery = useMemo(() => {
    if (!product) return [] as string[];
    return [product.thumbnail_url, ...(product.images || [])].filter(Boolean) as string[];
  }, [product]);

  const submit = async () => {
    if (!applicant) return;
    if (!product) return alert('판매할 상품 정보를 불러오지 못했습니다.');
    if (!price || Number(price) <= 0) return alert('판매 희망가를 입력해주세요.');
    if (!agree) return alert('개인정보 수집·이용에 동의해주세요.');

    setSubmitting(true);
    const { error } = await purchaseApi.create({
      product_id: product.id,
      product_name: product.name,
      brand_name: product.rental_brands?.name || null,
      parent_category_name: cats.parent,
      category_name: cats.child,
      condition_grade: grade,
      desired_price: Number(price),
      images,
      applicant_name: applicant.name || null,
      applicant_phone: applicant.phone || null,
      applicant_email: applicant.email || null,
      owner_user_id: applicant.userId,
      status: 'pending',
    });
    setSubmitting(false);
    if (error) return alert(`접수 중 오류가 발생했습니다: ${error}`);
    setDone(true);
  };

  if (loading) return <div style={{ padding: '80px 20px', textAlign: 'center', color: '#94a3b8' }}>불러오는 중…</div>;

  // 비회원 — 로그인 유도
  if (authState === 'out') {
    return (
      <div style={{ maxWidth: '520px', margin: '80px auto', textAlign: 'center', padding: '0 20px' }}>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a' }}>로그인이 필요합니다</h2>
        <p style={{ color: '#64748b', marginTop: '10px', lineHeight: 1.6 }}>상품 판매 신청은 회원만 이용할 수 있습니다.<br />로그인 후 다시 시도해주세요.</p>
        <button onClick={() => navigate('/login')} style={{ marginTop: '18px', padding: '12px 26px', background: TEAL, color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }}>로그인하러 가기</button>
      </div>
    );
  }

  // 대상 상품 없음 (직접 방문 등)
  if (!product) {
    return (
      <div style={{ maxWidth: '520px', margin: '80px auto', textAlign: 'center', padding: '0 20px' }}>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a' }}>판매할 상품을 선택해주세요</h2>
        <p style={{ color: '#64748b', marginTop: '10px', lineHeight: 1.6 }}>상품 상세 페이지에서 <b>판매하기</b>를 눌러 진행해주세요.</p>
        <button onClick={() => navigate('/rental')} style={{ marginTop: '18px', padding: '12px 26px', background: TEAL, color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }}>렌탈 홈으로</button>
      </div>
    );
  }

  if (done) {
    return (
      <div style={{ maxWidth: '560px', margin: '0 auto', padding: '80px 20px', textAlign: 'center' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#eff6ff', color: TEAL, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
        </div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1e293b' }}>판매 신청이 접수되었습니다</h2>
        <p style={{ color: '#64748b', marginTop: '10px', lineHeight: 1.6 }}>담당자가 검수·검토 후 매입 여부를 연락드리겠습니다.<br />감사합니다.</p>
        <button onClick={() => navigate('/rental')} style={{ marginTop: '28px', background: TEAL, color: '#fff', border: 'none', borderRadius: '10px', padding: '13px 28px', fontWeight: 700, cursor: 'pointer' }}>렌탈 홈으로</button>
      </div>
    );
  }

  const catLine = [cats.parent, cats.child].filter(Boolean).join(' › ');
  const feeRow: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', fontSize: '0.9rem', color: '#94a3b8' };

  return (
    <div className="rental-page">
      <Seo title="상품 판매 신청" description="보유하신 상품을 판매 신청하세요 — 컨디션·판매 희망가를 남기면 검수 후 매입 여부를 안내드립니다." keywords="중고 판매,중고 매입,렌탈 판매" />
      <div style={{ maxWidth: '640px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e293b', marginBottom: '6px' }}>상품 판매 신청</h1>
        <p style={{ color: '#64748b', marginBottom: '24px', fontSize: '0.92rem', lineHeight: 1.6 }}>
          아래 상품을 <b style={{ color: TEAL }}>판매</b>하시려면 컨디션 등급과 판매 희망가를 입력해주세요.<br />
          접수 후 담당자 검수를 거쳐 매입 여부를 안내드립니다.
        </p>

        {/* 대상 상품 요약 (자동 기입) */}
        <div style={{ display: 'flex', gap: '14px', alignItems: 'center', border: '1px solid #eef2f6', borderRadius: '14px', padding: '16px', marginBottom: '22px', background: '#fff' }}>
          <div style={{ width: '84px', height: '84px', borderRadius: '10px', overflow: 'hidden', background: '#f1f5f9', flexShrink: 0 }}>
            {gallery[0] && <img src={gallery[0]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            {(product.rental_brands?.name || catLine) && (
              <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: '3px' }}>
                {product.rental_brands?.name}{product.rental_brands?.name && catLine ? ' · ' : ''}{catLine}
              </div>
            )}
            <div style={{ fontSize: '0.98rem', fontWeight: 700, color: '#1e293b', lineHeight: 1.4 }}>{product.name}</div>
          </div>
        </div>

        <div style={{ display: 'grid', gap: '22px' }}>
          {/* 컨디션 등급 (선택 시 파란색 활성) */}
          <div>
            <label style={label}>컨디션 등급 *</label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {GRADES.map((g) => {
                const on = grade === g;
                return (
                  <button key={g} type="button" onClick={() => setGrade(g)}
                    style={{ flex: '1 1 90px', padding: '10px 8px', borderRadius: '10px', border: on ? `2px solid ${TEAL}` : '1px solid #e2e8f0', background: on ? '#eff6ff' : '#fff', cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s' }}>
                    <div style={{ fontWeight: 800, color: on ? TEAL : '#1e293b' }}>{g}급</div>
                    <div style={{ fontSize: '0.68rem', color: on ? '#60a5fa' : '#94a3b8', marginTop: '2px' }}>{GRADE_DESC[g]}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 판매 희망가 + 비용 안내 */}
          <div style={{ border: '1px solid #eef2f6', borderRadius: '14px', padding: '4px 18px', background: '#fff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: '1px solid #f1f5f9' }}>
              <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1e293b', flexShrink: 0 }}>판매 희망가</span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                <input
                  type="number" min={0} inputMode="numeric" value={price}
                  onChange={(e) => setPrice(e.target.value)} placeholder="희망가 입력"
                  style={{ width: '150px', border: 'none', outline: 'none', textAlign: 'right', fontSize: '1.05rem', fontWeight: 800, color: '#1e293b', background: 'transparent' }}
                />
                <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e293b' }}>원</span>
              </div>
            </div>
            <div style={feeRow}><span>검수비</span><span>-</span></div>
            <div style={{ ...feeRow, borderTop: '1px solid #f8fafc' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>수수료 <HelpCircle size={13} color="#cbd5e1" /></span><span>-</span>
            </div>
            <div style={{ ...feeRow, borderTop: '1px solid #f8fafc' }}><span>배송비</span><span style={{ color: '#64748b' }}>선불 · 판매자 부담</span></div>
          </div>
          {price && Number(price) > 0 && (
            <div style={{ fontSize: '0.9rem', color: TEAL, fontWeight: 700, marginTop: '-14px' }}>{won(Number(price))}</div>
          )}

          {/* 상품 사진 (선택) */}
          <div>
            <label style={label}>상품 사진 <span style={{ color: '#94a3b8', fontWeight: 400 }}>(선택 · 검수에 도움돼요)</span></label>
            <ImageUploader value={images} onChange={setImages} folder="rental-purchase" multiple max={6} />
          </div>

          {/* 신청자 정보 (계정에서 자동 — 어드민에 전달) */}
          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '18px' }}>
            <label style={label}>신청자 정보 <span style={{ color: '#94a3b8', fontWeight: 400 }}>(회원 정보에서 자동으로 전달됩니다)</span></label>
            <div style={{ background: '#f8fafc', border: '1px solid #eef2f6', borderRadius: '10px', padding: '14px 16px', fontSize: '0.9rem', color: '#334155', display: 'grid', gap: '6px' }}>
              <div style={{ display: 'flex', gap: '8px' }}><span style={{ color: '#94a3b8', width: '52px' }}>이름</span><b>{applicant?.name || '미등록'}</b></div>
              <div style={{ display: 'flex', gap: '8px' }}><span style={{ color: '#94a3b8', width: '52px' }}>연락처</span><b>{applicant?.phone || '미등록'}</b></div>
              <div style={{ display: 'flex', gap: '8px' }}><span style={{ color: '#94a3b8', width: '52px' }}>이메일</span><b>{applicant?.email || '미등록'}</b></div>
            </div>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#475569', cursor: 'pointer' }}>
            <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} /> 개인정보 수집·이용에 동의합니다 (필수)
          </label>

          <button onClick={submit} disabled={submitting} style={{ background: TEAL, color: '#fff', border: 'none', borderRadius: '10px', padding: '15px', fontSize: '1rem', fontWeight: 700, cursor: 'pointer', opacity: submitting ? 0.6 : 1 }}>
            {submitting ? '접수 중...' : '판매 신청하기'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RentalInquiryPage;
