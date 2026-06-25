import React from 'react';

const AdminError: React.FC = () => (
  <div style={{ textAlign: 'center', marginTop: '50px' }}>
    <h1>접근 권한 없음</h1>
    <p>로그인이 필요합니다.</p>
    <a href="/admin/login">로그인 페이지로 이동</a>
  </div>
);

export default AdminError;
