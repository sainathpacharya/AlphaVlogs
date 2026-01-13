declare module 'react-native-modal' {
  import { Component } from 'react';
  import { ViewStyle, ModalProps } from 'react-native';

  export interface ModalProps extends ModalProps {
    isVisible: boolean;
    style?: ViewStyle;
    animationIn?: string;
    animationOut?: string;
    onBackdropPress?: () => void;
    onBackButtonPress?: () => void;
    children?: React.ReactNode;
  }

  export default class Modal extends Component<ModalProps> {}
}
