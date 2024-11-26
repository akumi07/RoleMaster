import React, { createContext, useContext, useState, useEffect } from "react";

// Create the LoginContext to share login state
const LoginContext = createContext();

// Custom hook to use LoginContext
export function useLogin() {
  return useContext(LoginContext);
}

// Provider component that wraps the application
export function LoginProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check if the user is already logged in when the app starts
  useEffect(() => {
    const user = localStorage.getItem("user") || sessionStorage.getItem("user");
    if (user) {
      setIsLoggedIn(true);
    }
  }, []);

  // Login function
  const login = (user, rememberMe = false) => {
    setIsLoggedIn(true);
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem("user", JSON.stringify(user)); // Store user data
  };

  // Logout function
  const logout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem("user");
    sessionStorage.removeItem("user");
  };

  return (
    <LoginContext.Provider value={{ isLoggedIn, login, logout }}>
      {children}
    </LoginContext.Provider>
  );
}
