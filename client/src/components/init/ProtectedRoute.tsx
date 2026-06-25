
import { useAuth0 } from '@auth0/auth0-react';
import { Navigate, Outlet,useNavigate } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { useUser } from '../../context/Context';

const ProtectedRoute = () => {
  const navigate  = useNavigate();
  const { isAuthenticated, isLoading, user, getAccessTokenSilently } = useAuth0();
  const { login, isInitialized, setIsInitialized } = useUser();
  // Use a LOCAL ref to trap fast concurrent re-renders during the API calls
  const isFetching = useRef(false);

  useEffect(() => {
    const initializeUser = async () => {
      // 1. Guard Clause: If no user, already initialized globally, or currently fetching, GET OUT.
      if (!user || isInitialized || isFetching.current) return;

      // Immediately lock this effect so no concurrent re-renders can enter
      isFetching.current = true;

      try {
        const token = await getAccessTokenSilently();

        // Run both requests or manage them cleanly
        console.log("hi");
        const response = await fetch('http://localhost:5000/api/v1/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            role: 'MANAGER',
            email: user.email,
            name: user.name,
            profile_picture_url: user.picture,
          }),
        });

        if (!response.ok) {
          throw new Error('Registration failed');
        }

        const getUserInfo = await fetch('http://localhost:5000/api/v1/auth/me', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (getUserInfo.ok) {
          const result = await getUserInfo.json();
          
          if(!result.shop || !result.shop.id || !result.shop.name){
            navigate('/init-shop');
            return;
          }

          login(result.user, result.shop);
          setIsInitialized(true);
        } else {
          // If fetching user data failed, open the lock so it can try again if needed
          isFetching.current = false;
        }

      } catch (error) {
        console.error('Error initializing user:', error);
        // Release the lock on failure
        isFetching.current = false;
      }
    };

    initializeUser();
  }, [user, isInitialized, getAccessTokenSilently, login, setIsInitialized]);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading ...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (!isInitialized) {
    return <div className="flex items-center justify-center min-h-screen">Setting up your account...</div>;
  }

  return <Outlet />;
};

export default ProtectedRoute;