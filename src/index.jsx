// src/index.jsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles.css';

// Only call createRoot once
const root = createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);