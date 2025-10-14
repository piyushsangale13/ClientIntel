import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import LoginScreen from './LoginScreen';
import SignupScreen from './SignupScreen';
import ProfileScreen from './(tabs)/ProfileScreen';
import NetInfo from '@react-native-community/netinfo';
const Stack = createNativeStackNavigator();
NetInfo.fetch().then(state => {
  console.log('Connection type', state.type);
  console.log('Is connected?', state.isConnected);
});
const index = () => {
  return (
    <Stack.Navigator initialRouteName="Signup">
      <Stack.Screen name="Signup" component={SignupScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ProfileScreen" component={ProfileScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  )
}

export default index
