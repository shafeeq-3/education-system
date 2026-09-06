// API Configuration
const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
  console.error('⚠️ VITE_API_URL is not defined! Please check your .env file.');
}

export const config = {
  apiUrl: API_URL || 'https://education-system-gilt.vercel.app/api/v1',
  baseURL: API_URL || 'https://education-system-gilt.vercel.app/api/v1',
};

export default config;
