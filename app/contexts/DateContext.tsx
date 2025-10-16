import React, { createContext, useState, useContext, ReactNode } from 'react';

interface DateContextType {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
}

const DateContext = createContext<DateContextType | undefined>(undefined);

interface DateProviderProps {
  children: ReactNode;
}

export const DateProvider: React.FC<DateProviderProps> = ({ children }) => {
  const [selectedDate, setSelectedDate] = useState(new Date()); // Default to today

  return (
    <DateContext.Provider value={{ selectedDate, setSelectedDate }}>
      {children}
    </DateContext.Provider>
  );
};

export const useDate = () => {
  const context = useContext(DateContext);
  if (context === undefined) {
    throw new Error('useDate must be used within a DateProvider');
  }
  return context;
};
