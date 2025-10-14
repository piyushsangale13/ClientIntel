import React from 'react'
import { Stack } from 'expo-router'
import '../global.css';
import { StatusBar } from 'react-native';

export default () => {
  return (
    <Stack>
        {/* <StatusBar value="auto" /> */}
        <Stack.Screen 
            name="index"
            options={ {headerShown: false}}
        />
        <Stack.Screen 
            name="(tabs)" 
            options={ {headerShown: false}}
        />
        <Stack.Screen 
            name="SignupScreen" 
            options={ {headerShown: false}}
        />
        <Stack.Screen 
            name="LoginScreen" 
            options={ {headerShown: false}}
        />
        <Stack.Screen 
            name="ProfileScreen" 
            options={ {headerShown: false}}
        />
    </Stack>
  );
};
