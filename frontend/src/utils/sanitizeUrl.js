import axiosInstance from './axiosInstance';

export const sanitizeImageUrl = (url) => {
  if (!url) return '';
  const baseUrl = axiosInstance.defaults.baseURL || 'https://easyloan.onrender.com';
  const patterns = [
    'http://localhost:3000',
    'https://localhost:3000',
    'https://easyloan-1.onrender.com'
  ];
  let sanitized = url;
  patterns.forEach(pattern => {
    sanitized = sanitized.replaceAll(pattern, baseUrl);
  });
  return sanitized;
};
