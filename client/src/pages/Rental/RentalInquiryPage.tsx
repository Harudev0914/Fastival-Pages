import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { purchaseApi, GRADES, type Grade } from '../../api/rentalApi';
import ImageUploader from '../../components/UI/ImageUploader';

const won = (n: number) => `₩${Number(n || 0).toLocaleString()}`;
const TEAL = '#2563eb';
const label: React.CSSProperties = { display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '7px' };
const input: React.CSSProperties = { width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.92rem', boxSizing: 'border-box' };

const phoneOk = (v: string) => /^01[016789]-?\d{3,4}-?\d{4}$/.test(v.replace(/\s/g, ''));
const emailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

const GRADE_DESC: Record<Grade, string> = {
  'C': '사용감 많음 / 일부 손상', 'B': '사용감 있음 / 정상 작동', 'A': '양호 / 생활기스',
  'A+': '우수 / 거의 새것', 'A++': '미개봉급 / 최상',
};

const RentalInquiryPage: React.FC = () => {
  const navigate = useNavigate();
  const [productName, setProductName] = useState('');
  const [brandName, setBrandName] = useState('');
  const [grade, setGrade] = useState<Grade>('A');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [agree, setAgree] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async () => {
    if (!productName.trim()) return alert('매입 희망 품목을 입력해주세요.');
    if (!price || Number(price) <= 0) return alert('매입 희망가를 입력해주세요.');
    if (!name.trim()) return alert('이름을 입력해주세요.');
    if (!phoneOk(phone)) return alert('연락처를 정확히 입력해주세요.');
    if (email && !emailOk(email)) return alert('이메일 형식을 확인해주세요.');
    if (!agree) return alert('개인정보 수집·이용에 동의해주세요.');

    setSubmitting(true);
    const { error } = await purchaseApi.create({
      product_name: productName.trim(),
      brand_name: brandName.trim() || null,
      condition_grade: grade,
      desired_price: Number(price),
      images,
      description: description.trim() || null,
      applicant_name: name.trim(),
      applicant_phone: phone.trim(),
      applicant_email: email.trim() || null,
      status: 'pending',
    });
    setSubmitting(false);
    if (error) return alert(`접수 중 오류가 발생했습니다: ${error}`);
    setDone(true);
  };

  if (done) {
    return (
      <div style={{ maxWidth: '560px', margin: '0 auto', padding: '80px 20px', textAlign: 'center' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#ecfdf5', color: TEAL, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
        </div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1e293b' }}>입점(매입) 문의가 접수되었습니다</h2>
        <p style={{ color: '#64748b', marginTop: '10px', lineHeight: 1.6 }}>담당자가 검토 후 승인 여부를 연락드리겠습니다.<br />감사합니다.</p>
        <button onClick={() => navigate('/rental')} style={{ marginTop: '28px', background: TEAL, color: '#fff', border: 'none', borderRadius: '10px', padding: '13px 28px', fontWeight: 700, cursor: 'pointer' }}>렌탈 홈으로</button>
      </div>
    );
  }

  return (
    <div className="rental-page">
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '1.7rem', fontWeight: 800, color: '#1e293b', marginBottom: '8px' }}>렌탈 입점 / 중고 매입 문의</h1>
        <p style={{ color: '#64748b', marginBottom: '32px' }}>보유하신 상품의 정보·컨디션·희망가를 남겨주시면 검토 후 매입(입점) 여부를 안내드립니다.</p>

        <div style={{ display: 'grid', gap: '18px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div><label style={label}>품목명 *</label><input style={input} value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="예: 요기보 맥스" /></div>
            <div><label style={label}>브랜드</label><input style={input} value={brandName} onChange={(e) => setBrandName(e.target.value)} placeholder="예: 요기보" /></div>
          </div>

          <div>
            <label style={label}>컨디션 등급 *</label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {GRADES.map((g) => (
                <button key={g} type="button" onClick={() => setGrade(g)}
                  style={{ flex: '1 1 90px', padding: '10px 8px', borderRadius: '10px', border: grade === g ? `2px solid ${TEAL}` : '1px solid #e2e8f0', background: grade === g ? '#ecfdf5' : '#fff', cursor: 'pointer', textAlign: 'center' }}>
                  <div style={{ fontWeight: 800, color: grade === g ? TEAL : '#1e293b' }}>{g}급</div>
                  <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '2px' }}>{GRADE_DESC[g]}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={label}>매입 희망가 (원) *</label>
            <input type="number" min={0} style={input} value={price} onChange={(e) => setPrice(e.target.value)} placeholder="예: 150000" />
            {price && Number(price) > 0 && <div style={{ fontSize: '0.82rem', color: TEAL, marginTop: '6px', fontWeight: 700 }}>{won(Number(price))}</div>}
          </div>

          <div>
            <label style={label}>컨디션 설명</label>
            <textarea style={{ ...input, minHeight: '100px', resize: 'vertical' }} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="사용 기간, 하자 여부, 구성품 등" />
          </div>

          <div>
            <label style={label}>상품 사진</label>
            <ImageUploader value={images} onChange={setImages} folder="rental-purchase" multiple max={6} />
          </div>

          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '18px', display: 'grid', gap: '14px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div><label style={label}>이름 *</label><input style={input} value={name} onChange={(e) => setName(e.target.value)} /></div>
              <div><label style={label}>연락처 *</label><input style={input} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="010-0000-0000" /></div>
            </div>
            <div><label style={label}>이메일</label><input style={input} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="선택" /></div>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#475569', cursor: 'pointer' }}>
            <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} /> 개인정보 수집·이용에 동의합니다 (필수)
          </label>

          <button onClick={submit} disabled={submitting} style={{ background: TEAL, color: '#fff', border: 'none', borderRadius: '10px', padding: '15px', fontSize: '1rem', fontWeight: 700, cursor: 'pointer', opacity: submitting ? 0.6 : 1 }}>
            {submitting ? '접수 중...' : '입점 문의 접수하기'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RentalInquiryPage;
