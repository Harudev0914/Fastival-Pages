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
import RentalShipmentManagement from './pages/admin/rental/RentalShipmentManagement';
import RentalShipmentDetail from './pages/admin/rental/RentalShipmentDetail';
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
import TermsViewPage from './pages/Terms/TermsViewPage';
import Placeholder from './pages/common/Placeholder';
import MyPage from './pages/MyPage/MyPage';
import DjArtistManagement from './pages/admin/dj/DjArtistManagement';
import DjArtistDetail from './pages/admin/dj/DjArtistDetail';
import TermsManagement from './pages/admin/terms/TermsManagement';
import TermsDetail from './pages/admin/terms/TermsDetail';
import RentalCalendar from './pages/admin/rental/RentalCalendar';
import ConstructionCalendar from './pages/admin/construction/ConstructionCalendar';
import ConstructionCompanyManagement from './pages/admin/construction/ConstructionCompanyManagement';
import ConstructionCompanyDetail from './pages/admin/construction/ConstructionCompanyDetail';
import ConstructionWorkManagement from './pages/admin/construction/ConstructionWorkManagement';
import ConstructionWorkDetail from './pages/admin/construction/ConstructionWorkDetail';
import EstimateHub from './pages/admin/estimate/EstimateHub';
import EstimateDetail from './pages/admin/estimate/EstimateDetail';
import DjList from './pages/admin/dj/DjList';
import DjEventInquiryManagement from './pages/admin/dj/DjEventInquiryManagement';
import DjEventInquiryDetail from './pages/admin/dj/DjEventInquiryDetail';
import DjEventCalendar from './pages/admin/dj/DjEventCalendar';
// 차트(Recharts) 사용 페이지 — 코드 스플리팅으로 초기 번들에서 분리
const DjStats = React.lazy(() => import('./pages/admin/dj/DjStats'));
const ConstructionStats = React.lazy(() => import('./pages/admin/construction/ConstructionStats'));
const RentalStats = React.lazy(() => import('./pages/admin/rental/RentalStats'));
import ContractHub from './pages/admin/contract/ContractHub';
import ContractBuilder from './pages/admin/contract/ContractBuilder';
import SubscriptionMembers from './pages/admin/subscription/SubscriptionMembers';
import SubscriptionTiers from './pages/admin/subscription/SubscriptionTiers';
const SubscriptionStats = React.lazy(() => import('./pages/admin/subscription/SubscriptionStats'));
import AdminUserManagement from './pages/admin/system/AdminUserManagement';
import DepartmentManagement from './pages/admin/system/DepartmentManagement';
import DepartmentPermissions from './pages/admin/system/DepartmentPermissions';
import CompanyInfoManagement from './pages/admin/system/CompanyInfoManagement';
import NoticeManagement from './pages/admin/system/NoticeManagement';
import NoticeDetail from './pages/admin/system/NoticeDetail';

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

const DashboardHome = React.lazy(() => import('./pages/admin/DashboardHome'));

