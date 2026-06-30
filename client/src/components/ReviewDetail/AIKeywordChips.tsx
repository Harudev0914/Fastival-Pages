import React, { useEffect, useState } from 'react';
import { reviewApi } from '../../api/constructionApi';
import { ChevronRightIcon, SparkleIcon } from './icons';

// 후기 본문에서 탐지할 긍정 키워드 사전 (라벨 → 매칭 패턴)
const KEYWORD_DEFS: { label: string; re: RegExp }[] = [
  { label: '시공 결과가 좋아요', re: /좋|만족|예쁘|이쁘|마음에\s*들|훌륭|최고/ },
  { label: '가격이 합리적이에요', re: /가격|합리|저렴|가성비|비용/ },
  { label: '마무리가 깔끔해요', re: /깔끔|마감|마무리/ },
  { label: '꼼꼼하게 시공해요', re: /꼼꼼|세심|디테일|정성|섬세/ },
  { label: '소통이 잘 돼요', re: /소통|친절|응대|상담|설명/ },
  { label: '일정이 정확해요', re: /일정|약속|빠르|신속|제때|기간/ },
  { label: '믿을 수 있어요', re: /믿|신뢰|안심/ },
  { label: '추천하고 싶어요', re: /추천|또 맡기|재시공/ },
];

const AIKeywordChips: React.FC = () => {
  const [keywords, setKeywords] = useState<{ label: string; count: number }[]>([]);

  useEffect(() => {
    (async () => {
      const { data } = await reviewApi.list();
      const active = (data || []).filter((r) => r.is_active);
      // 실제 후기 텍스트(제목+본문)를 분석해 키워드별 등장 후기 수 카운트 → 상위 4개
      const counts = KEYWORD_DEFS
        .map((def) => ({
          label: def.label,
          count: active.filter((r) => def.re.test(`${r.title || ''} ${r.content || ''}`)).length,
        }))
        .filter((k) => k.count > 0)
        .sort((a, b) => b.count - a.count)
        .slice(0, 4);
      setKeywords(counts);
    })();
  }, []);

  if (keywords.length === 0) return null; // 분석할 후기가 없으면 섹션 숨김

  return (
    <section className="ai-section">
      <div className="ai-section__head">
        <h3>이런 리뷰가 많았어요</h3>
        <span className="ai-badge">
          <SparkleIcon /> AI 분석
        </span>
      </div>
      <div className="ai-chips">
        {keywords.map((kw) => (
          <button key={kw.label} className="ai-chip" type="button">
            {kw.label} <span className="chip-count">{kw.count}</span>
          </button>
        ))}
        <button className="ai-chips__more" type="button" aria-label="키워드 더보기">
          <ChevronRightIcon size={16} color="#64748b" />
        </button>
      </div>
    </section>
  );
};

export default AIKeywordChips;
