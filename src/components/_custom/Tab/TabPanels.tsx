import {Box} from '@/components';
import {FC, ReactNode} from 'react';

interface TabPanelsProps {
  children: ReactNode;
}

export const TabPanels: FC<TabPanelsProps> = ({children}) => {
  return <Box>{children}</Box>;
};
