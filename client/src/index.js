import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter as Router } from 'react-router-dom'
import { CookiesProvider } from 'react-cookie'
import './index.css'
import App from './App'

ReactDOM.render(
  <React.StrictMode>
    <CookiesProvider>
    <Router>
      <App />
    </Router>
    </CookiesProvider>
  </React.StrictMode>,
  document.getElementById('root')
)
