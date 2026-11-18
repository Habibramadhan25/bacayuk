import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { initLocalStorage } from './lib/mockData'

// Inisialisasi awal mock data ke local storage
initLocalStorage()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

