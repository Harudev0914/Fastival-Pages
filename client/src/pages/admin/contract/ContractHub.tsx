import React from 'react';
import { useSearchParams } from 'react-router-dom';
import ContractManagement from './ContractManagement';
import { CATEGORY_LABEL, type ContractCategory } from './contractTemplates';
import { useAdminPermissions } from '../../../hooks/useAdminPermissions';

const CATS: ContractCategory[] = ['construction', 'rental', 'dj'];

// 계약서 관리 — 시공/렌탈/DJ 탭으로 각 용도 계약서를 생성·수정·삭제
const ContractHub: React.FC = () => {
  const { can } = useAdminPermissions();
  const [sp, setSp] = useSearchParams();
  const qp = sp.get('cat') as ContractCategory | null;
  const active: ContractCategory = qp && CATS.includes(qp) ? qp : 'construction';

  if (!can('contracts')) return null;

  return (
    <div>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '18px', flexWrap: 'wrap' }}>
        {CATS.map((c) => {
          const on = c === active;
          return (
            <button key={c} onClick={() => setSp({ cat: c })}
              style={{ padding: '9px 18px', borderRadius: '10px', border: '1px solid ' + (on ? '#008b8b' : '#e2e8f0'), background: on ? '#008b8b' : '#fff', color: on ? '#fff' : '#64748b', fontWeight: 800, fontSize: '0.88rem', cursor: 'pointer' }}>
              {CATEGORY_LABEL[c]} 계약서
            </button>
          );
        })}
      </div>
      <ContractManagement key={active} category={active} />
    </div>
  );
};

export default ContractHub;
