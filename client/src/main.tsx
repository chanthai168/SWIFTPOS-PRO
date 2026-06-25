import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'
import { Auth0Provider } from '@auth0/auth0-react'
import { useNavigate } from 'react-router-dom'

const Auth0ProviderWithRedirect = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();

  return (
    <Auth0Provider
      domain="dev-llanmo0vjzizviex.us.auth0.com"
      clientId="N0BiLxTAI3rU6944JLoSr7Ft90n7HC2l"
      authorizationParams={{
        redirect_uri: import.meta.env.VITE_AUTH0_REDIRECT_URI || 'http://localhost:5173',
      }}
      onRedirectCallback={(appState) => {
        navigate(appState?.returnTo || "/dashboard");
      }}
    >
      {children}
    </Auth0Provider>
  );
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Auth0ProviderWithRedirect>
        <App />
      </Auth0ProviderWithRedirect>
    </BrowserRouter>
  </StrictMode>,
)
