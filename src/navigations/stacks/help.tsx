import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import { navOptionHandler } from '../../utils/functions';

import { Help } from '../../screens';

const StackHelp = createStackNavigator();
export default function HelpStack() {
  return (
    <StackHelp.Navigator initialRouteName='Help' screenOptions={{ gestureEnabled: false }}>
      <StackHelp.Screen name='Help' component={Help} options={navOptionHandler} />
    </StackHelp.Navigator>
  );
};