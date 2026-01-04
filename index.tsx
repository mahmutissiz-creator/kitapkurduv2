
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './style.css'; // Stil dosyasını dahil et

import { LazyMotion, domMax } from "framer-motion"

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <LazyMotion features={domMax} strict>
      <App />
    </LazyMotion>
  </React.StrictMode>
);
