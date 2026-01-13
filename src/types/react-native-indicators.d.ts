declare module 'react-native-indicators' {
  import { Component } from 'react';
  import { ViewStyle } from 'react-native';

  export interface MaterialIndicatorProps {
    color?: string;
    size?: number;
    style?: ViewStyle;
  }

  export class MaterialIndicator extends Component<MaterialIndicatorProps> {}
}
