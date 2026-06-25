import React from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactElement;
}

// 인증 여부를 확인하여 대시보드 접근을 제한하는 컴포넌트
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return <Navigate to="/admin/error" replace />;
  }
  
  return children;
};

export default ProtectedRoute;
