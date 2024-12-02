import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userData, setUserDataState] = useState(null);

  const setUserData = useCallback((data) => {
    console.log('Setting user data in context:', data); // Debug log
    setUserDataState(data);
  }, []);

  const [avatarSettings, setAvatarSettings] = useState({
    gender: 'male',
    skinTone: '#FFD5B4',
    outfitColor: '#2196F3',
    hairStyle: 'short',
    accessories: [],
    facialExpression: 'smile'
  });

  // Load avatar settings from localStorage on initial render
  useEffect(() => {
    const saved = localStorage.getItem('avatarSettings');
    if (saved) {
      try {
        setAvatarSettings(JSON.parse(saved));
      } catch (error) {
        console.error('Error parsing saved avatar settings:', error);
      }
    }
  }, []);

  // Save avatar settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('avatarSettings', JSON.stringify(avatarSettings));
  }, [avatarSettings]);

  return (
    <UserContext.Provider value={{ 
      userData, 
      setUserData,
      isAuthenticated: !!userData,
      avatarSettings, 
      setAvatarSettings 
    }}>
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