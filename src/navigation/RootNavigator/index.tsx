import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {AuthStack} from '../AuthStack';

const Stack = createNativeStackNavigator<any>();

const RootNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="AuthStack"
        component={AuthStack}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
};

export default RootNavigator;
