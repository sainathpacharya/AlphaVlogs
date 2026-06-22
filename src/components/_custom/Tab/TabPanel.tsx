import {Box} from '@/components';
import {FC, ReactNode} from 'react';

interface TabPanelProps {
  children: ReactNode;
  value?: string | number;
}

export const TabPanel: FC<TabPanelProps> = ({children, value: _value}) => {
  return <Box>{children}</Box>;
};