function AdminContent() {
  const navigate = useNavigate();
  return (
    <React.Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}><span style={{ width: '34px', height: '34px', borderRadius: '50%', border: '3px solid #e2e8f0', borderTopColor: '#008b8b', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} /><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>}>
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
      <Route path="dj/list" element={<DjList />} />
      <Route path="dj/artists" element={<DjArtistManagement />} />
      <Route path="dj/artists/detail/:id" element={<DjArtistDetail />} />
      <Route path="dj/event-inquiries" element={<DjEventInquiryManagement />} />
      <Route path="dj/event-inquiries/detail/:id" element={<DjEventInquiryDetail />} />
      <Route path="dj/calendar" element={<DjEventCalendar />} />
      <Route path="dj/stats" element={<DjStats />} />

      {/* 구독 관리 */}
      <Route path="subscriptions/members" element={<SubscriptionMembers />} />
      <Route path="subscriptions/tiers" element={<SubscriptionTiers />} />
      <Route path="subscriptions/stats" element={<SubscriptionStats />} />

      {/* 시공 - 업무/업체/캘린더/통계 */}
      <Route path="construction/works" element={<ConstructionWorkManagement />} />
      <Route path="construction/works/detail/:id" element={<ConstructionWorkDetail />} />
      <Route path="construction/companies" element={<ConstructionCompanyManagement />} />
      <Route path="construction/companies/detail/:id" element={<ConstructionCompanyDetail />} />
      <Route path="construction/calendar" element={<ConstructionCalendar />} />
      <Route path="construction/stats" element={<ConstructionStats />} />

      {/* 렌탈 - 내역 캘린더 / 통계 */}
      <Route path="rental/calendar" element={<RentalCalendar />} />
      <Route path="rental/stats" element={<RentalStats />} />

      {/* 견적서 관리 (페이지 내 시공/렌탈/DJ 탭) */}
      <Route path="estimates" element={<EstimateHub />} />
      <Route path="estimates/construction/detail/:id" element={<EstimateDetail type="construction" />} />
      <Route path="estimates/rental/detail/:id" element={<EstimateDetail type="rental" />} />
      <Route path="estimates/dj/detail/:id" element={<EstimateDetail type="dj" />} />

      {/* 계약서 관리 (페이지 내 시공/렌탈/DJ 탭) */}
      <Route path="contracts" element={<ContractHub />} />
      <Route path="contracts/new/:template" element={<ContractBuilder />} />
      <Route path="contracts/detail/:id" element={<ContractBuilder />} />

      {/* 약관 관리 */}
      <Route path="terms/service" element={<TermsManagement type="service" />} />
      <Route path="terms/service/detail/:id" element={<TermsDetail type="service" />} />
      <Route path="terms/privacy" element={<TermsManagement type="privacy" />} />
      <Route path="terms/privacy/detail/:id" element={<TermsDetail type="privacy" />} />

      {/* 사내 공지 */}
      <Route path="notices" element={<NoticeManagement />} />
      <Route path="notices/detail/:id" element={<NoticeDetail />} />

      {/* 환경설정 */}
      <Route path="system/admins" element={<AdminUserManagement />} />
      <Route path="system/departments" element={<DepartmentManagement />} />
      <Route path="system/permissions" element={<DepartmentPermissions />} />
      <Route path="system/company" element={<CompanyInfoManagement />} />
      <Route path="rental/orders" element={<RentalOrderManagement />} />
      <Route path="rental/orders/detail/:id" element={<RentalOrderDetail />} />
      <Route path="rental/purchases" element={<RentalPurchaseManagement />} />
      <Route path="rental/purchases/detail/:id" element={<RentalPurchaseDetail />} />
      <Route path="rental/shipments" element={<RentalShipmentManagement />} />
      <Route path="rental/shipments/detail/:id" element={<RentalShipmentDetail />} />
    </Routes>
    </React.Suspense>
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
          <Route path="/mypage" element={<MyPage />} />

          {/* 푸터 메뉴 */}
          <Route path="/company" element={<Placeholder title="회사 소개" desc="클립스(Klipse) 회사 소개 페이지입니다. 곧 오픈됩니다." seoKeywords="클립스,회사소개,Klipse" />} />
          <Route path="/partnership" element={<Placeholder title="제휴/광고 문의" desc="제휴 및 광고 문의 페이지입니다. 곧 오픈됩니다." seoKeywords="제휴 문의,광고 문의,클립스 제휴" />} />
          <Route path="/partner-guide" element={<Placeholder title="시공 파트너 안내" desc="시공 파트너(협력 업체) 안내 페이지입니다. 곧 오픈됩니다." seoKeywords="시공 파트너,협력 업체,시공 제휴" />} />
          <Route path="/terms/service" element={<TermsViewPage type="service" />} />
          <Route path="/terms/privacy" element={<TermsViewPage type="privacy" />} />
          <Route path="/terms/partner-privacy" element={<Placeholder title="파트너 개인정보 처리방침" desc="파트너 개인정보 처리방침 페이지입니다. 곧 오픈됩니다." seoKeywords="파트너 개인정보 처리방침" />} />
          {/* 레거시 경로 별칭 */}
          <Route path="/terms" element={<TermsViewPage type="service" />} />
          <Route path="/privacy" element={<TermsViewPage type="privacy" />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
