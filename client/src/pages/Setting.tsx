import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useUser } from "../context/Context";

export default function Setting() {
  const {
    isLoading,
    isAuthenticated,
    error,
    loginWithRedirect: login,
    logout: auth0Logout,
    user,
  } = useAuth0();

  const { userInfo, shop } = useUser();

  const signup = () =>
    login({ authorizationParams: { screen_hint: "signup" } });

  const logout = () =>
    auth0Logout({ logoutParams: { returnTo: window.location.origin } });

  // Handle name splitting safely for the layout fields
  const nameParts = userInfo?.name?.split(" ") || ["", ""];
  const firstName = nameParts[0];
  const lastName = nameParts.slice(1).join(" ");

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-800 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 sm:p-6 md:p-8">
      {!isAuthenticated ? (
        /* Unauthenticated State Card Layout */
        <div className="mx-auto mt-20 max-w-md rounded-2xl bg-white p-8 shadow-sm border border-gray-100 text-center">
          <h2 className="text-2xl font-bold text-emerald-900 mb-2">Welcome</h2>
          <p className="text-sm text-gray-500 mb-6">Please log in or sign up to manage your profile and shop settings.</p>
          
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {error.message}
            </div>
          )}

          <div className="flex flex-col gap-3">
            <button
              onClick={() => login()}
              className="w-full rounded-xl bg-emerald-800 py-3 font-semibold text-white transition hover:bg-emerald-900"
            >
              Log In
            </button>
            <button
              onClick={signup}
              className="w-full rounded-xl border border-gray-200 bg-white py-3 font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              Sign Up
            </button>
          </div>
        </div>
      ) : (
        /* Authenticated Profile Dashboard Layout */
        <div className="mx-auto max-w-5xl space-y-6">
          
          {/* Top Bar Navigation/Header */}
          <div className="flex items-center justify-between px-1">
            <h1 className="text-xl font-bold text-emerald-950">My Profile</h1>
            <button
              onClick={logout}
              className="flex items-center gap-2 rounded-full  bg-white px-4 py-2 text-sm font-medium text-red-500 shadow-sm transition hover:bg-red-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
              </svg>
              Logout
            </button>
          </div>

          {/* Card 1: Main Avatar & Role Overview */}
          <div className="rounded-4xl bg-layer2 p-6 shadow-sm border-1  border-white">
            <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
              <div className="relative h-24 w-24 flex-shrink-0">
                <img
                  src={user?.picture || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"}
                  alt="Profile"
                  className="h-full w-full rounded-full object-cover border-2 border-white shadow-md"
                />
                <button className="absolute bottom-0 right-0 rounded-full bg-emerald-800 p-2 text-white shadow-md border-2 border-white hover:bg-emerald-900 transition">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                  </svg>
                </button>
              </div>
              <div>
                <h2 className="text-xl font-bold text-emerald-950">{userInfo?.name || "User Name"}</h2>
                <p className="text-sm font-medium text-gray-400 mt-0.5 capitalize">{userInfo?.role || "User"}</p>
                <p className="text-xs text-gray-400 mt-1 flex items-center justify-center sm:justify-start gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5 text-gray-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                  {shop?.name || "No Shop Bound"}
                </p>
              </div>
            </div>
          </div>

          {/* Card 2: Personal Information */}
          <div className="rounded-4xl bg-layer2 p-6  border border-white">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
              <h3 className="text-base font-bold text-emerald-950">Personal Information</h3>
              <button className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-orange-600 transition">
                <span>Edit</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-5">
              <div>
                <p className="text-xs font-medium text-gray-400">First Name</p>
                <p className="text-sm font-semibold text-gray-800 mt-1">{firstName || "—"}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-400">Last Name</p>
                <p className="text-sm font-semibold text-gray-800 mt-1">{lastName || "—"}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-400">Email Address</p>
                <p className="text-sm font-semibold text-gray-800 mt-1 truncate">{userInfo?.email || user?.email || "—"}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-400">User Role</p>
                <p className="text-sm font-semibold text-gray-800 mt-1 capitalize">{userInfo?.role || "—"}</p>
              </div>
            </div>
          </div>

          {/* Card 3: Shop & Account Information */}
          <div className="rounded-4xl bg-layer2 p-6 border border-white">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
              <h3 className="text-base font-bold text-emerald-950">Shop Information</h3>
              <button className="flex items-center gap-1.5 rounded-full text-white bg-primary px-4 py-2 text-xs font-semibold text-gray-600 shadow-sm hover:bg-gray-50 transition">
                <span>Edit</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-5">
              <div>
                <p className="text-xs font-medium text-gray-400">Shop Name</p>
                <p className="text-sm font-semibold text-gray-800 mt-1">{shop?.name || "—"}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-400">Shop ID</p>
                <p className="text-sm font-mono text-sm font-semibold text-gray-800 mt-1">{shop?.id || "—"}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-400">Status</p>
                <p className="text-sm font-semibold text-emerald-700 mt-1 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                  Active
                </p>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}