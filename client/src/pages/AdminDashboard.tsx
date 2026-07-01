import React, { useState } from 'react';
import './AdminDashboard.css';
import { LayoutDashboard, Settings, Package, ChevronLeft, Image as ImageIcon, Hammer, Disc3, FileText, Briefcase, Receipt, Megaphone, Truck } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useNavigate, Outlet } from 'react-router-dom';
import Seo from '../components/Seo';
import { useAdminPermissions } from '../hooks/useAdminPermissions';
import { companyApi } from '../api/companyApi';

const AdminDashboard: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState(() => localStorage.getItem('activeMenu') || '대시보드');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string>('');
  const [companyName, setCompanyName] = useState<string>('');
  const menuRef = React.useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { can, canGroup } = useAdminPermissions();

  const CON_KEYS = ['construction/categories', 'construction/portfolio', 'construction/chatbot'];
  const WORK_KEYS = ['construction/inquiries', 'construction/works', 'construction/companies', 'construction/reviews', 'construction/calendar', 'construction/stats'];
  const RENT_KEYS = ['rental/brands', 'rental/categories', 'rental/products', 'rental/exclusive', 'rental/events', 'rental/orders'];
  const RENTOPS_KEYS = ['rental/shipments', 'rental/purchases', 'rental/calendar', 'rental/stats'];
  const DJ_KEYS = ['dj/list', 'dj/artists', 'dj/event-inquiries', 'dj/calendar', 'dj/stats'];
  const EST_KEYS = ['estimates/construction', 'estimates/rental', 'estimates/dj', 'contracts'];
  const TERMS_KEYS = ['terms/service', 'terms/privacy'];
  const SYS_KEYS = ['system/admins', 'system/departments', 'system/permissions', 'system/company'];

  React.useEffect(() => {
    localStorage.setItem('activeMenu', activeMenu);
    
    const fetchUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) setUserEmail(user.email || '');
      } catch (error) {
        console.error('Failed to fetch user:', error);
      }
    };
    fetchUser();
    companyApi.get().then(({ data }) => { if (data?.site_name) setCompanyName(data.site_name); });

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeMenu]);

  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({
    '시공 관리': false,
    '뉴스 관리': false,
    'FAQ 관리': false,
    '공지 사항 관리': false,
    '견적서 관리': false,
    '렌탈 상품 관리': false,
    '컨텐츠 관리': false,
    '시스템 설정': false
  });

  const toggleMenu = (menu: string) => {
    setExpandedMenus(prev => ({ ...prev, [menu]: !prev[menu] }));
  };

  const handleMenuClick = (menu: string, path?: string) => {
    setActiveMenu(menu);
    setIsUserMenuOpen(false);
    if (path) navigate(path);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('token');
    window.location.href = '/admin/login';
  };

  const userInitial = userEmail ? userEmail.charAt(0).toUpperCase() : '?';
  const brandName = companyName || 'KLIPSE';
  const brandInitial = (brandName.trim().charAt(0) || 'K').toUpperCase();
  const now = new Date();
  const WD = ['일', '월', '화', '수', '목', '금', '토'];
  const todayLabel = `${now.getFullYear()}. ${now.getMonth() + 1}. ${now.getDate()} (${WD[now.getDay()]})`;

  return (
    <div className="dashboard-container">
      <Seo title="관리자" noindex />
      <nav className="sidebar">
        <div className="brand">
          <div className="brand-logo">{brandInitial}</div>
          <span className="brand-name">{brandName}</span>
        </div>
        {can('dashboard') && <div className={`menu-item ${activeMenu === '대시보드' ? 'active' : ''}`} onClick={() => handleMenuClick('대시보드', '/admin/dashboard')}><LayoutDashboard size={18} /> <span>대시보드 홈</span></div>}

        {/* 사내 공지 (1Depth) */}
        {can('notices') && <div className={`menu-item ${activeMenu === '사내 공지' ? 'active' : ''}`} onClick={() => handleMenuClick('사내 공지', '/admin/dashboard/notices')}><Megaphone size={18} /> <span>사내 공지</span></div>}

        {/* 시공 관리 */}
        {canGroup(CON_KEYS) && (<>
        <div className={`menu-item`} onClick={() => toggleMenu('시공 관리')} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Hammer size={18} /> <span>시공 관리</span></div>
            {expandedMenus['시공 관리'] ? <ChevronLeft size={16} style={{ transform: 'rotate(-90deg)' }} /> : <ChevronLeft size={16} style={{ transform: 'rotate(180deg)' }} />}
        </div>
        {expandedMenus['시공 관리'] && (
            <div className="sub-menu">
                {can('construction/categories') && <span className={activeMenu === '카테고리 관리(시공)' ? 'active' : ''} onClick={() => handleMenuClick('카테고리 관리(시공)', '/admin/dashboard/construction/categories')}>카테고리 관리</span>}
                {can('construction/portfolio') && <span className={activeMenu === '포트폴리오 관리' ? 'active' : ''} onClick={() => handleMenuClick('포트폴리오 관리', '/admin/dashboard/construction/portfolio')}>포트폴리오 관리</span>}
                {can('construction/chatbot') && <span className={activeMenu === '시공 문의 챗봇 관리' ? 'active' : ''} onClick={() => handleMenuClick('시공 문의 챗봇 관리', '/admin/dashboard/construction/chatbot')}>시공 문의 챗봇 관리</span>}
            </div>
        )}
        </>)}

        {/* 시공 업무 관리 */}
        {canGroup(WORK_KEYS) && (<>
        <div className={`menu-item`} onClick={() => toggleMenu('시공 업무 관리')} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Briefcase size={18} /> <span>시공 업무 관리</span></div>
            {expandedMenus['시공 업무 관리'] ? <ChevronLeft size={16} style={{ transform: 'rotate(-90deg)' }} /> : <ChevronLeft size={16} style={{ transform: 'rotate(180deg)' }} />}
        </div>
        {expandedMenus['시공 업무 관리'] && (
            <div className="sub-menu">
                {can('construction/inquiries') && <span className={activeMenu === '시공 문의 내역' ? 'active' : ''} onClick={() => handleMenuClick('시공 문의 내역', '/admin/dashboard/inquiries')}>시공 문의 내역</span>}
                {can('construction/works') && <span className={activeMenu === '시공 업무 현황' ? 'active' : ''} onClick={() => handleMenuClick('시공 업무 현황', '/admin/dashboard/construction/works')}>시공 업무 현황</span>}
                {can('construction/companies') && <span className={activeMenu === '시공 업체 관리' ? 'active' : ''} onClick={() => handleMenuClick('시공 업체 관리', '/admin/dashboard/construction/companies')}>시공 업체 관리</span>}
                {can('construction/reviews') && <span className={activeMenu === '후기 관리' ? 'active' : ''} onClick={() => handleMenuClick('후기 관리', '/admin/dashboard/construction/reviews')}>후기 관리</span>}
                {can('construction/calendar') && <span className={activeMenu === '시공 내역 캘린더' ? 'active' : ''} onClick={() => handleMenuClick('시공 내역 캘린더', '/admin/dashboard/construction/calendar')}>시공 내역 캘린더</span>}
                {can('construction/stats') && <span className={activeMenu === '시공 내역 통계' ? 'active' : ''} onClick={() => handleMenuClick('시공 내역 통계', '/admin/dashboard/construction/stats')}>시공 내역 통계</span>}
            </div>
        )}
        </>)}

        {/* 렌탈 관리 */}
        {canGroup(RENT_KEYS) && (<>
        <div className={`menu-item`} onClick={() => toggleMenu('렌탈 관리')} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Package size={18} /> <span>렌탈 관리</span></div>
            {expandedMenus['렌탈 관리'] ? <ChevronLeft size={16} style={{ transform: 'rotate(-90deg)' }} /> : <ChevronLeft size={16} style={{ transform: 'rotate(180deg)' }} />}
        </div>
        {expandedMenus['렌탈 관리'] && (
            <div className="sub-menu">
                {can('rental/brands') && <span className={activeMenu === '브랜드 관리' ? 'active' : ''} onClick={() => handleMenuClick('브랜드 관리', '/admin/dashboard/rental/brands')}>브랜드 관리</span>}
                {can('rental/categories') && <span className={activeMenu === '카테고리 관리(렌탈)' ? 'active' : ''} onClick={() => handleMenuClick('카테고리 관리(렌탈)', '/admin/dashboard/rental/categories')}>카테고리 관리</span>}
                {can('rental/products') && <span className={activeMenu === '상품 관리' ? 'active' : ''} onClick={() => handleMenuClick('상품 관리', '/admin/dashboard/rental/products')}>상품 관리</span>}
                {can('rental/exclusive') && <span className={activeMenu === '단독 상품' ? 'active' : ''} onClick={() => handleMenuClick('단독 상품', '/admin/dashboard/rental/exclusive')}>단독 상품</span>}
                {can('rental/events') && <span className={activeMenu === '기획전' ? 'active' : ''} onClick={() => handleMenuClick('기획전', '/admin/dashboard/rental/events')}>기획전</span>}
                {can('rental/orders') && <span className={activeMenu === '렌탈 주문 관리' ? 'active' : ''} onClick={() => handleMenuClick('렌탈 주문 관리', '/admin/dashboard/rental/orders')}>렌탈 관리(주문)</span>}
            </div>
        )}
        </>)}

        {/* 렌탈 업무 관리 */}
        {canGroup(RENTOPS_KEYS) && (<>
        <div className={`menu-item`} onClick={() => toggleMenu('렌탈 업무 관리')} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Truck size={18} /> <span>렌탈 업무 관리</span></div>
            {expandedMenus['렌탈 업무 관리'] ? <ChevronLeft size={16} style={{ transform: 'rotate(-90deg)' }} /> : <ChevronLeft size={16} style={{ transform: 'rotate(180deg)' }} />}
        </div>
        {expandedMenus['렌탈 업무 관리'] && (
            <div className="sub-menu">
                {can('rental/shipments') && <span className={activeMenu === '렌탈 출고 현황' ? 'active' : ''} onClick={() => handleMenuClick('렌탈 출고 현황', '/admin/dashboard/rental/shipments')}>렌탈 출고 현황</span>}
                {can('rental/purchases') && <span className={activeMenu === '렌탈 입점 문의' ? 'active' : ''} onClick={() => handleMenuClick('렌탈 입점 문의', '/admin/dashboard/rental/purchases')}>렌탈 입점 문의</span>}
                {can('rental/calendar') && <span className={activeMenu === '렌탈 내역 캘린더' ? 'active' : ''} onClick={() => handleMenuClick('렌탈 내역 캘린더', '/admin/dashboard/rental/calendar')}>렌탈 내역 캘린더</span>}
                {can('rental/stats') && <span className={activeMenu === '렌탈 내역 통계' ? 'active' : ''} onClick={() => handleMenuClick('렌탈 내역 통계', '/admin/dashboard/rental/stats')}>렌탈 내역 통계</span>}
            </div>
        )}
        </>)}

        {/* DJ 관리 */}
        {canGroup(DJ_KEYS) && (<>
        <div className={`menu-item`} onClick={() => toggleMenu('DJ 관리')} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Disc3 size={18} /> <span>DJ 관리</span></div>
            {expandedMenus['DJ 관리'] ? <ChevronLeft size={16} style={{ transform: 'rotate(-90deg)' }} /> : <ChevronLeft size={16} style={{ transform: 'rotate(180deg)' }} />}
        </div>
        {expandedMenus['DJ 관리'] && (
            <div className="sub-menu">
                {can('dj/list') && <span className={activeMenu === 'DJ 목록' ? 'active' : ''} onClick={() => handleMenuClick('DJ 목록', '/admin/dashboard/dj/list')}>DJ 목록</span>}
                {can('dj/artists') && <span className={activeMenu === 'DJ 입점 관리' ? 'active' : ''} onClick={() => handleMenuClick('DJ 입점 관리', '/admin/dashboard/dj/artists')}>DJ 입점 관리</span>}
                {can('dj/event-inquiries') && <span className={activeMenu === 'DJ 행사 문의 관리' ? 'active' : ''} onClick={() => handleMenuClick('DJ 행사 문의 관리', '/admin/dashboard/dj/event-inquiries')}>DJ 행사 문의 관리</span>}
                {can('dj/calendar') && <span className={activeMenu === 'DJ 행사 캘린더' ? 'active' : ''} onClick={() => handleMenuClick('DJ 행사 캘린더', '/admin/dashboard/dj/calendar')}>DJ 행사 캘린더</span>}
                {can('dj/stats') && <span className={activeMenu === 'DJ 행사 통계' ? 'active' : ''} onClick={() => handleMenuClick('DJ 행사 통계', '/admin/dashboard/dj/stats')}>DJ 행사 통계</span>}
            </div>
        )}
        </>)}

        {/* 견적서 관리 */}
        {canGroup(EST_KEYS) && (<>
        <div className={`menu-item`} onClick={() => toggleMenu('견적서 관리')} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Receipt size={18} /> <span>견적서/계약서 관리</span></div>
            {expandedMenus['견적서 관리'] ? <ChevronLeft size={16} style={{ transform: 'rotate(-90deg)' }} /> : <ChevronLeft size={16} style={{ transform: 'rotate(180deg)' }} />}
        </div>
        {expandedMenus['견적서 관리'] && (
            <div className="sub-menu">
                {can('estimates/construction') && <span className={activeMenu === '시공 견적서' ? 'active' : ''} onClick={() => handleMenuClick('시공 견적서', '/admin/dashboard/estimates/construction')}>시공 견적서</span>}
                {can('estimates/rental') && <span className={activeMenu === '렌탈 견적서' ? 'active' : ''} onClick={() => handleMenuClick('렌탈 견적서', '/admin/dashboard/estimates/rental')}>렌탈 견적서</span>}
                {can('estimates/dj') && <span className={activeMenu === 'DJ 프리랜서 견적서' ? 'active' : ''} onClick={() => handleMenuClick('DJ 프리랜서 견적서', '/admin/dashboard/estimates/dj')}>DJ 프리랜서 견적서</span>}
                {can('contracts') && <span className={activeMenu === '계약서 관리' ? 'active' : ''} onClick={() => handleMenuClick('계약서 관리', '/admin/dashboard/contracts')}>계약서 관리</span>}
            </div>
        )}
        </>)}

        {/* 메인 비주얼 관리 (1Depth) */}
        {can('main-visuals') && <div className={`menu-item ${activeMenu === '메인 비주얼 관리' ? 'active' : ''}`} onClick={() => handleMenuClick('메인 비주얼 관리', '/admin/dashboard/main-visuals')}><ImageIcon size={18} /> <span>메인 비주얼 관리</span></div>}

        {/* 약관 관리 */}
        {canGroup(TERMS_KEYS) && (<>
        <div className={`menu-item`} onClick={() => toggleMenu('약관 관리')} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><FileText size={18} /> <span>약관 관리</span></div>
            {expandedMenus['약관 관리'] ? <ChevronLeft size={16} style={{ transform: 'rotate(-90deg)' }} /> : <ChevronLeft size={16} style={{ transform: 'rotate(180deg)' }} />}
        </div>
        {expandedMenus['약관 관리'] && (
            <div className="sub-menu">
                {can('terms/service') && <span className={activeMenu === '서비스 이용약관' ? 'active' : ''} onClick={() => handleMenuClick('서비스 이용약관', '/admin/dashboard/terms/service')}>서비스 이용약관</span>}
                {can('terms/privacy') && <span className={activeMenu === '개인정보 처리방침' ? 'active' : ''} onClick={() => handleMenuClick('개인정보 처리방침', '/admin/dashboard/terms/privacy')}>개인정보 처리방침</span>}
            </div>
        )}
        </>)}

        {/* 환경설정 */}
        {canGroup(SYS_KEYS) && (<>
        <div className={`menu-item`} onClick={() => toggleMenu('환경설정')} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Settings size={18} /> <span>환경설정</span></div>
            {expandedMenus['환경설정'] ? <ChevronLeft size={16} style={{ transform: 'rotate(-90deg)' }} /> : <ChevronLeft size={16} style={{ transform: 'rotate(180deg)' }} />}
        </div>
        {expandedMenus['환경설정'] && (
            <div className="sub-menu">
                {can('system/admins') && <span className={activeMenu === '관리자 목록' ? 'active' : ''} onClick={() => handleMenuClick('관리자 목록', '/admin/dashboard/system/admins')}>관리자 목록</span>}
                {can('system/departments') && <span className={activeMenu === '부서 관리' ? 'active' : ''} onClick={() => handleMenuClick('부서 관리', '/admin/dashboard/system/departments')}>부서 관리</span>}
                {can('system/permissions') && <span className={activeMenu === '부서별 접근 권한' ? 'active' : ''} onClick={() => handleMenuClick('부서별 접근 권한', '/admin/dashboard/system/permissions')}>부서별 접근 권한</span>}
                {can('system/company') && <span className={activeMenu === '회사 정보 관리' ? 'active' : ''} onClick={() => handleMenuClick('회사 정보 관리', '/admin/dashboard/system/company')}>회사 정보 관리</span>}
            </div>
        )}
        </>)}

      </nav>

      <main className="main-content">
        <header className="header">
          <div>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600, letterSpacing: '0.04em', marginBottom: '3px' }}>{brandName} · 관리자</div>
            <div className="header-title">{activeMenu}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
            <div style={{ textAlign: 'right', lineHeight: 1.3 }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155' }}>{todayLabel}</div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userEmail || ' '}</div>
            </div>
            <div style={{ width: '1px', height: '28px', background: '#e2e8f0' }} />
          <div style={{ position: 'relative' }} ref={menuRef}>
            <div onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#008b8b', color: 'white', fontWeight: 'bold', boxShadow: '0 2px 6px rgba(0,139,139,0.3)' }}>
              {userInitial}
            </div>
            {isUserMenuOpen && (
              <div style={{ position: 'absolute', top: '100%', right: 0, backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px', marginTop: '10px', zIndex: 10, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', minWidth: '120px' }}>
                <div onClick={() => handleMenuClick('내 정보 관리', '/admin/dashboard/profile')} style={{ padding: '8px', cursor: 'pointer', fontSize: '0.9rem' }}>내 정보 관리</div>
                <div onClick={handleLogout} style={{ padding: '8px', cursor: 'pointer', fontSize: '0.9rem', color: '#ef4444' }}>로그아웃</div>
              </div>
            )}
          </div>
          </div>
        </header>

        <div className="content-area" style={{ padding: '20px' }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
