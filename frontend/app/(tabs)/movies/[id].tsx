import { Text, View } from 'react-native'
import React from 'react'
import { useSearchParams } from 'expo-router/build/hooks'
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

const movies = () => {
  const { id } = useSearchParams();

  return (
    <SafeAreaView>
        <View>
            <Stack.Screen options={{headerTitle: `Details #${id}`}}/>
        <Text>this is link: {id}</Text>
        </View>
    </SafeAreaView>
  )
}

export default movies;