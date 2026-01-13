import {styled} from '@gluestack-style/react';
import {Pressable as RNPressable} from 'react-native';
import {RippleEffect} from '../ripple-effect';
import {ComponentProps} from 'react';

const StyledPressable = styled(RNPressable, {
  _web: {
    ':focusVisible': {
      outlineWidth: '2px',
      outlineColor: '$primary700',
      outlineStyle: 'solid',
    },
  },
});

interface PressableProps extends ComponentProps<typeof StyledPressable> {
  children?: React.ReactNode;
  rippleColor?: string;
  rippleOpacity?: number;
  rippleDuration?: number;
  enableRipple?: boolean;
}

export const Pressable = ({
  children,
  rippleColor = 'rgba(0, 0, 0, 0.1)',
  rippleOpacity = 0.2,
  rippleDuration = 200,
  enableRipple = true,
  ...props
}: PressableProps) => {
  if (enableRipple) {
    return (
      <RippleEffect
        rippleColor={rippleColor}
        rippleOpacity={rippleOpacity}
        rippleDuration={rippleDuration}
        disabled={Boolean(props.disabled)}
        {...props}>
        <StyledPressable {...props}>{children}</StyledPressable>
      </RippleEffect>
    );
  }

  return <StyledPressable {...props}>{children}</StyledPressable>;
};
