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
import NoticeList from './pages/Content/Notice/NoticeList';
import NoticeDetail from './pages/Content/Notice/NoticeDetail';
import NoticeCategoryManagement from './pages/Content/Notice/NoticeCategoryManagement';
import NewsList from './pages/Content/News/NewsList';
import NewsDetail from './pages/Content/News/NewsDetail';
import NewsCategoryManagement from './pages/Content/News/NewsCategoryManagement';
import SEOManagement from './pages/Content/System/SEOManagement';

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
      <Route path="inquiries" element={<InquiryList onViewDetail={(id) => navigate(`/admin/dashboard/inquiries/${id}`)} />} />
      <Route path="inquiries/:id" element={<InquiryDetail />} />
      <Route path="inquiry-settings" element={<ConstructionInquirySettings />} />
      <Route path="categories" element={<CategoryManagement />} />
      <Route path="products" element={<ProductManagement />} />
      <Route path="news" element={<NewsList />} />
      <Route path="news/detail/:id" element={<NewsDetail />} />
      <Route path="news-categories" element={<NewsCategoryManagement />} />
      <Route path="notices" element={<NoticeList />} />
      <Route path="notices/detail/:id" element={<NoticeDetail />} />
      <Route path="notice-categories" element={<NoticeCategoryManagement />} />
      <Route path="content/main-visual" element={<MainVisualList onEdit={(id) => id ? navigate(`/admin/dashboard/content/main-visual/detail/${id}`) : navigate('/admin/dashboard/content/main-visual/detail/new')} />} />
      <Route path="content/main-visual/detail/:id" element={<MainVisualDetail onBack={() => navigate('/admin/dashboard/content/main-visual')} />} />
      <Route path="system/seo" element={<SEOManagement />} />
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
