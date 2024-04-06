import React from 'react';
import * as ReactDOMClient from 'react-dom/client';
import * as Sentry from '@sentry/react';
import App from './App';

Sentry.init({
  dsn: import.meta.env.APP_DSN_SENTRY,
  integrations: [],
  enabled:
    ['development', 'test'].indexOf(import.meta.env.NODE_ENV ?? '') === -1,
});

const container = document.getElementById('app');
const root = ReactDOMClient.createRoot(container!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
