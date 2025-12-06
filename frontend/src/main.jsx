import { GoogleOAuthProvider } from '@react-oauth/google';
import {BrowserRouter} from 'react-router-dom'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import ShopContextProvider from './context/ShopContext.jsx'

createRoot(document.getElementById('root')).render(
  <GoogleOAuthProvider clientId ="580999386728-ka4iclfs2aigp3ov74cuhnnvbqqt073u.apps.googleusercontent.com" >
    <BrowserRouter>
      <ShopContextProvider>
        <App />
      </ShopContextProvider>
    </BrowserRouter>
  </GoogleOAuthProvider>
)
