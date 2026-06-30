import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, ArrowUpLeft, Hash, ImageOff } from 'lucide-react';
import { searchAll, type SearchHit } from '../api/searchApi';

const SearchPage: React.FC = () => {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [q, setQ] = useState('');
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { inputRef.current?.focus(); }, []);

  // 입력 디바운스 검색
  useEffect(() => {
    if (!q.trim()) { setHits([]); setLoading(false); return; }
    setLoading(true);
    const t = setTimeout(async () => {
      const r = await searchAll(q);
      setHits(r);
      setLoading(false);
    }, 250);
    return () => clearTimeout(t);
  }, [q]);

  const close = () => navigate(-1);
  const go = (to: string) => {
    if (/^https?:\/\//.test(to)) window.open(to, '_blank', 'noopener');
    else navigate(to);
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') close();
    if (e.key === 'Enter' && hits.length > 0) go(hits[0].to);
  };

  const renderIcon = (h: SearchHit) => {
    if (h.kind === 'category') return <div style={icIcon}><Hash size={16} color="#94a3b8" /></div>;
    if (h.image) {
      return <img src={h.image} alt="" style={{ ...icBase, objectFit: h.kind === 'brand' ? 'contain' : 'cover', background: '#f8fafc' }} />;
    }
    return <div style={icIcon}><ImageOff size={16} color="#cbd5e1" /></div>;
  };

  return (
    <div style={wrap}>
      <div style={inner}>
        {/* 검색 입력 */}
        <div style={topRow}>
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={onKey}
            placeholder="브랜드, 상품, 시공 사례를 검색해보세요"
            style={inputStyle}
          />
          {q && <button onClick={() => setQ('')} style={clearBtn} aria-label="지우기"><X size={18} color="#64748b" /></button>}
        </div>
        <div style={underline} />

        {/* 결과 */}
        <div style={{ marginTop: '8px' }}>
          {q.trim() && (
            <div style={row} onClick={() => hits[0] && go(hits[0].to)}>
              <div style={icIcon}><Search size={16} color="#94a3b8" /></div>
              <div style={{ flex: 1, minWidth: 0 }}><span style={{ fontWeight: 700 }}>{q}</span><span style={{ color: '#94a3b8' }}> 검색</span></div>
              <ArrowUpLeft size={18} color="#cbd5e1" />
            </div>
          )}

          {loading && <div style={hint}>검색 중...</div>}
          {!loading && q.trim() && hits.length === 0 && <div style={hint}>검색 결과가 없습니다.</div>}

          {hits.map((h) => (
            <div key={`${h.kind}-${h.channel}-${h.id}`} style={row} onClick={() => go(h.to)}>
              {renderIcon(h)}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.title}</div>
                {h.meta && <div style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: '2px' }}>{h.meta}</div>}
              </div>
              <span style={{ fontSize: '0.82rem', color: '#94a3b8', flexShrink: 0 }}>{h.typeLabel}</span>
            </div>
          ))}

          {!q.trim() && (
            <div style={{ ...hint, paddingTop: '40px' }}>찾으시는 브랜드·상품·시공 사례를 입력해보세요.</div>
          )}
        </div>
      </div>

      {/* 우상단 닫기 */}
      <button onClick={close} style={closeBtn} aria-label="닫기"><X size={28} color="#111" /></button>
    </div>
  );
};

const wrap: React.CSSProperties = { position: 'fixed', inset: 0, background: '#fff', zIndex: 3000, overflowY: 'auto' };
const inner: React.CSSProperties = { maxWidth: '1060px', margin: '0 auto', padding: '48px 24px 80px' };
const topRow: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: '12px' };
const inputStyle: React.CSSProperties = { flex: 1, border: 'none', outline: 'none', fontSize: '1.8rem', fontWeight: 700, color: '#111', background: 'transparent', padding: '4px 0' };
const clearBtn: React.CSSProperties = { width: '28px', height: '28px', borderRadius: '50%', background: '#f1f5f9', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 };
const underline: React.CSSProperties = { height: '2px', background: '#111', marginTop: '8px' };
const row: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: '14px', padding: '12px 4px', cursor: 'pointer', borderRadius: '8px' };
const icBase: React.CSSProperties = { width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0 };
const icIcon: React.CSSProperties = { ...icBase, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const hint: React.CSSProperties = { color: '#94a3b8', fontSize: '0.9rem', padding: '16px 4px', textAlign: 'center' };
const closeBtn: React.CSSProperties = { position: 'fixed', top: '24px', right: '32px', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' };

export default SearchPage;
