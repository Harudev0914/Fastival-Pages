import React from 'react';
import { useSearchParams } from 'react-router-dom';
import EstimateManagement from './EstimateManagement';
import { type EstimateType } from '../../../api/opsApi';
import { useAdminPermissions } from '../../../hooks/useAdminPermissions';

const TYPES: EstimateType[] = ['construction', 'rental', 'dj'];
const TAB_LABEL: Record<EstimateType, string> = { construction: '시공 견적서', rental: '렌탈 견적서', dj: 'DJ 프리랜서 견적서' };

// 견적서 관리 — 시공/렌탈/DJ 탭으로 각 용도 견적서를 생성·수정·삭제
const EstimateHub: React.FC = () => {
  const { can } = useAdminPermissions();
  const [sp, setSp] = useSearchParams();
  const allowed = TYPES.filter((t) => can(`estimates/${t}`));
  const qp = sp.get('type') as EstimateType | null;
  const active: EstimateType = qp && allowed.includes(qp) ? qp : allowed[0] || 'construction';

  return (
    <div>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '18px', flexWrap: 'wrap' }}>
        {allowed.map((t) => {
          const on = t === active;
          return (
            <button key={t} onClick={() => setSp({ type: t })}
              style={{ padding: '9px 18px', borderRadius: '10px', border: '1px solid ' + (on ? '#008b8b' : '#e2e8f0'), background: on ? '#008b8b' : '#fff', color: on ? '#fff' : '#64748b', fontWeight: 800, fontSize: '0.88rem', cursor: 'pointer' }}>
              {TAB_LABEL[t]}
            </button>
          );
        })}
      </div>
      <EstimateManagement key={active} type={active} />
    </div>
  );
};

export default EstimateHub;
