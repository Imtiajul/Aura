import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Standalone callback interceptor for OAuth popups
if (window.opener && (window.location.hash.includes('access_token') || window.location.search.includes('code='))) {
  const hash = window.location.hash.substring(1);
  const params = new URLSearchParams(hash);
  const accessToken = params.get('access_token');
  const refreshToken = params.get('refresh_token');

  window.opener.postMessage(
    { 
      type: 'OAUTH_AUTH_SUCCESS',
      access_token: accessToken,
      refresh_token: refreshToken
    }, 
    window.location.origin
  );
  window.close();
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
