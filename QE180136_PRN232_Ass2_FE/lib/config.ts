const envUrl = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL;
export const API_URL = (
  envUrl && envUrl.trim().length > 0
    ? envUrl
    : 'https://tasktrack-api-qe180136.onrender.com'
).replace(/\/api\/?$/, '').replace(/\/$/, '');
