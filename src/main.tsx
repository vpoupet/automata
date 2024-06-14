import React from 'react'
import ReactDOM from 'react-dom/client'
// import App from './App.tsx'

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import App from '../src/edition/App.jsx'

import './index.css'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
