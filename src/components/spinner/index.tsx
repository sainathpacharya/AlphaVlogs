import {ComponentProps} from 'react';
import {MaterialIndicator} from 'react-native-indicators';
import {HStack} from '../hstack';
import {gluestackUIConfig} from '../gluestack-ui.config';

type IHStackProps = ComponentProps<typeof HStack>;

interface ISpinnerProps extends IHStackProps {
  size?: number;
}

export const Spinner = (props: ISpinnerProps) => {
  const {size = 25, ...HStackProps} = props;
  return (
    <HStack {...HStackProps} width={size}>
      <MaterialIndicator
        color={gluestackUIConfig.tokens.colors.chTeal120}
        size={size}
      />
    </HStack>
  );
};
