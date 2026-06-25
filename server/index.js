require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key';
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// 임시 디버그 API: 비밀번호 해시 생성 및 검증 확인
app.get('/debug-verify', (req, res) => {
  const password = 'admin1234';
  try {
    const hash = bcrypt.hashSync(password, 10);
    const isMatch = bcrypt.compareSync(password, hash);
    
    res.json({ 
      info: "Use this hash to update your database",
      newHash: hash, 
      isMatch: isMatch,
      verificationPassword: password
    });
  } catch (err) { res.json({ error: err.message }); }
});

// 서버 상태 확인 API
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// 관리자 로그인 및 DB 검증 API
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  console.log(`[DEBUG] Login attempt for: '${username}'`);

  // 임시 하드코딩된 어드민 계정 로그인 허용 (사용자 요청)
  if (username === 'admin' && password === 'admin1234') {
    console.log(`[DEBUG] Hardcoded admin login successful`);
    const token = jwt.sign({ id: 1, username: 'admin' }, JWT_SECRET, { expiresIn: '1h' });
    return res.json({ token });
  }

  try {
    const { data: admin, error } = await supabase
      .from('admins')
      .select('*')
      .eq('username', username)
      .single();

    if (error || !admin) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    const isMatch = await bcrypt.compare(password, admin.password_hash);
    
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    const token = jwt.sign({ id: admin.id, username: admin.username }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});
