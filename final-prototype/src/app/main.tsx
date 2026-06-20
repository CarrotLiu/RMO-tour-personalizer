import React from 'react';import{createRoot}from'react-dom/client';import App from './App';import '../styles/global.css';
function updateViewportHeight(){const h=window.visualViewport?.height||window.innerHeight;document.documentElement.style.setProperty('--app-height',`${h}px`)}
updateViewportHeight();window.addEventListener('resize',updateViewportHeight);window.visualViewport?.addEventListener('resize',updateViewportHeight);
createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);
