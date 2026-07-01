import React, { useState } from 'react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import { regionToKR } from '../../api/djApi';
import { card } from './shared';

// 대한민국 시·도 경계 GeoJSON (오픈소스: southkorea-maps, kostat 2018)
const GEO_URL = 'https://raw.githubusercontent.com/southkorea/southkorea-maps/master/kostat/2018/json/skorea-provinces-2018-geo.json';

interface Props { title?: string; data: Record<string, number>; color?: string; unit?: string; }

const hexRgb = (h: string): [number, number, number] => {
  const n = parseInt(h.replace('#', ''), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

const KoreaMap: React.FC<Props> = ({ title, data, color = '#7c3aed', unit = '명' }) => {
  const [hover, setHover] = useState<{ name: string; value: number; x: number; y: number } | null>(null);
  const max = Math.max(1, ...Object.values(data));
  const [r, g, b] = hexRgb(color);
  const fillFor = (v: number) => (v > 0 ? `rgba(${r},${g},${b},${(0.18 + 0.82 * (v / max)).toFixed(3)})` : '#eef2f6');

  return (
    <div style={{ ...card, position: 'relative' }}>
      {title && <h3 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0f172a', marginTop: 0, marginBottom: '10px' }}>{title}</h3>}
      <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 320px', maxWidth: '480px', minWidth: '260px', position: 'relative' }}>
          <ComposableMap projection="geoMercator" projectionConfig={{ center: [127.8, 36.2], scale: 4600 }} width={480} height={520} style={{ width: '100%', height: 'auto' }}>
            <Geographies geography={GEO_URL}>
              {({ geographies }: any) => geographies.map((geo: any) => {
                const nm: string = geo.properties?.name || geo.properties?.NAME_1 || '';
                const kr = regionToKR(nm);
                const v = kr ? (data[kr] || 0) : 0;
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={fillFor(v)}
                    stroke="#fff"
                    strokeWidth={0.7}
                    onMouseEnter={(e: React.MouseEvent) => setHover({ name: kr || nm, value: v, x: e.clientX, y: e.clientY })}
                    onMouseMove={(e: React.MouseEvent) => setHover((h) => (h ? { ...h, x: e.clientX, y: e.clientY } : h))}
                    onMouseLeave={() => setHover(null)}
                    style={{ default: { outline: 'none' }, hover: { outline: 'none', fill: color, opacity: 0.9 }, pressed: { outline: 'none' } }}
                  />
                );
              })}
            </Geographies>
          </ComposableMap>
        </div>

        {/* 우측 순위 리스트 + 범례 */}
        <div style={{ flex: '1 1 200px', minWidth: '180px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.74rem', color: '#94a3b8', marginBottom: '12px' }}>
            적음 <span style={{ flex: 1, height: '8px', borderRadius: '999px', background: `linear-gradient(90deg, ${fillFor(max * 0.1)}, ${color})` }} /> 많음
          </div>
          <div style={{ display: 'grid', gap: '6px' }}>
            {Object.entries(data).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([reg, v]) => (
              <div key={reg} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.84rem' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: fillFor(v), border: '1px solid #e2e8f0' }} />
                <span style={{ color: '#475569', flex: 1 }}>{reg}</span>
                <span style={{ fontWeight: 700, color: '#1e293b' }}>{v}{unit}</span>
              </div>
            ))}
            {Object.values(data).every((v) => !v) && <div style={{ color: '#94a3b8', fontSize: '0.84rem' }}>데이터가 없습니다.</div>}
          </div>
        </div>
      </div>

      {hover && (
        <div style={{ position: 'fixed', left: hover.x + 12, top: hover.y + 12, zIndex: 50, background: '#0f172a', color: '#fff', fontSize: '0.78rem', fontWeight: 700, padding: '6px 10px', borderRadius: '8px', pointerEvents: 'none', boxShadow: '0 6px 20px rgba(0,0,0,0.25)' }}>
          {hover.name} · {hover.value}{unit}
        </div>
      )}
    </div>
  );
};

export default KoreaMap;
