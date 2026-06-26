import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, GripVertical, Trash2 } from 'lucide-react';

// 공통 스타일
const SELECT_STYLE = { 
  padding: '10px 32px 10px 16px', // 우측에 여백을 주어 화살표와 겹치지 않게
  borderRadius: '8px', 
  border: '1px solid #cbd5e1', 
  backgroundColor: 'white', 
  fontSize: '0.9rem', 
  outline: 'none', 
  cursor: 'pointer', 
  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  appearance: 'none', // 기본 화살표 숨김
  backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'16\' height=\'16\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%2364748b\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'%3E%3C/polyline%3E%3C/svg%3E")',
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 10px center',
};

// ... 나머지 InquiryList 컴포넌트 로직은 유지하고 스타일만 업데이트
