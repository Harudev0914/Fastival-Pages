import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useParams } from 'react-router-dom';
import React from 'react';
import { ScrollToTop } from './components/ScrollToTop';
import RouteLoadingBar from './components/RouteLoadingBar';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminError from './pages/AdminError';
import Home from './pages/Home';
import ProtectedRoute from './components/ProtectedRoute';
import MobileRestrictionOverlay from './components/MobileRestrictionOverlay';
import InquiryList from './pages/admin/inquiry/InquiryList';
import InquiryDetail from './pages/admin/inquiry/InquiryDetail';
import ConstructionInquiry from './pages/ConstructionInquiry';
import ConstructionInquirySettings from './pages/ConstructionInquirySettings';
import ConstructionCategoryManagement from './pages/admin/construction/ConstructionCategoryManagement';
import ConstructionCategoryDetail from './pages/admin/construction/ConstructionCategoryDetail';
import ConstructionReviewManagement from './pages/admin/construction/ConstructionReviewManagement';
import ConstructionReviewDetail from './pages/admin/construction/ConstructionReviewDetail';
import ConstructionPortfolioManagement from './pages/admin/construction/ConstructionPortfolioManagement';
import ConstructionPortfolioDetail from './pages/admin/construction/ConstructionPortfolioDetail';
import ConstructionChatbotManagement from './pages/admin/construction/ConstructionChatbotManagement';
import ConstructionChatbotDetail from './pages/admin/construction/ConstructionChatbotDetail';
import MainVisualManagement from './pages/admin/main-visual/MainVisualManagement';
import MainVisualBannerDetail from './pages/admin/main-visual/MainVisualDetail';
import RentalBrandManagement from './pages/admin/rental/RentalBrandManagement';
import RentalBrandDetail from './pages/admin/rental/RentalBrandDetail';
import RentalCategoryManagement from './pages/admin/rental/RentalCategoryManagement';
import RentalCategoryDetail from './pages/admin/rental/RentalCategoryDetail';
import RentalProductManagement from './pages/admin/rental/RentalProductManagement';
import RentalProductDetail from './pages/admin/rental/RentalProductDetail';
import RentalOrderManagement from './pages/admin/rental/RentalOrderManagement';
import RentalOrderDetail from './pages/admin/rental/RentalOrderDetail';
import RentalPurchaseManagement from './pages/admin/rental/RentalPurchaseManagement';
import RentalPurchaseDetail from './pages/admin/rental/RentalPurchaseDetail';
import ClientLayout from './components/ClientLayout';
import { InfoPage } from './pages/PlaceholderPages';
import ReviewDetailPage from './pages/ReviewDetail/ReviewDetailPage';
import PortfolioPage from './pages/Portfolio/PortfolioPage';
import RentalPage from './pages/Rental/RentalPage';
import RentalProductDetailPublic from './pages/Rental/RentalProductDetailPublic';
import RentalInquiryPage from './pages/Rental/RentalInquiryPage';
import RentalProductListPage from './pages/Rental/RentalProductListPage';
import RentalCategoriesPage from './pages/Rental/RentalCategoriesPage';
import PaymentSuccess from './pages/Rental/PaymentSuccess';
import PaymentFail from './pages/Rental/PaymentFail';
import SearchPage from './pages/SearchPage';
import DjPage from './pages/Dj/DjPage';
import DjApplyPage from './pages/Dj/DjApplyPage';
import DjArtistsPage from './pages/Dj/DjArtistsPage';
import DjCalendarPage from './pages/Dj/DjCalendarPage';
import DjReviewsPage from './pages/Dj/DjReviewsPage';
import LoginPage from './pages/Auth/LoginPage';
import EmailLoginPage from './pages/Auth/EmailLoginPage';
import SignupPage from './pages/Auth/SignupPage';
import GeneralSignupPage from './pages/Auth/GeneralSignupPage';
import CustomerCenterPage from './pages/CustomerCenter/CustomerCenterPage';
import DjArtistManagement from './pages/admin/dj/DjArtistManagement';
import DjArtistDetail from './pages/admin/dj/DjArtistDetail';
import TermsManagement from './pages/admin/terms/TermsManagement';
import TermsDetail from './pages/admin/terms/TermsDetail';
import AdminUserManagement from './pages/admin/system/AdminUserManagement';
import DepartmentManagement from './pages/admin/system/DepartmentManagement';
import DepartmentPermissions from './pages/admin/system/DepartmentPermissions';
import CompanyInfoManagement from './pages/admin/system/CompanyInfoManagement';

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

import DashboardHome from './pages/admin/DashboardHome';

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
      <Route path="rental/categories/sub/:parentId" element={<RentalCategoryManagement />} />
      <Route path="rental/categories/detail/:id" element={<RentalCategoryDetail />} />
      <Route path="rental/products" element={<RentalProductManagement />} />
      <Route path="rental/products/detail/:id" element={<RentalProductDetail />} />
      <Route path="rental/exclusive" element={<RentalProductManagement mode="exclusive" />} />
      <Route path="rental/events" element={<RentalProductManagement mode="event" />} />

      {/* DJ 관리 */}
      <Route path="dj/artists" element={<DjArtistManagement />} />
      <Route path="dj/artists/detail/:id" element={<DjArtistDetail />} />

      {/* 약관 관리 */}
      <Route path="terms/service" element={<TermsManagement type="service" />} />
      <Route path="terms/service/detail/:id" element={<TermsDetail type="service" />} />
      <Route path="terms/privacy" element={<TermsManagement type="privacy" />} />
      <Route path="terms/privacy/detail/:id" element={<TermsDetail type="privacy" />} />

      {/* 환경설정 */}
      <Route path="system/admins" element={<AdminUserManagement />} />
      <Route path="system/departments" element={<DepartmentManagement />} />
      <Route path="system/permissions" element={<DepartmentPermissions />} />
      <Route path="system/company" element={<CompanyInfoManagement />} />
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
      <RouteLoadingBar />
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
        
        <Route path="/search" element={<SearchPage />} />

        <Route element={<ClientLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/construction-inquiry" element={<ConstructionInquiry />} />
          <Route path="/portfolio" element={<PortfolioPage />} />
          <Route path="/info" element={<InfoPage />} />
          <Route path="/reviews" element={<ReviewDetailPage />} />
          <Route path="/rental" element={<RentalPage />} />
          <Route path="/rental/product/:id" element={<RentalProductDetailPublic />} />
          <Route path="/rental/categories" element={<RentalCategoriesPage />} />
          <Route path="/rental/inquiry" element={<RentalInquiryPage />} />
          <Route path="/rental/payment/success" element={<PaymentSuccess />} />
          <Route path="/rental/payment/fail" element={<PaymentFail />} />
          <Route path="/rental/best" element={<RentalProductListPage />} />
          <Route path="/rental/exclusive" element={<RentalProductListPage />} />
          <Route path="/rental/event" element={<RentalProductListPage />} />
          <Route path="/rental/*" element={<RentalPage />} />
          <Route path="/dj" element={<DjPage />} />
          <Route path="/dj/apply" element={<DjApplyPage />} />
          <Route path="/dj/artists" element={<DjArtistsPage />} />
          <Route path="/dj/calendar" element={<DjCalendarPage />} />
          <Route path="/dj/reviews" element={<DjReviewsPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/login/email" element={<EmailLoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/signup/general" element={<GeneralSignupPage />} />
          <Route path="/cs" element={<CustomerCenterPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
