import {ActivityIndicator} from 'react-native';
import {ComponentProps} from 'react';
import {HStack} from '../hstack';
import {gluestackUIConfig} from '../gluestack-ui.config';

type IHStackProps = ComponentProps<typeof HStack>;

interface ISpinnerProps extends IHStackProps {
  size?: number;
  bgColor?: string;
}

export const Spinner = (props: ISpinnerProps) => {
  const {size = 25, bgColor, ...HStackProps} = props;
  const color = bgColor ?? gluestackUIConfig.tokens.colors.chTeal120;

  return (
    <HStack
      {...HStackProps}
      width={size}
      alignItems="center"
      justifyContent="center">
      <ActivityIndicator color={color} size={size > 24 ? 'large' : 'small'} />
    </HStack>
  );
};
