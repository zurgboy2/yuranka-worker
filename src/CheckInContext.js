import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useUserData } from './UserContext';

const CheckInContext = createContext();

export const useCheckIn = () => {
  const context = useContext(CheckInContext);
  if (!context) {
    throw new Error('useCheckIn must be used within a CheckInProvider');
  }
  return context;
};

export const CheckInProvider = ({ children }) => {
    const { userData } = useUserData();
    const [status, setStatus] = useState(userData?.status || 'default');
  
    useEffect(() => {
      if (userData?.status) {
        setStatus(userData.status);
      }
    }, [userData]);
  
    const updateStatus = useCallback((newStatus) => {
      setStatus(newStatus);
    }, []);
  
    return (
      <CheckInContext.Provider value={{ status, updateStatus }}>
        {children}
      </CheckInContext.Provider>
    );
  };