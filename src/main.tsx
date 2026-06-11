import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Standalone callback interceptor for OAuth popups
if (window.opener && (window.location.hash.includes('access_token') || window.location.search.includes('code='))) {
  window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS' }, window.location.origin);
  window.close();
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
