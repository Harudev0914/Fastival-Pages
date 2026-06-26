import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

interface MainVisual {
  id: number;
  bg_type: string;
  bg_src: string;
  main_text: string;
  font_family: string;
}

const Home: React.FC = () => {
  const [visuals, setVisuals] = useState<MainVisual[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVisuals = async () => {
      // 공식 인증 및 RLS 고려한 조회
      const { data, error } = await supabase
        .from('main_visuals')
        .select('*')
        .order('id', { ascending: true }); // 'display_order' 대신 'id' 사용
        
      if (!error && data) setVisuals(data);
      setLoading(false);
    };
    fetchVisuals();
  }, []);

  if (loading) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>;

  return (
    <div style={{ height: '100vh', overflow: 'hidden' }}>
      {visuals.map(v => (
        <div key={v.id} style={{ 
          height: '100%', 
          backgroundImage: v.bg_type === 'image' ? `url(${v.bg_src})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: v.font_family
        }}>
          <h1 style={{ fontSize: '4rem', color: 'white', textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>{v.main_text}</h1>
        </div>
      ))}
    </div>
  );
};

export default Home;
