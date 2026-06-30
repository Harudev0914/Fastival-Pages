import React, { useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Search, Menu, X } from 'lucide-react';

const Header: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSearchClick = () => {
    navigate('/search');
  };

  const navMap: Record<string, { top: string; sub: { label: string; path: string }[] }> = {
    '/': {
      top: '시공',
      sub: [
        { label: '홈', path: '/' },
        { label: '시공 문의', path: '/construction-inquiry' },
        { label: '포트폴리오', path: '/portfolio' },
        { label: '시공 정보', path: '/info' },
        { label: '시공 후기', path: '/reviews' }
      ]
    },
    '/rental': {
      top: '렌탈',
      sub: [
        { label: '쇼핑홈', path: '/rental' },
        { label: '베스트', path: '/rental/best' },
        { label: '단독상품', path: '/rental/exclusive' },
        { label: '기획전', path: '/rental/event' },
        { label: '입점문의', path: '/rental/inquiry' }
      ]
    },
    '/dj': { top: 'DJ', sub: [] }
  };

  const getParentPath = (pathname: string) => {
    if (pathname.startsWith('/rental')) return '/rental';
    if (pathname.startsWith('/dj')) return '/dj';
    return '/';
  };

  const currentParent = getParentPath(location.pathname);
  const activeSubNav = navMap[currentParent]?.sub || [];

  return (
    <header className="site-header">
      <div className="header-padding header-top">
        <div className="header-left">
          <Link to="/" className="logo-link">
            <img src="/Klipse_Logo.png" alt="Klipse" style={{ height: '30px' }} />
          </Link>
          <nav className="desktop-only main-nav">
            {Object.keys(navMap).map(path => (
              <Link key={path} to={path} className={`nav-link ${currentParent === path ? 'active' : ''}`}>
                {navMap[path].top}
              </Link>
            ))}
          </nav>
        </div>

        <div className="desktop-only header-right">
          <div className="search-box" onClick={handleSearchClick}>
            <Search size={16} color="#64748b" />
            <input type="text" placeholder="통합검색" className="search-input" readOnly />
          </div>
          <Link to="/login" className="user-nav-link">로그인</Link>
          <Link to="/signup" className="user-nav-link">회원가입</Link>
          <Link to="/cs" className="user-nav-link">고객센터</Link>
        </div>

        <button className="mobile-only menu-btn" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {activeSubNav.length > 0 && (
        <div className="sub-nav-container header-padding">
          <nav className="sub-nav">
            {activeSubNav.map((item) => (
              <Link key={item.label} to={item.path} className={`sub-nav-item ${location.pathname === item.path ? 'active' : ''}`}>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
      
      <div id="inquiry-header-portal" />

      <style>{`
        .site-header { position: sticky; top: 0; left: 0; right: 0; z-index: 1000; background-color: #ffffff; border-bottom: 1px solid #e2e8f0; font-family: "Pretendard", sans-serif; }
        .header-padding { padding-left: 18vw; padding-right: 18vw; }
        .header-top { display: flex; align-items: center; justify-content: space-between; height: 60px; flex-wrap: nowrap; }
        .header-left { display: flex; align-items: center; gap: 40px; flex-shrink: 0; }
        .logo-link { display: flex; align-items: center; }
        .main-nav { display: flex; gap: 30px; flex-shrink: 0; }
        .nav-link { text-decoration: none; color: #111; font-weight: 600; font-size: 16px; white-space: nowrap; transition: color 0.15s ease; }
        .nav-link:hover { color: #2563eb; }
        .nav-link.active { color: #2563eb; font-weight: 700; }
        
        .header-right { display: flex; align-items: center; gap: 25px; flex-shrink: 0; }
        .search-box { position: relative; display: flex; align-items: center; background-color: #f1f5f9; border-radius: 50px; padding: 8px 16px; width: 240px; cursor: pointer; }
        .search-input { border: none; background-color: transparent; margin-left: 8px; font-size: 15px; outline: none; width: 100%; font-family: "Pretendard", sans-serif; font-weight: 400; cursor: pointer; }
        .user-nav-link { color: #111; font-size: 15px; text-decoration: none; font-weight: 600; white-space: nowrap; transition: color 0.15s ease; }
        .user-nav-link:hover { color: #2563eb; }
        .search-box { transition: background-color 0.15s ease; }
        .search-box:hover { background-color: #e2e8f0; }
        
        .sub-nav-container { display: flex; align-items: center; height: 50px; border-top: 1px solid #e2e8f0; overflow-x: auto; scrollbar-width: none; background-color: #ffffff; }
        .sub-nav { display: flex; height: 100%; }
        .sub-nav-item { color: #111; text-decoration: none; font-size: 15px; font-weight: 600; font-family: "Pretendard", sans-serif; display: flex; align-items: center; justify-content: center; padding: 0 20px; height: 100%; box-sizing: border-box; white-space: nowrap; transition: color 0.15s ease; }
        .sub-nav-item:hover { color: #2563eb; }
        .sub-nav-item.active { color: #2563eb !important; font-weight: 700 !important; border-bottom: 2px solid #2563eb !important; }
        
        .menu-btn { background: none; border: none; cursor: pointer; }
        
        @media (max-width: 1024px) {
          .header-padding { padding-left: 4vw; padding-right: 4vw; }
          .desktop-only { display: none !important; }
          .mobile-only { display: block !important; }
          .nav-link { font-size: 15px; }
          .search-input { font-size: 14px; }
          .user-nav-link { font-size: 14px; }
          .sub-nav-item { font-size: 14px; padding: 0 12px !important; }
        }
        @media (max-width: 767px) {
          .nav-link { font-size: 14px; }
          .sub-nav-item { font-size: 13px; }
        }
        @media (min-width: 1025px) {
          .desktop-only { display: flex !important; }
          .mobile-only { display: none !important; }
        }
      `}</style>
    </header>
  );
};

export default Header;
