import {Box} from '@/components';
import React from 'react';

export interface TabProps {
  children: React.ReactNode;
}

const Tab: React.FC<TabProps> = ({children}) => <Box>{children}</Box>;

export default Tab;
