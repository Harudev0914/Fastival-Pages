import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ImageOff } from "lucide-react";
import { reviewApi, portfolioApi } from "../api/constructionApi";

function ChevLeft() {
  return <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>;
}
function ChevRight() {
  return <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>;
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
      <path
        d="M7 17L17 7M17 7H9M17 7V15"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ transition: "transform .3s" }}
      />
    </svg>
  );
}

interface Service {
  id: number | string;
  tag: string;
  title: string;
  sub?: string;
  image: string | null;
  link?: string | null;
}

// 이미지 캡션 카드 (시공 사례)
function ServiceCard({ service, onClick }: { service: Service; onClick: () => void }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      className="ksvc-card"
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div className="ksvc-media">
        {service.image
          ? <img src={service.image} alt={service.title} loading="lazy" style={{ transform: hover ? "scale(1.1)" : "scale(1.02)" }} />
          : <div className="ksvc-noimg"><ImageOff size={28} /></div>}
        <div className="ksvc-shade" />
        <div className="ksvc-caption">
          <span className="ksvc-cat">{service.tag}</span>
          <h3>{service.title}</h3>
          {service.sub ? <p>{service.sub}</p> : null}
        </div>
        <span
          className="ksvc-arrow"
          style={{ opacity: hover ? 1 : 0, transform: hover ? "scale(1) rotate(0deg)" : "scale(.6) rotate(-30deg)" }}
        >
          <ArrowIcon />
        </span>
      </div>
    </div>
  );
}

interface Nearby {
  id: number | string;
  meta: string;
  text: string;
  company: string;
  image: string | null;
}

function NearbyCard({ item, onClick }: { item: Nearby; onClick: () => void }) {
  return (
    <div className="knear-card" onClick={onClick}>
      <div className="knear-media">
        {item.image
          ? <img src={item.image} alt={item.meta} loading="lazy" />
          : <div className="knear-noimg"><ImageOff size={22} /></div>}
      </div>
      <div className="knear-body">
        <p className="knear-meta">{item.meta}</p>
        <p className="knear-text">{item.text}</p>
        <span className="knear-company">{item.company}</span>
      </div>
    </div>
  );
}

// 데이터 미등록 시 대체 이미지 + 안내 워딩
function EmptyBlock({ message }: { message: string }) {
  return (
    <div className="kempty">
      <ImageOff size={34} strokeWidth={1.5} />
      <p className="kempty__text">{message}</p>
    </div>
  );
}

