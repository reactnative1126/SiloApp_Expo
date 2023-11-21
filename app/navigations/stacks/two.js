import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import { navOptionHandler } from '@services/functions';

import { Two } from '@screens';

const StackTwo = createStackNavigator();
export default TwoStack = () => {
  return (
    <StackTwo.Navigator initialRouteName='Two' screenOptions={{ gestureEnabled: false }}>
      <StackTwo.Screen name='Two' component={Two} options={navOptionHandler} />
    </StackTwo.Navigator>
  );
};