import React, {createContext, useContext} from 'react';
import {Box} from '@/components';

type TabsContextValue = {
  value: number;
  onChange: (value: number) => void;
};

const TabsContext = createContext<TabsContextValue | null>(null);

export interface TabsProps {
  value: number;
  onChange: (value: number) => void;
  children: React.ReactNode;
}

export const Tabs: React.FC<TabsProps> = ({value, onChange, children}) => (
  <TabsContext.Provider value={{value, onChange}}>
    <Box>{children}</Box>
  </TabsContext.Provider>
);

export const useTabsContext = (): TabsContextValue => {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('Tab components must be used within Tabs');
  }
  return context;
};
