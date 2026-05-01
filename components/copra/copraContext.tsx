import React, { createContext, useContext, useState, ReactNode } from 'react';

type CopraContextType = {
  temp: number;
  lastUpdate: string;
  hrs: string;
  start: string;
  timeLeft: string;

};

const CopraContext = createContext<CopraContextType | undefined>(undefined);

export const CopraProvider = ({ children }: { children: ReactNode }) => {
const temp = 70;
const lastUpdate = '2 mins ago';
const hrs = '3hr 20min';
const start = '10:00 AM';
const timeLeft = '1hr 10min';

  return (
    <CopraContext.Provider value={{ temp, lastUpdate, hrs, start, timeLeft }}>
        {children}
    </CopraContext.Provider>
  );
};

export const useCopra = () => {
  const context = useContext(CopraContext);
  if (!context) {
    throw new Error('useCopra must be used within CopraProvider');
  }
  return context;
};