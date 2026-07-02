import React, { useRef, useState } from 'react';
import { ImagePlus, X, Loader2 } from 'lucide-react';
import { uploadImages } from '../../utils/imageUpload';

interface Props {
  value: string[];
  onChange: (urls: string[]) => void;
  folder: string;          // 스토리지 폴더 (reviews/portfolio 등)
  multiple?: boolean;
  max?: number;
}

const tile: React.CSSProperties = {
  width: '96px', height: '96px', borderRadius: '10px', overflow: 'hidden',
  position: 'relative', background: '#f1f5f9', border: '1px solid #e2e8f0', flexShrink: 0,
};

// 이미지 파일 업로드(자동 최적화) + 미리보기/삭제 공통 컴포넌트
const ImageUploader: React.FC<Props> = ({ value, onChange, folder, multiple = true, max = 10 }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setErr(null);
    setUploading(true);
    const remaining = multiple ? Math.max(0, max - value.length) : 1;
    const list = Array.from(files).slice(0, remaining);
    const { urls, error } = await uploadImages(list, folder);
    if (error) setErr(error);
    onChange((multiple ? [...value, ...urls] : urls.slice(0, 1)).slice(0, max));
    setUploading(false);
    if (inputRef.current) inputRef.current.value = '';
  };

  const canAdd = multiple ? value.length < max : value.length === 0;

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
        {value.map((url) => (
          <div key={url} style={tile}>
            <img src={url} alt="업로드 이미지" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <button
              type="button"
              onClick={() => onChange(value.filter((u) => u !== url))}
              aria-label="이미지 삭제"
              style={{ position: 'absolute', top: '4px', right: '4px', width: '22px', height: '22px', borderRadius: '50%', border: 'none', background: 'rgba(15,23,42,0.7)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <X size={13} />
            </button>
          </div>
        ))}

        {canAdd && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            style={{ ...tile, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px', color: '#64748b', cursor: uploading ? 'wait' : 'pointer', borderStyle: 'dashed' }}
          >
            {uploading ? <Loader2 size={20} className="iu-spin" /> : <ImagePlus size={20} />}
            <span style={{ fontSize: '0.72rem' }}>{uploading ? '업로드 중' : '이미지 추가'}</span>
          </button>
        )}
      </div>

      <input ref={inputRef} type="file" accept="image/*" multiple={multiple} hidden onChange={(e) => handleFiles(e.target.files)} />

      {err && <p style={{ color: '#dc2626', fontSize: '0.78rem', marginTop: '8px' }}>{err}</p>}
      <p style={{ color: '#94a3b8', fontSize: '0.74rem', marginTop: '8px' }}>
        JPG · PNG 이미지 · 최대 10MB {multiple ? `(최대 ${max}장)` : ''}
      </p>

      <style>{`@keyframes iu-spin { to { transform: rotate(360deg); } } .iu-spin { animation: iu-spin 0.8s linear infinite; }`}</style>
    </div>
  );
};

export default ImageUploader;
