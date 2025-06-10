import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {AuthStackScreen} from '../AuthStack';

const Stack = createNativeStackNavigator<any>();

const RootNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="AuthStack"
        component={AuthStackScreen}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
};
