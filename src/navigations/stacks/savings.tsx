import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import { navOptionHandler } from '../../utils/functions';

import { Savings } from '../../screens';

const StackSavings = createStackNavigator();
export default function SavingsStack() {
  return (
    <StackSavings.Navigator initialRouteName='Savings' screenOptions={{ gestureEnabled: false }}>
      <StackSavings.Screen name='Savings' component={Savings} options={navOptionHandler} />
    </StackSavings.Navigator>
  );
};