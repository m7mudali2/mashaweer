import React, { createContext, useState, useEffect, useContext } from 'react';
import { INTRO_VIEWED_KEY } from '@/constants';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [introViewed, setIntroViewed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedIntroViewed = localStorage.getItem(INTRO_VIEWED_KEY);
      if (storedIntroViewed === 'true') {
        setIntroViewed(true);
      }
    } catch (error) {
      console.error("Failed to access localStorage:", error);
    }
    setIsLoading(false);
  }, []);

  const markIntroAsViewed = () => {
    try {
      localStorage.setItem(INTRO_VIEWED_KEY, 'true');
      setIntroViewed(true);
    } catch (error) {
      console.error("Failed to access localStorage:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"></div>
      </div>
    );
  }

  return (
    <AppContext.Provider value={{ introViewed, markIntroAsViewed, setIntroViewed }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
