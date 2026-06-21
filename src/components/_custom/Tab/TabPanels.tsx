import {Box} from '@/components';
import React from 'react';
import {useTabsContext} from './Tabs';

interface TabPanelsProps {
  children: React.ReactNode;
}

export const TabPanels: React.FC<TabPanelsProps> = ({children}) => {
  const {value} = useTabsContext();
  const panels = React.Children.toArray(children);
  return <Box>{panels[value] ?? null}</Box>;
};
