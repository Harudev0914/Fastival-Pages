import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useParams } from 'react-router-dom';
import React from 'react';
import { ScrollToTop } from './components/ScrollToTop';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminError from './pages/AdminError';
import Home from './pages/Home';
import ProtectedRoute from './components/ProtectedRoute';
import MobileRestrictionOverlay from './components/MobileRestrictionOverlay';
import InquiryList from './pages/Inquiry/InquiryList';
import InquiryDetail from './pages/Inquiry/InquiryDetail';
import ConstructionInquiry from './pages/ConstructionInquiry';
import ConstructionInquirySettings from './pages/ConstructionInquirySettings';
import ConstructionCategoryManagement from './pages/Content/Construction/ConstructionCategoryManagement';
import ConstructionCategoryDetail from './pages/Content/Construction/ConstructionCategoryDetail';
import ConstructionReviewManagement from './pages/Content/Construction/ConstructionReviewManagement';
import ConstructionReviewDetail from './pages/Content/Construction/ConstructionReviewDetail';
import ConstructionPortfolioManagement from './pages/Content/Construction/ConstructionPortfolioManagement';
import ConstructionPortfolioDetail from './pages/Content/Construction/ConstructionPortfolioDetail';
import ConstructionChatbotManagement from './pages/Content/Construction/ConstructionChatbotManagement';
import ConstructionChatbotDetail from './pages/Content/Construction/ConstructionChatbotDetail';
import MainVisualManagement from './pages/MainVisual/MainVisualManagement';
import MainVisualBannerDetail from './pages/MainVisual/MainVisualDetail';
import RentalBrandManagement from './pages/Rental/admin/RentalBrandManagement';
import RentalBrandDetail from './pages/Rental/admin/RentalBrandDetail';
import RentalCategoryManagement from './pages/Rental/admin/RentalCategoryManagement';
import RentalCategoryDetail from './pages/Rental/admin/RentalCategoryDetail';
import RentalProductManagement from './pages/Rental/admin/RentalProductManagement';
import RentalProductDetail from './pages/Rental/admin/RentalProductDetail';
import RentalOrderManagement from './pages/Rental/admin/RentalOrderManagement';
import RentalOrderDetail from './pages/Rental/admin/RentalOrderDetail';
import RentalPurchaseManagement from './pages/Rental/admin/RentalPurchaseManagement';
import RentalPurchaseDetail from './pages/Rental/admin/RentalPurchaseDetail';
import ClientLayout from './components/ClientLayout';
import { InfoPage } from './pages/PlaceholderPages';
import ReviewDetailPage from './pages/ReviewDetail/ReviewDetailPage';
import PortfolioPage from './pages/Portfolio/PortfolioPage';
import RentalPage from './pages/Rental/RentalPage';
import RentalProductDetailPublic from './pages/Rental/RentalProductDetailPublic';
import RentalInquiryPage from './pages/Rental/RentalInquiryPage';
import RentalProductListPage from './pages/Rental/RentalProductListPage';

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

import DashboardHome from './pages/Content/DashboardHome';

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

      {/* 메인 비주얼 관리 */}
      <Route path="main-visuals" element={<MainVisualManagement />} />
      <Route path="main-visuals/detail/:id" element={<MainVisualBannerDetail />} />

      {/* 렌탈 관리 */}
      <Route path="rental/brands" element={<RentalBrandManagement />} />
      <Route path="rental/brands/detail/:id" element={<RentalBrandDetail />} />
      <Route path="rental/categories" element={<RentalCategoryManagement />} />
      <Route path="rental/categories/detail/:id" element={<RentalCategoryDetail />} />
      <Route path="rental/products" element={<RentalProductManagement />} />
      <Route path="rental/products/detail/:id" element={<RentalProductDetail />} />
      <Route path="rental/orders" element={<RentalOrderManagement />} />
      <Route path="rental/orders/detail/:id" element={<RentalOrderDetail />} />
      <Route path="rental/purchases" element={<RentalPurchaseManagement />} />
      <Route path="rental/purchases/detail/:id" element={<RentalPurchaseDetail />} />
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
          <Route path="/rental/product/:id" element={<RentalProductDetailPublic />} />
          <Route path="/rental/inquiry" element={<RentalInquiryPage />} />
          <Route path="/rental/best" element={<RentalProductListPage />} />
          <Route path="/rental/exclusive" element={<RentalProductListPage />} />
          <Route path="/rental/event" element={<RentalProductListPage />} />
          <Route path="/rental/*" element={<RentalPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
