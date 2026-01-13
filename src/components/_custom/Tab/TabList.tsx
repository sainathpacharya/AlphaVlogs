import {Box} from '@/components';
import {FC, ReactNode} from 'react';

interface TabListProps {
  children: ReactNode;
}

export const TabList: FC<TabListProps> = ({children}) => {
  return <Box flexDirection="row">{children}</Box>;
};
