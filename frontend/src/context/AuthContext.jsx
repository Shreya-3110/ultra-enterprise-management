import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [activeBranchId, setActiveBranchId] = useState(localStorage.getItem('activeBranchId'));

  // Global Axios Interceptor for Branch Switching
  useEffect(() => {
    if (activeBranchId) {
      localStorage.setItem('activeBranchId', activeBranchId);
      axios.defaults.headers.common['x-branch-id'] = activeBranchId;
    } else {
      localStorage.removeItem('activeBranchId');
      delete axios.defaults.headers.common['x-branch-id'];
    }
  }, [activeBranchId]);

  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('token');
        
        if (storedUser && storedToken) {
          setUser(JSON.parse(storedUser));
          setToken(storedToken);
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', userToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setActiveBranchId(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('activeBranchId');
    delete axios.defaults.headers.common['x-branch-id'];
  };

  const completeTour = () => {
    if (user) {
      const updatedUser = { ...user, hasCompletedTour: true };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, activeBranchId, setActiveBranchId, login, logout, completeTour, isAuthenticated: !!token, loading }}>
        {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
