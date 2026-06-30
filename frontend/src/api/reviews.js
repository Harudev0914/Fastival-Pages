const API_BASE = 'http://localhost:3000/api';

export const fetchSummary = async (storeId) => {
  const res = await fetch(`${API_BASE}/store/${storeId}/summary`);
  return res.json();
};

export const fetchKeywords = async (storeId) => {
  const res = await fetch(`${API_BASE}/store/${storeId}/keywords`);
  return res.json();
};

export const fetchReviews = async (storeId, page = 1) => {
  const res = await fetch(`${API_BASE}/store/${storeId}/reviews?page=${page}&pageSize=3`);
  return res.json();
};
