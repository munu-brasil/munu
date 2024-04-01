import React from 'react';
import * as ReactDOMClient from 'react-dom/client';
import * as Sentry from '@sentry/react';
import App from './App';

Sentry.init({
  dsn: process.env.APP_DSN_SENTRY,
  integrations: [],
  enabled: ['development', 'test'].indexOf(process.env.NODE_ENV ?? '') === -1,
});

const container = document.getElementById('app');
const root = ReactDOMClient.createRoot(container!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
