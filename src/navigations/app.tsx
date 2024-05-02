import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import { navOptionHandler } from '../utils/functions';

import Container from './stacks/container';

const StackApp = createStackNavigator();
export default function AppContainer() {
  return (
    <NavigationContainer>
      <StackApp.Navigator initialRouteName='Container' screenOptions={{ gestureEnabled: false }}>
        <StackApp.Screen name='Container' component={Container} options={navOptionHandler} />
      </StackApp.Navigator>
    </NavigationContainer>
  );
};