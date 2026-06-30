import React, { useState } from 'react';
import { Upload, Image as ImageIcon } from 'lucide-react';
import ResponsiveBanners from '../../../components/ResponsiveBanners';

const MediaManagement: React.FC<{ title: string; type: 'favicon' | 'logo' }> = ({ title, type }) => {
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  return (
    <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <style>{`
        @media (min-width: 1024px) {
          .container { padding: 0 !important; }
        }
      `}</style>
      <ResponsiveBanners />
      <div className="card" style={{ padding: '24px', backgroundColor: 'white', border: '1px solid rgb(226, 232, 240)', borderRadius: '16px', boxShadow: 'rgba(0, 0, 0, 0.02) 0px 4px 12px' }}>
        <h2 style={{ fontSize: '1.1rem', color: '#1e293b', margin: '0 0 20px 0' }}>{title}</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px' }}>
          {/* 섹션 1: 미리보기 */}
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h3 style={{ fontSize: '0.9rem', color: '#475569', marginBottom: '15px' }}>현재 이미지</h3>
            <div style={{ width: '120px', height: '120px', border: '1px solid #cbd5e1', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'white', overflow: 'hidden' }}>
                {preview ? (
                    <img src={preview} alt="preview" style={{ maxWidth: '100%', maxHeight: '100%' }} />
                ) : (
                    <div style={{ textAlign: 'center', color: '#94a3b8' }}>
                        <ImageIcon size={30} style={{ marginBottom: '5px' }} />
                        <span style={{ fontSize: '0.7rem' }}>이미지 없음</span>
                    </div>
                )}
            </div>
          </div>

          {/* 섹션 2: 업로드 */}
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '30px', backgroundColor: '#f8fafc', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            <Upload size={32} color="#008b8b" style={{ marginBottom: '12px' }} />
            <p style={{ margin: '0 0 16px 0', color: '#475569' }}>파일을 선택하거나 드래그하여 업로드하세요.</p>
            <input type="file" id="file-upload" style={{ display: 'none' }} onChange={handleFileChange} accept={type === 'favicon' ? '.ico,.png' : '.png,.svg'} />
            <label htmlFor="file-upload" style={{ 
              padding: '10px 20px', backgroundColor: '#008b8b', color: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, display: 'inline-block' 
            }}>파일 선택</label>
            <p style={{ marginTop: '12px', fontSize: '0.8rem', color: '#94a3b8' }}>
                지원 형식: {type === 'favicon' ? 'ICO, PNG' : 'PNG, SVG'} (최대 2MB)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export const FaviconManagement = () => <MediaManagement title="파비콘 관리" type="favicon" />;
export const LogoManagement = () => <MediaManagement title="로고 관리" type="logo" />;