export const KlipseServiceSection: React.FC = () => {
  const navigate = useNavigate();
  const nearRowRef = useRef<HTMLDivElement>(null);
  const [reviews, setReviews] = useState<Nearby[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const [{ data: rv }, { data: pf }] = [await reviewApi.list(), await portfolioApi.list()];
      const nearby: Nearby[] = (rv || [])
        .filter((r) => r.is_active)
        .slice(0, 12)
        .map((r) => ({
          id: r.id,
          meta: r.title || r.construction_categories?.name || '시공 후기',
          text: r.content,
          company: r.author_name,
          image: (r.images && r.images[0]) || null,
        }));
      const svc: Service[] = (pf || [])
        .filter((p) => p.is_active)
        .slice(0, 6)
        .map((p) => ({
          id: p.id,
          tag: p.construction_categories?.name || '시공 사례',
          title: p.title,
          image: p.thumbnail_url,
          link: p.link_url,
        }));
      setReviews(nearby);
      setServices(svc);
      setLoaded(true);
    })();
  }, []);

  const slideNear = (dir: number) => {
    nearRowRef.current?.scrollBy({ left: dir * 340, behavior: 'smooth' });
  };

  const openService = (s: Service) => {
    if (s.link) { if (/^https?:\/\//.test(s.link)) window.open(s.link, '_blank', 'noopener'); else navigate(s.link); }
    else navigate('/portfolio');
  };

  return (
    <div className="ksection-wrap">
      <style>{CSS}</style>

      {/* 시공 후기 (실제 등록 후기, 가로 스크롤) */}
      <div className="ksection-head">
        <div>
          <h2 className="ktitle">생생한 Klipse 시공 후기</h2>
          <p className="ksub">직접 시공을 경험한 고객님들이 남긴 진짜 후기예요.</p>
        </div>
        <button type="button" className="kshortcut-btn" onClick={() => navigate("/reviews")}>
          <span className="kbtn-full">후기 더보기</span><span className="kbtn-short">더보기</span>
          <ArrowIcon />
        </button>
      </div>

      {loaded && reviews.length === 0 ? (
        <EmptyBlock message="아직 등록된 시공 후기가 없습니다." />
      ) : (
        <div className="knear-wrap">
          <button type="button" className="knear-nav prev" onClick={() => slideNear(-1)} aria-label="이전 리뷰"><ChevLeft /></button>
          <div className="knear-row" ref={nearRowRef}>
            {reviews.map((n) => (
              <NearbyCard key={n.id} item={n} onClick={() => navigate('/reviews')} />
            ))}
          </div>
          <button type="button" className="knear-nav next" onClick={() => slideNear(1)} aria-label="다음 리뷰"><ChevRight /></button>
        </div>
      )}

      {/* 시공 서비스 (실제 등록 포트폴리오 캡션 카드) */}
      <div className="ksection-head ksection-head--gap">
        <h2 className="ktitle">Klipse가 직접하는 시공 서비스</h2>
        <button type="button" className="kshortcut-btn" onClick={() => navigate("/portfolio")}>
          <span className="kbtn-full">전체 시공 서비스 보기</span><span className="kbtn-short">더보기</span>
          <ArrowIcon />
        </button>
      </div>

      {loaded && services.length === 0 ? (
        <EmptyBlock message="아직 등록된 시공 사례가 없습니다." />
      ) : (
        <div className="ksvc-grid">
          {services.map((s) => (
            <ServiceCard key={s.id} service={s} onClick={() => openService(s)} />
          ))}
        </div>
      )}
    </div>
  );
};

export default KlipseServiceSection;

const CSS = `
.ksection-wrap{
  --bg:#FFFFFF;--ink:#2A2724;--ink-soft:#6B6760;--line:#E8E4DC;
  --card:#FFFFFF;--accent:#2F6BFF;--clay:#C2784F;--radius:14px;
  max-width:none;margin:0;padding:32px 0px 40px;
  font-family:'Pretendard',-apple-system,BlinkMacSystemFont,'Malgun Gothic',sans-serif;
  color:var(--ink);background:var(--bg);
}
.ksection-wrap *{box-sizing:border-box;}

/* 데이터 미등록 시 대체 블록 */
.kempty{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;
  text-align:center;padding:48px 16px;border:1px dashed var(--line);border-radius:var(--radius);
  background:linear-gradient(135deg,#fafaf8 0%,#f1efe9 100%);color:#a8a39a;}
.kempty__text{margin:0;font-size:14px;font-weight:600;color:#8a857c;}
/* 이미지 없는 카드 placeholder */
.ksvc-noimg,.knear-noimg{width:100%;height:100%;display:flex;align-items:center;justify-content:center;
  background:linear-gradient(135deg,#f1efe9,#e6e2d9);color:#bcb7ad;}
.keyebrow{font-size:13px;font-weight:600;color:var(--clay);letter-spacing:.04em;margin:0 0 10px;}
.ktitle{font-size:28px;font-weight:700;margin:0;letter-spacing:-0.01em;}
.ksub{font-size:14px;color:var(--ink-soft);margin:8px 0 0;}
.ksection-head{display:flex;align-items:flex-end;justify-content:space-between;margin-bottom:24px;flex-wrap:wrap;gap:16px;}
.ksection-head--gap{margin-top:88px;}

.kshortcut-btn{display:inline-flex;align-items:center;gap:6px;flex:none;border:1px solid var(--line);
  background:#fff;color:var(--ink);font-size:14px;font-weight:600;padding:11px 18px;border-radius:999px;
  cursor:pointer;transition:background .25s,border-color .25s,transform .2s,color .25s;}
.kshortcut-btn:hover{background:var(--ink);color:#fff;border-color:var(--ink);transform:translateY(-1px);}
.kbtn-short{display:none;}

/* 최신 주변 리뷰 가로 스크롤 + 좌우 슬라이드 버튼 */
.knear-wrap{position:relative;}
.knear-nav{position:absolute;top:33%;transform:translateY(-50%);width:40px;height:40px;border-radius:50%;
  background:#fff;border:1px solid var(--line);box-shadow:0 4px 14px rgba(42,39,36,.16);
  display:flex;align-items:center;justify-content:center;cursor:pointer;z-index:5;color:var(--ink);
  transition:background .2s,transform .2s,box-shadow .2s;}
.knear-nav:hover{background:#f8fafc;transform:translateY(-50%) scale(1.06);}
.knear-nav.prev{left:-12px;}
.knear-nav.next{right:-12px;}
.knear-row{display:flex;gap:20px;overflow-x:auto;padding-bottom:8px;
  scroll-snap-type:x proximity;scrollbar-width:none;-ms-overflow-style:none;-webkit-overflow-scrolling:touch;}
.knear-row::-webkit-scrollbar{display:none;}
.knear-card{flex:0 0 200px;scroll-snap-align:start;cursor:pointer;}
.knear-media{width:100%;aspect-ratio:1/1.02;overflow:hidden;border-radius:10px;background:#eee;}
.knear-media img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .6s cubic-bezier(.22,1,.36,1);}
.knear-card:hover .knear-media img{transform:scale(1.06);}
.knear-body{padding:12px 2px 0;}
.knear-meta{font-size:14px;font-weight:700;color:var(--ink);margin:0 0 6px;}
.knear-text{font-size:13px;line-height:1.55;color:#4B473F;margin:0 0 8px;
  display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;}
.knear-company{font-size:12.5px;color:var(--ink-soft);font-weight:500;}

/* 시공 서비스 캡션 카드 */
.ksvc-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;}
.ksvc-card{position:relative;border-radius:var(--radius);overflow:hidden;cursor:pointer;
  transition:transform .45s cubic-bezier(.22,1,.36,1),box-shadow .45s cubic-bezier(.22,1,.36,1);}
.ksvc-card:hover{transform:translateY(-6px);box-shadow:0 24px 48px -18px rgba(42,39,36,.22);}
.ksvc-media{position:relative;width:100%;aspect-ratio:16/10;overflow:hidden;background:#eee;}
.ksvc-media img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .9s cubic-bezier(.22,1,.36,1);}
.ksvc-shade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,0) 38%,rgba(0,0,0,.62) 100%);}
.ksvc-caption{position:absolute;left:22px;right:22px;bottom:20px;color:#fff;}
.ksvc-cat{font-size:12px;font-weight:600;color:rgba(255,255,255,.82);}
.ksvc-caption h3{font-size:20px;font-weight:700;margin:5px 0 4px;color:#fff;}
.ksvc-caption p{font-size:13.5px;color:rgba(255,255,255,.88);margin:0;}
.ksvc-arrow{position:absolute;right:16px;top:16px;width:38px;height:38px;border-radius:50%;background:#fff;
  display:flex;align-items:center;justify-content:center;color:var(--ink);
  transition:transform .45s cubic-bezier(.34,1.56,.64,1),opacity .35s;}

.ktabs{display:flex;gap:8px;margin-bottom:28px;}
.ktab{appearance:none;border:1px solid var(--line);background:#fff;color:var(--ink-soft);font-size:14px;
  font-weight:600;padding:9px 18px;border-radius:999px;cursor:pointer;
  transition:background .25s,color .25s,border-color .25s,transform .2s;}
.ktab:hover{transform:translateY(-1px);border-color:#d8d3c8;}
.ktab.active{background:var(--accent);color:#fff;border-color:var(--accent);}

.krev-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:20px;}
.krev-card{background:var(--card);border-radius:var(--radius);border:1px solid var(--line);overflow:hidden;
  transition:transform .4s cubic-bezier(.22,1,.36,1),box-shadow .4s;}
.krev-card:hover{transform:translateY(-5px);box-shadow:0 20px 40px -20px rgba(42,39,36,.25);}
.krev-media{position:relative;width:100%;aspect-ratio:4/3.1;overflow:hidden;background:#eee;}
.krev-media img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .8s cubic-bezier(.22,1,.36,1);}
.krev-badge{position:absolute;right:10px;bottom:10px;background:rgba(20,18,16,.62);color:#fff;font-size:12px;
  font-weight:600;padding:5px 9px;border-radius:999px;display:flex;align-items:center;gap:4px;}
.krev-body{padding:16px 18px 20px;}
.krev-meta{display:flex;align-items:center;gap:8px;margin-bottom:10px;}
.krev-avatar{width:24px;height:24px;border-radius:50%;background:linear-gradient(135deg,#e7d8c9,#c8b6a3);flex:none;}
.krev-meta span{font-size:13px;color:var(--ink-soft);font-weight:500;}
.krev-stars{display:flex;gap:2px;margin-bottom:10px;}
.krev-star-wrap{display:inline-flex;}
.krev-text{font-size:13.5px;line-height:1.6;color:#4B473F;margin:0;
  display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;}

@keyframes kpop{0%{transform:scale(1);}50%{transform:scale(1.35);}100%{transform:scale(1);}}

/* 태블릿 이하 - 가로 스크롤 + 카드/이미지 축소 */
@media (max-width:980px){
  .ksvc-grid, .krev-grid{
    display:flex;overflow-x:auto;padding-bottom:16px;gap:16px;
    scrollbar-width:none;-ms-overflow-style:none;-webkit-overflow-scrolling:touch;
  }
  .ksvc-grid::-webkit-scrollbar, .krev-grid::-webkit-scrollbar{display:none;}
  .ksvc-card{flex:0 0 300px;scroll-snap-align:start;}
  .krev-card{flex:0 0 240px;}
  .knear-card{flex:0 0 168px;}
  .ksection-head--gap{margin-top:60px;}
  .knear-nav{display:none;} /* 모바일은 터치 스크롤 */
}

/* 모바일 - 사진/카드 더 축소 */
@media (max-width:560px){
  .ksection-wrap{padding:24px 0px 32px;}
  .ktitle{font-size:21px;}
  .ksub{font-size:13px;}
  .knear-card{flex:0 0 150px;}
  .knear-meta{font-size:13px;}
  .knear-text{font-size:12px;-webkit-line-clamp:2;}
  .ksvc-card{flex:0 0 248px;}
  .ksvc-caption h3{font-size:18px;}
  .krev-card{flex:0 0 220px;}
  .ksection-head--gap{margin-top:48px;}
  /* 모바일: 더보기 버튼을 줄바꿈 없이 오른쪽에 고정 + 짧은 라벨 */
  .ksection-head{flex-wrap:nowrap;align-items:center;gap:10px;}
  .ksection-head > div{min-width:0;}
  .ktitle{font-size:18px;overflow:hidden;text-overflow:ellipsis;}
  .kshortcut-btn{flex:0 0 auto;padding:8px 12px;font-size:13px;}
  .kbtn-full{display:none;}
  .kbtn-short{display:inline;}
}
`;
