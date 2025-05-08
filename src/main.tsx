
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Add global styles to fix overflow issues
const style = document.createElement('style');
style.textContent = `
  body {
    overflow-x: hidden;
    height: 100%;
  }
  html {
    height: 100%;
  }
  #root {
    min-height: 100%;
    display: flex;
    flex-direction: column;
  }
  .main-content {
    flex: 1;
  }
`;
document.head.appendChild(style);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
