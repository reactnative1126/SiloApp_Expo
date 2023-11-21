import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import { navOptionHandler } from '@services/functions';

import { Home } from '@screens';

const StackHome = createStackNavigator();
export default HomeStack = () => {
  return (
    <StackHome.Navigator initialRouteName='Home' screenOptions={{ gestureEnabled: false }}>
      <StackHome.Screen name='Home' component={Home} options={navOptionHandler} />
    </StackHome.Navigator>
  );
};