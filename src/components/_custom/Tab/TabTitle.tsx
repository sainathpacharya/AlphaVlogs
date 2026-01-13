import {Text} from '@/components';
import {FC} from 'react';

interface TabTitleProps {
  children: React.ReactNode;
}

export const TabTitle: FC<TabTitleProps> = ({children}) => {
  return <Text>{children}</Text>;
};
