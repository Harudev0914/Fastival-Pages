import React, { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import { companyApi, type CompanyInfoInput, type CompanySns } from '../../../api/companyApi';
import { card, inputStyle, labelStyle, btnPrimary, PageHead, useAdminModal, Spinner } from '../../../components/admin/shared';

const blank: CompanyInfoInput = {
  site_name: '', ceo_name: '', biz_name: '', biz_number: '', mail_order_number: '',
  phone: '', fax: '', address: '', privacy_officer: '', privacy_email: '',
  ad_email: '', cs_email: '', cs_phone: '', tagline: '', sns: {},
};

const Field: React.FC<{ label: string; value: string; onChange: (v: string) => void; placeholder?: string; full?: boolean }> = ({ label, value, onChange, placeholder, full }) => (
  <div style={{ gridColumn: full ? '1 / -1' : undefined }}>
    <label style={labelStyle}>{label}</label>
    <input style={inputStyle} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
  </div>
);

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div style={{ ...card, marginBottom: '18px' }}>
    <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#1e293b', marginTop: 0, marginBottom: '16px' }}>{title}</h3>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>{children}</div>
  </div>
);

const CompanyInfoManagement: React.FC = () => {
  const [form, setForm] = useState<CompanyInfoInput>(blank);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { element: modal, alert } = useAdminModal();

  useEffect(() => {
    (async () => {
      const { data, error } = await companyApi.get();
      if (error) alert('불러오기 오류', error);
      if (data) {
        const { id: _id, updated_at: _ua, updated_by: _ub, ...rest } = data as any;
        void _id; void _ua; void _ub;
        setForm({ ...blank, ...rest, sns: data.sns || {} });
      }
      setLoading(false);
    })();
  }, [alert]);

  const set = (k: keyof CompanyInfoInput) => (v: string) => setForm((f) => ({ ...f, [k]: v }));
  const setSns = (k: keyof CompanySns) => (v: string) => setForm((f) => ({ ...f, sns: { ...f.sns, [k]: v } }));

  const save = async () => {
    setSaving(true);
    const { error } = await companyApi.upsert(form);
    setSaving(false);
    if (error) alert('저장 오류', error);
    else alert('저장 완료', '회사 정보가 저장되었습니다. 푸터에 반영됩니다.');
  };

  if (loading) return <Spinner />;

  return (
    <div style={{ maxWidth: '820px' }}>
      <PageHead title="회사 정보 관리" desc="푸터·회사카드에 노출되는 회사 정보를 관리합니다." />

      <Section title="기본 정보">
        <Field label="사이트명" value={form.site_name || ''} onChange={set('site_name')} placeholder="클립스" />
        <Field label="대표자" value={form.ceo_name || ''} onChange={set('ceo_name')} placeholder="홍길동" />
        <Field label="사업자명(상호)" value={form.biz_name || ''} onChange={set('biz_name')} placeholder="(주)클립스" />
        <Field label="사업자등록번호" value={form.biz_number || ''} onChange={set('biz_number')} placeholder="123-45-67890" />
        <Field label="통신판매업 신고번호" value={form.mail_order_number || ''} onChange={set('mail_order_number')} placeholder="제2024-서울서초-0000호" full />
      </Section>

      <Section title="연락처 / 주소">
        <Field label="대표번호" value={form.phone || ''} onChange={set('phone')} placeholder="1600-0000" />
        <Field label="팩스" value={form.fax || ''} onChange={set('fax')} placeholder="02-000-0000" />
        <Field label="주소" value={form.address || ''} onChange={set('address')} placeholder="서울특별시 서초구 ..." full />
        <Field label="고객센터 전화" value={form.cs_phone || ''} onChange={set('cs_phone')} placeholder="1600-0000" />
        <Field label="고객센터 이메일" value={form.cs_email || ''} onChange={set('cs_email')} placeholder="help@klipse.com" />
      </Section>

      <Section title="담당자 / 제휴">
        <Field label="개인정보 책임관리자" value={form.privacy_officer || ''} onChange={set('privacy_officer')} placeholder="홍길동" />
        <Field label="개인정보 책임자 이메일" value={form.privacy_email || ''} onChange={set('privacy_email')} placeholder="privacy@klipse.com" />
        <Field label="광고제휴 문의 이메일" value={form.ad_email || ''} onChange={set('ad_email')} placeholder="contact@klipse.com" full />
      </Section>

      <div style={{ ...card, marginBottom: '18px' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#1e293b', marginTop: 0, marginBottom: '16px' }}>회사 소개 문구</h3>
        <textarea style={{ ...inputStyle, minHeight: '70px', resize: 'vertical' }} value={form.tagline || ''} onChange={(e) => set('tagline')(e.target.value)} placeholder="공간에 딱 맞는 사운드와 시공을 제안하는 클립스" />
      </div>

      <Section title="SNS 링크 (입력 시 푸터에 아이콘 노출)">
        <Field label="네이버 블로그" value={form.sns.naverblog || ''} onChange={setSns('naverblog')} placeholder="https://blog.naver.com/..." />
        <Field label="인스타그램" value={form.sns.instagram || ''} onChange={setSns('instagram')} placeholder="https://instagram.com/..." />
        <Field label="유튜브" value={form.sns.youtube || ''} onChange={setSns('youtube')} placeholder="https://youtube.com/@..." />
        <Field label="X (트위터)" value={form.sns.x || ''} onChange={setSns('x')} placeholder="https://x.com/..." />
        <Field label="틱톡" value={form.sns.tiktok || ''} onChange={setSns('tiktok')} placeholder="https://tiktok.com/@..." />
      </Section>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button style={btnPrimary} onClick={save} disabled={saving}><Save size={16} /> {saving ? '저장 중...' : '저장'}</button>
      </div>
      {modal}
    </div>
  );
};

export default CompanyInfoManagement;
