import React from 'react';

const InquiryDetail: React.FC<{ id: number, onBack: () => void }> = ({ id, onBack }) => {
  return (
    <div className="card">
      <button onClick={onBack} style={{ marginBottom: '15px' }}>목록으로</button>
      <h3>문의 상세 보기 (ID: {id})</h3>
      <div style={{ marginTop: '20px', padding: '15px', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
        <p><strong>작성자:</strong> 홍길동</p>
        <p><strong>내용:</strong> 시공 관련해서 문의 드립니다...</p>
      </div>
    </div>
  );
};

export default InquiryDetail;
