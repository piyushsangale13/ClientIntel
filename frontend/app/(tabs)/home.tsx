import { View, Text } from 'react-native'
import React from 'react'
import { Link, Stack } from 'expo-router'

const home = () => {
  return (
    <View>
      <Stack.Screen options={{headerTitle: `Research Report Agent`}}/>
      <Link href="movies/1">Link 1</Link>
      <Link href="movies/2">Link 2</Link>
      <Link href="movies/3">Link 3</Link>
    </View>
  );
};

export default home;