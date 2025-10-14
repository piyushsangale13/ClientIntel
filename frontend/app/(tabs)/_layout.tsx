import React from 'react'
import { Tabs } from 'expo-router'

export default () => {
  return (
    <Tabs>
        <Tabs.Screen 
            name="home"
        />
        <Tabs.Screen 
            name="profile"
        />  
        <Tabs.Screen 
            name="/movies/[id].tsx"
        />
    </Tabs>
  )
};
