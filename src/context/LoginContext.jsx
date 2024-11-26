import React, { createContext, useContext, useState, useEffect } from 'react';

// Create the LoginContext to share login state
const LoginContext = createContext();

// Custom hook to use LoginContext
export function useLogin() {
  return useContext(LoginContext);
}

// Provider component that will wrap the application
export function LoginProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check if the user is already logged in when the app starts
  useEffect(() => {
    const user = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (user) {
      setIsLoggedIn(true);
    }
  }, []);

  const login = () => {
    setIsLoggedIn(true);
    localStorage.setItem('user', 'true'); // Store a flag indicating the user is logged in
  };

  const logout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('user'); // Remove the stored login flag
    sessionStorage.removeItem('user'); // Optionally clear session storage
  };

  return (
    <LoginContext.Provider value={{ isLoggedIn, login, logout }}>
      {children} {/* This will be your app or any components inside the LoginProvider */}
    </LoginContext.Provider>
  );
}
