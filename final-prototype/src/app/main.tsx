import React from 'react';import{createRoot}from'react-dom/client';import App from './App';import{setStableAppHeight}from'./viewportHeight';import '../styles/global.css';
setStableAppHeight();
createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);
