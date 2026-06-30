import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useParams } from 'react-router-dom';
import React from 'react';
import { ScrollToTop } from './components/ScrollToTop';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminError from './pages/AdminError';
import Home from './pages/Home';
import ProtectedRoute from './components/ProtectedRoute';
import MobileRestrictionOverlay from './components/MobileRestrictionOverlay';
import CategoryManagement from './pages/Content/Rental/CategoryManagement';
import ProductManagement from './pages/Content/Rental/ProductManagement';
import InquiryList from './pages/Inquiry/InquiryList';
import InquiryDetail from './pages/Inquiry/InquiryDetail';
import ConstructionInquiry from './pages/ConstructionInquiry';
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
import ConstructionCategoryManagement from './pages/Content/Construction/ConstructionCategoryManagement';
import ConstructionCategoryDetail from './pages/Content/Construction/ConstructionCategoryDetail';
import ConstructionReviewManagement from './pages/Content/Construction/ConstructionReviewManagement';
import ConstructionReviewDetail from './pages/Content/Construction/ConstructionReviewDetail';
import ConstructionPortfolioManagement from './pages/Content/Construction/ConstructionPortfolioManagement';
import ConstructionPortfolioDetail from './pages/Content/Construction/ConstructionPortfolioDetail';
import ConstructionChatbotManagement from './pages/Content/Construction/ConstructionChatbotManagement';
import ConstructionChatbotDetail from './pages/Content/Construction/ConstructionChatbotDetail';
import ClientLayout from './components/ClientLayout';
import { InfoPage } from './pages/PlaceholderPages';
import ReviewDetailPage from './pages/ReviewDetail/ReviewDetailPage';
import PortfolioPage from './pages/Portfolio/PortfolioPage';
import RentalPage from './pages/Rental/RentalPage';

function AdminRouteWrapper({ children }: { children: React.ReactNode }) {
  return (
    <>
      <MobileRestrictionOverlay />
      {children}
    </>
  );
}

function InquiryDetailWrapper() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  return <InquiryDetail id={Number(id)} onBack={() => navigate('/admin/dashboard/inquiries')} />;
}

import AdminManagement from './pages/Content/System/AdminManagement';
import { FaviconManagement, LogoManagement } from './pages/Content/System/MediaManagement';
import SEOManagement from './pages/Content/System/SEOManagement';

import DashboardHome from './pages/Content/DashboardHome';

function MainVisualDetailWrapper() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  return <MainVisualDetail id={id === 'new' ? undefined : Number(id)} onBack={() => navigate('/admin/dashboard/content/main-visual')} />;
}


function AdminContent() {
  const navigate = useNavigate();
  return (
    <Routes>
      <Route path="/" element={<DashboardHome />} />
      <Route path="inquiries" element={<InquiryList onViewDetail={(id) => navigate(`/admin/dashboard/inquiries/detail/${id}`)} />} />
      <Route path="inquiries/detail/:id" element={<InquiryDetailWrapper />} />
      <Route path="inquiry-settings" element={<ConstructionInquirySettings />} />

      {/* 시공 관리 */}
      <Route path="construction/categories" element={<ConstructionCategoryManagement />} />
      <Route path="construction/categories/detail/:id" element={<ConstructionCategoryDetail />} />
      <Route path="construction/reviews" element={<ConstructionReviewManagement />} />
      <Route path="construction/reviews/detail/:id" element={<ConstructionReviewDetail />} />
      <Route path="construction/portfolio" element={<ConstructionPortfolioManagement />} />
      <Route path="construction/portfolio/detail/:id" element={<ConstructionPortfolioDetail />} />
      <Route path="construction/chatbot" element={<ConstructionChatbotManagement />} />
      <Route path="construction/chatbot/detail/:id" element={<ConstructionChatbotDetail />} />
      <Route path="categories" element={<CategoryManagement />} />
      <Route path="products" element={<ProductManagement />} />
      <Route path="system/admins" element={<AdminManagement />} />
      <Route path="system/favicon" element={<FaviconManagement />} />
      <Route path="system/logo" element={<LogoManagement />} />
      <Route path="system/seo" element={<SEOManagement />} />

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
      <Route path="content/main-visual/detail/:id" element={<MainVisualDetailWrapper />} />
      <Route path="content/main-visual/detail/new" element={<MainVisualDetailWrapper />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <ScrollToTop />
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
        
        <Route element={<ClientLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/construction-inquiry" element={<ConstructionInquiry />} />
          <Route path="/portfolio" element={<PortfolioPage />} />
          <Route path="/info" element={<InfoPage />} />
          <Route path="/reviews" element={<ReviewDetailPage />} />
          <Route path="/rental" element={<RentalPage />} />
          <Route path="/rental/*" element={<RentalPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
