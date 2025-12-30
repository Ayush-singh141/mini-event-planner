import { createContext, useState, useEffect } from "react";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkLoggedIn = async () => {
      let token = localStorage.getItem("auth-token");
      if (token === null) {
        localStorage.setItem("auth-token", "");
        token = "";
      }

      if (token) {
        try {
          // Ideally we should have a /me endpoint or just decode if we trust validity, but verification is better
          // For now, let's assume if we keep the user object in local storage or just rely on the token validity
          // Let's rely on decoding the token or a simple validity check if we had an endpoint.
          // Given the constraints, I'll store the user info in localStorage too for simplicity or fetch it.
          // Let's implement a simple user persistence:
          const savedUser = localStorage.getItem("user");
          if (savedUser) setUser(JSON.parse(savedUser));
        } catch (error) {
          console.error(error);
        }
      }
      setLoading(false);
    };
    checkLoggedIn();
  }, []);

  const login = (token, userData) => {
    localStorage.setItem("auth-token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.setItem("auth-token", "");
    localStorage.setItem("user", "");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
