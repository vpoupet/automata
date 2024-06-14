import React from 'react'
import ReactDOM from 'react-dom/client'
// import App from './App.tsx'
import App from '../src/edition/App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
