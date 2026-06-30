import React, { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SearchPage: React.FC = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    const handleEsc = (e: KeyboardEvent) => {
        if (e.key === 'Escape') navigate(-1);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [navigate]);

  return (
    <div className="search-page">
      <div className="search-header">
        <button onClick={() => navigate(-1)} className="close-btn"><X /></button>
        <div className="search-input-wrapper">
          <Search size={20} color="#94a3b8" />
          <input 
            ref={inputRef}
            type="text" 
            placeholder="통합검색" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="search-input"
          />
          {query && <button onClick={() => setQuery('')} className="clear-btn"><X size={16} /></button>}
        </div>
      </div>
      <div className="search-results">
        {/* Results will go here */}
      </div>
      <style>{`
        .search-page { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-color: white; z-index: 2000; padding: 20px; }
        .search-header { display: flex; align-items: center; gap: 15px; padding-bottom: 20px; border-bottom: 1px solid #e2e8f0; }
        .close-btn { background: none; border: none; cursor: pointer; }
        .search-input-wrapper { flex: 1; display: flex; align-items: center; background-color: #f1f5f9; border-radius: 50px; padding: 10px 20px; }
        .search-input { flex: 1; border: none; background: transparent; margin-left: 10px; font-size: 16px; outline: none; }
        .clear-btn { background: #cbd5e1; border: none; border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: white; }
        .search-results { padding-top: 20px; }
      `}</style>
    </div>
  );
};

export default SearchPage;
