import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [userRole, setUserRole] = useState(null);
  const [user, setUser] = useState({});

  useEffect(() => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      if (storedUser) {
        setUser(storedUser);
        if (storedUser.role) setUserRole(storedUser.role);
      }
    } catch (err) {
      console.error("Invalid user in localStorage");
    }
  }, []);

  // Call this after login AND after any profile update.
  // It updates both localStorage and the shared context state,
  // so every component reading from useAuth() re-renders with fresh data.
  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    if (updatedUser?.role) setUserRole(updatedUser.role);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ userRole, setUserRole, user, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
};