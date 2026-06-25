import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { MotionConfig } from 'motion/react';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <HelmetProvider>
    <BrowserRouter>
      <MotionConfig transition={{ duration: 0.3, ease: 'easeInOut' }}>
        <App />
      </MotionConfig>
    </BrowserRouter>
  </HelmetProvider>
);
