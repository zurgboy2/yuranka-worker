import React, { createContext, useContext, useState, useCallback } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userData, setUserDataState] = useState(null);

  const setUserData = useCallback((data) => {
    console.log('Setting user data in context:', data); // Debug log
    setUserDataState(data);
  }, []);

  const value = {
    userData,
    setUserData,
    isAuthenticated: !!userData,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserData = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUserData must be used within a UserProvider');
  }
  return context;
};