import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import React, { useState } from 'react';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminError from './pages/AdminError';
import Home from './pages/Home';
import ProtectedRoute from './components/ProtectedRoute';
import MobileRestrictionOverlay from './components/MobileRestrictionOverlay';
import Splash from './components/Splash';
import CategoryManagement from './pages/Content/Rental/CategoryManagement';
import ProductManagement from './pages/Content/Rental/ProductManagement';
import InquiryList from './pages/Inquiry/InquiryList';
import InquiryDetail from './pages/Inquiry/InquiryDetail';
import ConstructionInquirySettings from './pages/ConstructionInquirySettings';
import MainVisualList from './pages/Content/MainVisual/MainVisualList';
import MainVisualDetail from './pages/Content/MainVisual/MainVisualDetail';
import FAQList from './pages/Content/FAQ/FAQList';
import FAQDetail from './pages/Content/FAQ/FAQDetail';
import FAQCategoryManagement from './pages/Content/FAQ/FAQCategoryManagement';
import NewsList from './pages/Content/News/NewsList';
import NewsDetail from './pages/Content/News/NewsDetail';
import NewsCategoryManagement from './pages/Content/News/NewsCategoryManagement';
import NoticeList from './pages/Content/Notice/NoticeList';
import NoticeDetail from './pages/Content/Notice/NoticeDetail';
import NoticeCategoryManagement from './pages/Content/Notice/NoticeCategoryManagement';

function AdminRouteWrapper({ children }: { children: React.ReactNode }) {
  return (
    <>
      <MobileRestrictionOverlay />
      {children}
    </>
  );
}

function AdminContent() {
  const navigate = useNavigate();
  return (
    <Routes>
      {/* ... */}
      <Route path="news" element={<NewsList />} />
      <Route path="news/detail/:id" element={<NewsDetail />} />
      <Route path="news-categories" element={<NewsCategoryManagement />} />
      <Route path="notices" element={<NoticeList />} />
      <Route path="notices/detail/:id" element={<NoticeDetail />} />
      <Route path="notice-categories" element={<NoticeCategoryManagement />} />
      <Route path="faq" element={<FAQList />} />
      <Route path="faq/detail/:id" element={<FAQDetail />} />
      <Route path="faq-categories" element={<FAQCategoryManagement />} />
      <Route path="content/main-visual" element={<MainVisualList onEdit={(id) => id ? navigate(`/admin/dashboard/content/main-visual/detail/${id}`) : navigate('/admin/dashboard/content/main-visual/detail/new')} />} />
      {/* ... */}
    </Routes>
  );
}

function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <Router>
      <Routes>
        <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/error" element={<AdminError />} />
        <Route
          path="/admin/dashboard/*"
          element={
            <ProtectedRoute>
              <AdminRouteWrapper>
                <AdminDashboard />
              </AdminRouteWrapper>
            </ProtectedRoute>
          }
        >
          <Route path="*" element={<AdminContent />} />
        </Route>
        <Route path="/" element={
            <>
                {showSplash && <Splash onComplete={() => setShowSplash(false)} />}
                {!showSplash && <Home />}
            </>
        } />
      </Routes>
    </Router>
  );
}

export default App;
