import { useAuth0 } from "@auth0/auth0-react";
import { useUser } from "../context/Context";
import { Link } from "react-router-dom";
function Dashboard() {
  const {
    isLoading, // Loading state, the SDK needs to reach Auth0 on load
    isAuthenticated,
    error,
    loginWithRedirect: login, // Starts the login flow
    logout: auth0Logout, // Starts the logout flow
    user, // User profile
  } = useAuth0();

  const {userInfo,shop} = useUser();
  

  const signup = () =>
    login({ authorizationParams: { screen_hint: "signup" } });

  const logout = () =>
    auth0Logout({ logoutParams: { returnTo: window.location.origin } });

  if (isLoading) return "Loading...";

  return isAuthenticated ? (
    <>
      <p>Logged in as {user?.email}</p>

      <h1>User Profile</h1>

      <pre>{JSON.stringify(user, null, 2)}</pre>

      <button onClick={logout}>Logout</button>

      <div className=" text-xl bg-blue-100">
        <p>{userInfo?.name}</p>
        <p>{userInfo?.email}</p>
        <p>{userInfo?.role}</p>

        <p>shop name: {shop?.name}</p>
        <p>shop id: {shop?.id}</p>
      </div>
      <br></br>
      <Link to='/upload' className=" px-8 py-2 rounded-3xl bg-blue-600 text-white active:scale-125  ease-in-out">Upload product</Link>
      <Link to='/inventory' className=" px-8 py-2 rounded-3xl bg-blue-600 text-white active:scale-125  ease-in-out">Inventory Catalog</Link>
    </>
  ) : (
    <>
      {error && <p>Error: {error.message}</p>}

      <button onClick={signup}>Signup</button>

      <button onClick={() => login()}>Login</button>
    </>
  );
}

export default Dashboard;
