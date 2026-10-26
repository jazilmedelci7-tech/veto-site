import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { ToastProvider } from './ui'
import { palette, site } from './site'
import './index.css'

// Couleur du client appliquée avant l'affichage
for (const [k, v] of Object.entries(palette(site.couleur))) document.documentElement.style.setProperty(k, v)
document.title = site.titre

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode><BrowserRouter><ToastProvider><App /></ToastProvider></BrowserRouter></React.StrictMode>
)
