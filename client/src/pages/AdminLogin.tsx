import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import Seo from '../components/Seo';
import './AdminLogin.css';

const AdminLogin: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      // 아이디를 유효 이메일로 정규화: 'klipse@admin' → 'klipse@admin.com', 'klipse' → 'klipse@klipse.com'
      let email = username.trim();
      if (email && !email.includes('@')) email = `${email}@klipse.com`;
      else if (/@/.test(email) && !/@[^@]+\.[^@]+$/.test(email)) email = `${email}.com`;

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: password,
      });

      if (error) {
        throw error;
      }

      console.log('Login success:', data);
      navigate('/admin/dashboard');
    } catch (err: unknown) {
      console.error('Login error:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Login failed. Please check your credentials.');
      }
    }
  };

  return (
    <div className="login-wrapper">
      <Seo title="관리자 로그인" noindex />
      <div className="login-box">
        <div className="logo-area">
          <img src="/Klipse_Logo.png" alt="Klipse" style={{ height: '40px' }} />
        </div>
        <form onSubmit={handleLogin}>
          <input 
            type="text" 
            placeholder="계정" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
          />
          <input 
            type="password" 
            placeholder="비밀번호" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
          />
          {error && <div className="error-message">{error}</div>}
          <button type="submit">로그인</button>
        </form>
        <div className="check-area">
          <label>
            <input type="checkbox" /> 계정 저장
          </label>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
