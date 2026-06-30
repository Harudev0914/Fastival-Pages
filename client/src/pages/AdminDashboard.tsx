import React, { useState } from 'react';
import './AdminDashboard.css';
import { LayoutDashboard, Settings, Package, ChevronLeft, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useNavigate, Outlet } from 'react-router-dom';

const AdminDashboard: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState(() => localStorage.getItem('activeMenu') || '대시보드');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string>('');
  const menuRef = React.useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

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

  return (
    <div className="dashboard-container">
      <nav className="sidebar">
        <div className={`menu-item ${activeMenu === '대시보드' ? 'active' : ''}`} onClick={() => handleMenuClick('대시보드', '/admin/dashboard')}><LayoutDashboard size={18} /> <span>대시보드 홈</span></div>

        {/* 메인 비주얼 관리 (1Depth) */}
        <div className={`menu-item ${activeMenu === '메인 비주얼 관리' ? 'active' : ''}`} onClick={() => handleMenuClick('메인 비주얼 관리', '/admin/dashboard/main-visuals')}><ImageIcon size={18} /> <span>메인 비주얼 관리</span></div>

        {/* 시공 관리 */}
        <div className={`menu-item`} onClick={() => toggleMenu('시공 관리')} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Settings size={18} /> <span>시공 관리</span></div>
            {expandedMenus['시공 관리'] ? <ChevronLeft size={16} style={{ transform: 'rotate(-90deg)' }} /> : <ChevronLeft size={16} style={{ transform: 'rotate(180deg)' }} />}
        </div>
        {expandedMenus['시공 관리'] && (
            <div className="sub-menu">
                <span className={activeMenu === '시공 문의 내역' ? 'active' : ''} onClick={() => handleMenuClick('시공 문의 내역', '/admin/dashboard/inquiries')}>시공 문의 내역</span>
                <span className={activeMenu === '카테고리 관리(시공)' ? 'active' : ''} onClick={() => handleMenuClick('카테고리 관리(시공)', '/admin/dashboard/construction/categories')}>카테고리 관리</span>
                <span className={activeMenu === '후기 관리' ? 'active' : ''} onClick={() => handleMenuClick('후기 관리', '/admin/dashboard/construction/reviews')}>후기 관리</span>
                <span className={activeMenu === '포트폴리오 관리' ? 'active' : ''} onClick={() => handleMenuClick('포트폴리오 관리', '/admin/dashboard/construction/portfolio')}>포트폴리오 관리</span>
                <span className={activeMenu === '시공 문의 챗봇 관리' ? 'active' : ''} onClick={() => handleMenuClick('시공 문의 챗봇 관리', '/admin/dashboard/construction/chatbot')}>시공 문의 챗봇 관리</span>
            </div>
        )}

        {/* 렌탈 관리 */}
        <div className={`menu-item`} onClick={() => toggleMenu('렌탈 관리')} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Package size={18} /> <span>렌탈 관리</span></div>
            {expandedMenus['렌탈 관리'] ? <ChevronLeft size={16} style={{ transform: 'rotate(-90deg)' }} /> : <ChevronLeft size={16} style={{ transform: 'rotate(180deg)' }} />}
        </div>
        {expandedMenus['렌탈 관리'] && (
            <div className="sub-menu">
                <span className={activeMenu === '브랜드 관리' ? 'active' : ''} onClick={() => handleMenuClick('브랜드 관리', '/admin/dashboard/rental/brands')}>브랜드 관리</span>
                <span className={activeMenu === '카테고리 관리(렌탈)' ? 'active' : ''} onClick={() => handleMenuClick('카테고리 관리(렌탈)', '/admin/dashboard/rental/categories')}>카테고리 관리</span>
                <span className={activeMenu === '상품 관리' ? 'active' : ''} onClick={() => handleMenuClick('상품 관리', '/admin/dashboard/rental/products')}>상품 관리</span>
                <span className={activeMenu === '단독 상품' ? 'active' : ''} onClick={() => handleMenuClick('단독 상품', '/admin/dashboard/rental/exclusive')}>단독 상품</span>
                <span className={activeMenu === '기획전' ? 'active' : ''} onClick={() => handleMenuClick('기획전', '/admin/dashboard/rental/events')}>기획전</span>
                <span className={activeMenu === '렌탈 주문 관리' ? 'active' : ''} onClick={() => handleMenuClick('렌탈 주문 관리', '/admin/dashboard/rental/orders')}>렌탈 관리(주문)</span>
                <span className={activeMenu === '렌탈 입점 문의' ? 'active' : ''} onClick={() => handleMenuClick('렌탈 입점 문의', '/admin/dashboard/rental/purchases')}>렌탈 입점 문의</span>
            </div>
        )}

      </nav>

      <main className="main-content">
        <header className="header">
          <div className="header-title">{activeMenu}</div>
          <div style={{ position: 'relative' }} ref={menuRef}>
            <div onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#008b8b', color: 'white', fontWeight: 'bold' }}>
              {userInitial}
            </div>
            {isUserMenuOpen && (
              <div style={{ position: 'absolute', top: '100%', right: 0, backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px', marginTop: '10px', zIndex: 10, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', minWidth: '120px' }}>
                <div onClick={() => handleMenuClick('내 정보 관리', '/admin/dashboard/profile')} style={{ padding: '8px', cursor: 'pointer', fontSize: '0.9rem' }}>내 정보 관리</div>
                <div onClick={handleLogout} style={{ padding: '8px', cursor: 'pointer', fontSize: '0.9rem', color: '#ef4444' }}>로그아웃</div>
              </div>
            )}
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
