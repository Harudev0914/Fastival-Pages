import React, { useState } from 'react';
import './AdminDashboard.css';
import { LayoutDashboard, FileText, Settings, LogOut, Info, BarChart3, HelpCircle, Package, Mic2, Megaphone, ChevronLeft, ChevronRight } from 'lucide-react';

import ConstructionInquirySettings from './ConstructionInquirySettings';

const AdminDashboard: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState(() => localStorage.getItem('activeMenu') || '대시보드');
  const [activeNoticeTab, setActiveNoticeTab] = useState('전체');

  React.useEffect(() => {
    localStorage.setItem('activeMenu', activeMenu);
  }, [activeMenu]);

  const [notices, setNotices] = useState([
    { title: '시공 관련 안전 규정 변경 안내', category: '시공' },
    { title: '렌탈 장비 신규 입고 안내', category: '렌탈' },
    { title: '전사 워크숍 일정 안내', category: '전체' },
    { title: '시공 현장 관리 지침 준수', category: '시공' },
  ]);
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('expandedMenus');
    return saved ? JSON.parse(saved) : {
        '시공 문의': true,
        '렌탈관리': false,
        'DJ관리': false,
        '컨텐츠관리': false
    };
  });

  const admins = [
    { name: '박팀장', title: '부장', dept: '기획팀', avatar: 'https://i.pravatar.cc/40?u=1' },
    { name: '김과장', title: '과장', dept: '시공팀', avatar: 'https://i.pravatar.cc/40?u=2' }
  ];

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;
  const filteredNotices = activeNoticeTab === '전체' 
    ? notices 
    : notices.filter(n => n.category === activeNoticeTab);

  const paginatedNotices = filteredNotices.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredNotices.length / itemsPerPage);

  const toggleMenu = (menu: string) => {
    setExpandedMenus(prev => ({ ...prev, [menu]: !prev[menu] }));
  };

  const handleMenuClick = (menu: string) => {
    setActiveMenu(menu);
  };

  return (
    <div className="dashboard-container">
      <nav className="sidebar">
        <div className={`menu-item ${activeMenu === '대시보드' ? 'active' : ''}`} onClick={() => handleMenuClick('대시보드')}><LayoutDashboard size={16} /> <span>대시보드 홈</span></div>
        
        <div className={`menu-item`} onClick={() => toggleMenu('시공 문의')} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><HelpCircle size={16} /> <span>시공 문의</span></div>
            {expandedMenus['시공 문의'] ? <ChevronLeft size={16} style={{ transform: 'rotate(-90deg)' }} /> : <ChevronLeft size={16} style={{ transform: 'rotate(180deg)' }} />}
        </div>
        {expandedMenus['시공 문의'] && (
            <div className="sub-menu">
              <span className={activeMenu === '시공 문의 내역' ? 'active' : ''} onClick={() => handleMenuClick('시공 문의 내역')}>시공 문의 내역</span>
              <span className={activeMenu === '시공 질의 설정' ? 'active' : ''} onClick={() => handleMenuClick('시공 질의 설정')}>시공 질의 설정</span>
            </div>
        )}
        
        <div className={`menu-item`} onClick={() => toggleMenu('렌탈관리')} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Package size={16} /> <span>렌탈 상품</span></div>
            {expandedMenus['렌탈관리'] ? <ChevronLeft size={16} style={{ transform: 'rotate(-90deg)' }} /> : <ChevronLeft size={16} style={{ transform: 'rotate(180deg)' }} />}
        </div>
        {expandedMenus['렌탈관리'] && (
            <div className="sub-menu">
              <span onClick={() => handleMenuClick('카테고리')}>카테고리</span>
              <span onClick={() => handleMenuClick('상품 관리')}>상품 관리</span>
              <span onClick={() => handleMenuClick('브랜드 관리')}>브랜드 관리</span>
            </div>
        )}

        <div className={`menu-item`} onClick={() => toggleMenu('DJ관리')} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Mic2 size={16} /> <span>DJ 아티스트</span></div>
            {expandedMenus['DJ관리'] ? <ChevronLeft size={16} style={{ transform: 'rotate(-90deg)' }} /> : <ChevronLeft size={16} style={{ transform: 'rotate(180deg)' }} />}
        </div>
        {expandedMenus['DJ관리'] && (
            <div className="sub-menu">
              <span onClick={() => handleMenuClick('전체 목록')}>전체 목록</span>
              <span onClick={() => handleMenuClick('승인 대기')}>승인 대기</span>
            </div>
        )}
        
        <div className={`menu-item`} onClick={() => toggleMenu('컨텐츠관리')} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Megaphone size={16} /> <span>사이트 컨텐츠</span></div>
            {expandedMenus['컨텐츠관리'] ? <ChevronLeft size={16} style={{ transform: 'rotate(-90deg)' }} /> : <ChevronLeft size={16} style={{ transform: 'rotate(180deg)' }} />}
        </div>
        {expandedMenus['컨텐츠관리'] && (
            <div className="sub-menu">
              <span onClick={() => handleMenuClick('메인 비주얼')}>메인 비주얼</span>
              <span onClick={() => handleMenuClick('팝업 관리')}>팝업 관리</span>
              <span onClick={() => handleMenuClick('배너 설정')}>배너 설정</span>
            </div>
        )}
        
        <div className={`menu-item ${activeMenu === '게시판관리' ? 'active' : ''}`} onClick={() => handleMenuClick('게시판관리')}><FileText size={16} /> <span>게시판 관리</span></div>
        <div className={`menu-item ${activeMenu === '환경설정' ? 'active' : ''}`} onClick={() => handleMenuClick('환경설정')}><Settings size={16} /> <span>시스템 설정</span></div>
        <div className={`menu-item ${activeMenu === '통계 데이터' ? 'active' : ''}`} onClick={() => handleMenuClick('통계 데이터')}><BarChart3 size={16} /> <span>운영 통계</span></div>
      </nav>

      <main className="main-content">
        <header className="header">
          <div className="header-title">
            {activeMenu}
          </div>
          <div className="user-initial-icon">박</div>
        </header>

        {activeMenu === '시공 질의 설정' ? (
          <ConstructionInquirySettings />
        ) : (
          <div className="dashboard-layout">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="card">
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <img src={admins[0].avatar} alt="avatar" style={{ borderRadius: '50%', width: '60px', height: '60px', marginBottom: '10px' }} />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#334155' }}>{admins[0].name} {admins[0].title}</span>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{admins[0].dept}</span>
                </div>
              </div>
            </div>
            <div className="card">
              <h3>다가오는 업무</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ textAlign: 'left', padding: '8px 0' }}>일자</th>
                    <th style={{ textAlign: 'left', padding: '8px 0' }}>구분</th>
                    <th style={{ textAlign: 'left', padding: '8px 0' }}>내용</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: '8px 0' }}>06/27</td>
                    <td style={{ padding: '8px 0', color: '#008b8b', fontWeight: 600 }}>시공</td>
                    <td style={{ padding: '8px 0' }}>현장 미팅</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px 0' }}>06/28</td>
                    <td style={{ padding: '8px 0', color: '#008b8b', fontWeight: 600 }}>렌탈</td>
                    <td style={{ padding: '8px 0' }}>장비 반납</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px 0' }}>06/29</td>
                    <td style={{ padding: '8px 0', color: '#008b8b', fontWeight: 600 }}>DJ</td>
                    <td style={{ padding: '8px 0' }}>미팅</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3>공지사항</h3>
                <div style={{ display: 'flex', gap: '5px' }}>
                  <button 
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '0', display: 'flex', alignItems: 'center', opacity: currentPage === 1 ? 0.5 : 1 }}
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button 
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages || totalPages === 0}
                    style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '0', display: 'flex', alignItems: 'center', opacity: (currentPage === totalPages || totalPages === 0) ? 0.5 : 1 }}
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
              <div className="notice-tabs">
                {['전체', '시공', '렌탈'].map(tab => (
                  <div 
                    key={tab} 
                    className={`notice-tab ${activeNoticeTab === tab ? 'active' : ''}`}
                    onClick={() => { setActiveNoticeTab(tab); setCurrentPage(1); }}
                  >
                    {tab}
                  </div>
                ))}
              </div>
              <ul className="notice-list">
                {paginatedNotices.map((notice, i) => (
                  <li key={i} className="notice-item">
                    <span>{notice.title}</span>
                    <small style={{color: '#94a3b8'}}>[{notice.category}]</small>
                  </li>
                ))}
              </ul>
            </div>
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0px 0px 10px 0px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <h3 style={{ margin: 0 }}>2026. 06</h3>
                  <button style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '0px', display: 'flex', alignItems: 'center' }}>
                    <ChevronLeft size={18} />
                  </button>
                  <button style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '0px', display: 'flex', alignItems: 'center' }}>
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
              <div className="calendar-grid">
                {['일', '월', '화', '수', '목', '금', '토'].map((day, i) => (
                  <div key={day} className="calendar-day" style={{ color: i === 0 ? 'red' : i === 6 ? 'blue' : 'inherit' }}>
                    <strong>{day}</strong>
                  </div>
                ))}
                {Array.from({ length: 30 }).map((_, i) => {
                  const day = i + 1;
                  const dayOfWeek = (i) % 7; // Assuming 1st is Monday (adjust as needed)
                  const isSelected = day === 17;
                  return (
                    <div 
                      key={i} 
                      className="calendar-day" 
                      style={{
                        color: dayOfWeek === 0 ? 'red' : dayOfWeek === 6 ? 'blue' : 'inherit',
                        backgroundColor: isSelected ? '#e2e8f0' : 'white',
                        borderRadius: isSelected ? '50px' : '0'
                      }}
                    >
                      {day}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="card">
            <button><Info size={16} /> 기본정보</button>
            <button><LogOut size={16} /> 로그아웃</button>
          </div>
        </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
