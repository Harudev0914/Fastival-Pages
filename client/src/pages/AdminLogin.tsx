import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard } from 'lucide-react';
import './AdminLogin.css';

const AdminLogin: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    console.log('Login attempt started for:', username);
    try {
      const response = await axios.post('http://localhost:3000/api/login', { username, password });
      console.log('Login success:', response.data);
      localStorage.setItem('token', response.data.token);
      navigate('/admin/dashboard');
    } catch (err: any) {
      console.error('Login error details:', err.response || err);
      setError('계정 정보가 올바르지 않습니다.');
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-box">
        <div className="logo-area">
          <LayoutDashboard size={60} color="#00a8a8" />
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
