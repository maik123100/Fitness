import { getToday, normalizeDate } from '@/app/utils/dateHelpers';
import React, { createContext, ReactNode, useContext, useState } from 'react';

interface DateContextType {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
}

const DateContext = createContext<DateContextType | undefined>(undefined);

interface DateProviderProps {
  children: ReactNode;
}

export const DateProvider: React.FC<DateProviderProps> = ({ children }) => {
  const [selectedDate, setSelectedDate] = useState(() => getToday()); // Default to today at midnight

  const handleSetSelectedDate = (date: Date) => {
    setSelectedDate(normalizeDate(date));
  };

  return (
    <DateContext.Provider value={{ selectedDate, setSelectedDate: handleSetSelectedDate }}>
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
