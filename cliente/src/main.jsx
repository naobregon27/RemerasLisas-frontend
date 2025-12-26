import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import store from './redux/store'
import App from './App.jsx'
// Importamos los estilos CSS que incluyen Tailwind
import './index.css'
// Importar utilidades de debug (disponibles en window.debugAuth, window.verifyToken, window.clearAuth)
import './utils/authDebug.js'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </StrictMode>,
)
