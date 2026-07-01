import React, { useEffect, useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Search, Menu, X, ChevronDown, ChevronRight } from 'lucide-react';
import { supabase } from '../supabaseClient';

const Header: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setLoggedIn(!!session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => setLoggedIn(!!session));
    return () => subscription.unsubscribe();
  }, []);

  const logout = async () => { await supabase.auth.signOut(); setIsMobileMenuOpen(false); navigate('/'); };

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
        { label: '렌탈홈', path: '/rental' },
        { label: '카테고리', path: '/rental/categories' },
        { label: '베스트', path: '/rental/best' },
        { label: '단독상품', path: '/rental/exclusive' },
        { label: '기획전', path: '/rental/event' }
      ]
    },
    '/dj': {
      top: 'DJ',
      sub: [
        { label: '홈', path: '/dj' },
        { label: '아티스트', path: '/dj/artists' },
        { label: '행사 캘린더', path: '/dj/calendar' },
        { label: '행사 대행 후기', path: '/dj/reviews' }
      ]
    }
  };

  const getParentPath = (pathname: string) => {
    if (pathname.startsWith('/rental')) return '/rental';
    if (pathname.startsWith('/dj')) return '/dj';
    return '/';
  };

  const currentParent = getParentPath(location.pathname);
  const activeSubNav = navMap[currentParent]?.sub || [];

  // 모바일 메뉴: 아코디언 펼침 상태(기본: 현재 메뉴), 열림 시 body 스크롤 잠금
  const [expanded, setExpanded] = useState<string | null>(currentParent);
  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMobileMenuOpen]);

  const go = (path: string) => { setIsMobileMenuOpen(false); navigate(path); };

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
          {loggedIn ? (
            <>
              <Link to="/mypage" className="user-nav-link">마이페이지</Link>
              <button onClick={logout} className="user-nav-link" style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>로그아웃</button>
            </>
          ) : (
            <>
              <Link to="/login" className="user-nav-link">로그인</Link>
              <Link to="/signup" className="user-nav-link">회원가입</Link>
            </>
          )}
          <Link to="/cs" className="user-nav-link">고객센터</Link>
        </div>

        <div className="mobile-actions">
          <button className="menu-btn" onClick={handleSearchClick} aria-label="검색">
            <Search size={24} />
          </button>
          <button className="menu-btn" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} aria-label="메뉴">
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* 모바일 전체화면 메뉴 (메뉴별 아코디언) */}
      {isMobileMenuOpen && (
        <div className="mobile-menu">
          <nav className="mm-nav">
            {Object.keys(navMap).map((path) => {
              const m = navMap[path];
              const hasSub = m.sub.length > 0;
              const isOpen = expanded === path;
              return (
                <div className="mm-group" key={path}>
                  <button
                    className={`mm-top ${currentParent === path ? 'active' : ''}`}
                    onClick={() => (hasSub ? setExpanded(isOpen ? null : path) : go(path))}
                  >
                    <span>{m.top}</span>
                    {hasSub ? <ChevronDown size={20} className={`mm-chev ${isOpen ? 'rot' : ''}`} /> : <ChevronRight size={20} color="#cbd5e1" />}
                  </button>
                  {hasSub && isOpen && (
                    <div className="mm-sub">
                      {m.sub.map((s) => (
                        <button
                          key={s.path}
                          className={`mm-sub-item ${location.pathname === s.path ? 'active' : ''}`}
                          onClick={() => go(s.path)}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          <div className="mm-foot">
            <div className="mm-search" onClick={() => go('/search')}>
              <Search size={18} color="#64748b" /> <span>통합검색</span>
            </div>
            <div className="mm-users">
              {loggedIn ? (
                <>
                  <button onClick={() => go('/mypage')}>마이페이지</button>
                  <button onClick={logout}>로그아웃</button>
                </>
              ) : (
                <>
                  <button onClick={() => go('/login')}>로그인</button>
                  <button onClick={() => go('/signup')}>회원가입</button>
                </>
              )}
              <button onClick={() => go('/cs')}>고객센터</button>
            </div>
          </div>
        </div>
      )}

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
        
        .menu-btn { background: none; border: none; cursor: pointer; display: flex; align-items: center; color: #111; padding: 4px; }
        .mobile-actions { display: none; align-items: center; gap: 4px; }
        @media (max-width: 1024px) { .mobile-actions { display: flex; } }

        /* 모바일 전체화면 메뉴 */
        .mobile-menu {
          position: fixed; top: 60px; left: 0; right: 0; bottom: 0;
          background: #ffffff; z-index: 1500; overflow-y: auto;
          display: flex; flex-direction: column; justify-content: space-between;
          animation: mmFade 0.2s ease;
        }
        @keyframes mmFade { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: none; } }
        .mm-nav { padding: 6px 0; }
        .mm-group { border-bottom: 1px solid #f1f5f9; }
        .mm-top {
          width: 100%; display: flex; align-items: center; justify-content: space-between;
          background: none; border: none; padding: 18px 20px; font-size: 18px; font-weight: 700;
          color: #111; cursor: pointer; font-family: "Pretendard", sans-serif;
        }
        .mm-top.active { color: #2563eb; }
        .mm-chev { transition: transform 0.2s ease; color: #64748b; }
        .mm-chev.rot { transform: rotate(180deg); color: #2563eb; }
        .mm-sub { background: #f8fafc; padding: 4px 0 10px; }
        .mm-sub-item {
          display: block; width: 100%; text-align: left; background: none; border: none;
          padding: 13px 28px; font-size: 15px; color: #475569; font-weight: 500; cursor: pointer;
          font-family: "Pretendard", sans-serif;
        }
        .mm-sub-item.active { color: #2563eb; font-weight: 700; }
        .mm-foot { padding: 20px; border-top: 1px solid #e2e8f0; }
        .mm-search {
          display: flex; align-items: center; gap: 8px; background: #f1f5f9; border-radius: 50px;
          padding: 13px 18px; color: #64748b; font-size: 15px; margin-bottom: 16px; cursor: pointer;
        }
        .mm-users { display: flex; gap: 8px; }
        .mm-users button {
          flex: 1; background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 13px 4px;
          font-size: 14px; font-weight: 600; color: #111; cursor: pointer; font-family: "Pretendard", sans-serif;
        }
        .mm-users button:hover { border-color: #2563eb; color: #2563eb; }

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
