import {Box} from '@/components';
import React from 'react';
import {TouchableOpacity} from 'react-native';
import {useTabsContext} from './Tabs';

interface TabListProps {
  children: React.ReactNode;
}

export const TabList: React.FC<TabListProps> = ({children}) => {
  const {onChange} = useTabsContext();
  let tabIndex = 0;

  return (
    <Box flexDirection="row">
      {React.Children.map(children, child => {
        const currentIndex = tabIndex;
        tabIndex += 1;
        return (
          <TouchableOpacity
            key={currentIndex}
            onPress={() => onChange(currentIndex)}
            accessibilityRole="tab">
            {child}
          </TouchableOpacity>
        );
      })}
    </Box>
  );
};
