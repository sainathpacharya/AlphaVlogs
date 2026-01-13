declare module 'react-native-render-html' {
  import { Component } from 'react';
  import { ViewStyle, TextStyle } from 'react-native';

  export interface HTMLProps {
    source: { html: string };
    contentWidth?: number;
    baseStyle?: TextStyle;
    tagsStyles?: Record<string, TextStyle>;
    renderers?: Record<string, any>;
    defaultTextProps?: any;
    systemFonts?: string[];
  }

  export default class RenderHTML extends Component<HTMLProps> {}
}
