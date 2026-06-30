import React from 'react';

const ResponsiveBanners: React.FC = () => {
  return (
    <div style={{ position: 'relative' }}>
      {/* Desktop Layout - Main Visual + Ad Banner */}
      <div className="desktop-only" style={{ display: 'flex', gap: '20px', height: '400px' }}>
        <div style={{ flex: '3 1 0%', backgroundColor: '#e2e8f0', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
          Main Visual Banner
        </div>
        <div style={{ flex: '1 1 0%', backgroundColor: '#f1f5f9', borderRadius: '16px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
          Ad Banner
          <div style={{ position: 'absolute', bottom: '15px', right: '15px', backgroundColor: 'rgba(0, 0, 0, 0.5)', color: 'white', padding: '4px 8px', borderRadius: '12px', fontSize: '0.8rem' }}>
            1 / 10
          </div>
        </div>
      </div>

      {/* Mobile Layout - Mobile Ad Banner */}
      <div className="mobile-only" style={{ 
        width: '100%', 
        height: '102px', 
        backgroundColor: 'rgb(241, 245, 249)', 
        borderRadius: '16px', 
        position: 'relative', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        color: 'rgb(100, 116, 139)',
        textAlign: 'center'
      }}>
        <div>Ad Banner (Mobile)</div>
        <div style={{ position: 'absolute', bottom: '10px', right: '10px', backgroundColor: 'rgba(0, 0, 0, 0.5)', color: 'white', padding: '2px 6px', borderRadius: '8px', fontSize: '0.7rem' }}>
          1 / 10
        </div>
      </div>
    </div>
  );
};

export default ResponsiveBanners;
