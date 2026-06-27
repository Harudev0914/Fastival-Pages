import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
import ConstructionInquirySettings from './pages/ConstructionInquirySettings';
import MainVisualList from './pages/Content/MainVisual/MainVisualList';
import MainVisualDetail from './pages/Content/MainVisual/MainVisualDetail';

function AdminRouteWrapper({ children }: { children: React.ReactNode }) {
  return (
    <>
      <MobileRestrictionOverlay />
      {children}
    </>
  );
}

function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <Router>
      <Routes>
        {/* Admin Routes - No Splash */}
        <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/error" element={<AdminError />} />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <AdminRouteWrapper>
                <AdminDashboard />
              </AdminRouteWrapper>
            </ProtectedRoute>
          }
        >
          <Route path="inquiries" element={<InquiryList onViewDetail={(id) => console.log(id)} />} />
          <Route path="inquiry-settings" element={<ConstructionInquirySettings />} />
          <Route path="categories" element={<CategoryManagement />} />
          <Route path="products" element={<ProductManagement />} />
          <Route path="content/main-visual" element={<MainVisualList onEdit={() => {}} />} />
          <Route path="content/main-visual/detail/:id" element={<MainVisualDetail id={0} onBack={() => {}} onSave={() => {}} />} />
        </Route>

        {/* Home Route - With Splash */}
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
