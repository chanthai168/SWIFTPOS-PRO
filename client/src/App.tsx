
import AppRoutes from "./routes/AppRoutes"
import { useEffect } from "react"
import { useAuth0 } from "@auth0/auth0-react"
import { setTokenGetter } from "./services/api"



import { UserProvider } from "./context/Context"
function App() {
  const { getAccessTokenSilently } = useAuth0();
  
  useEffect(() => {
    // Pass the function to Axios on mount
    setTokenGetter(getAccessTokenSilently);
  }, [getAccessTokenSilently]);

  return(
    <>
    <UserProvider>
      <AppRoutes/>
    </UserProvider>
    </>
  )

}

export default App
