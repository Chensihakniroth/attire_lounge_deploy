import React, { createContext } from 'react';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const colors = {
    background: '#111827', // bg-gray-900
    card: '#1f2937', // bg-gray-800
    border: '#374151', // border-gray-700
    primary: '#3b82f6', // blue-500
    mainText: '#ffffff', // text-white
    sidebarText: '#9ca3af', // text-gray-400
  };

  return (
    <ThemeContext.Provider value={{ colors }}>
      {children}
    </ThemeContext.Provider>
  );
};
