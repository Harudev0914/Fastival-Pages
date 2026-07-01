import React from 'react';
import { useNavigate } from 'react-router-dom';
import MainVisualCarousel from '../../components/MainVisualCarousel';
import Seo from '../../components/Seo';
import '../Rental/RentalPage.css';

const BLUE = '#2563eb';

const DjPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="rental-page">
      <Seo title="DJ" description="클립스 DJ — 공간·행사에 맞는 DJ 섭외와 아티스트 등록(입점)." keywords="DJ 섭외,DJ 파티,행사 DJ,DJ 아티스트,클럽 DJ,클립스 DJ" />
      <MainVisualCarousel section="dj" />

      <section style={{ marginTop: '48px', textAlign: 'center', padding: '48px 20px', background: 'linear-gradient(135deg,#0f172a,#1e293b)', borderRadius: '16px', color: '#fff' }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0 }}>DJ 아티스트를 찾거나, 아티스트로 활동하세요</h2>
        <p style={{ color: '#cbd5e1', marginTop: '12px', lineHeight: 1.7 }}>
          공간·행사 분위기에 맞는 검증된 DJ 섭외.<br />DJ라면 포트폴리오·게런티를 등록하고 아티스트 회원으로 활동할 수 있어요.
        </p>
        <button onClick={() => navigate('/dj/apply')} style={{ marginTop: '24px', background: BLUE, color: '#fff', border: 'none', borderRadius: '10px', padding: '14px 30px', fontSize: '1rem', fontWeight: 700, cursor: 'pointer' }}>
          DJ 입점 · 아티스트 등록하기
        </button>
      </section>
    </div>
  );
};

export default DjPage;
