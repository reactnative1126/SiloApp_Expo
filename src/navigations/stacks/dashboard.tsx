import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import { navOptionHandler } from '../../utils/functions';

import { Dashboard, QRCode, Notifications, Deposit } from '../../screens';

const StackDashboard = createStackNavigator();
export default function DashboardStack() {
  return (
    <StackDashboard.Navigator initialRouteName='Dashboard' screenOptions={{ gestureEnabled: false }}>
      <StackDashboard.Screen name='Dashboard' component={Dashboard} options={navOptionHandler} />
      <StackDashboard.Screen name='QRCode' component={QRCode} options={navOptionHandler} />
      <StackDashboard.Screen name='Notifications' component={Notifications} options={navOptionHandler} />
      <StackDashboard.Screen name='Deposit' component={Deposit} options={navOptionHandler} />
    </StackDashboard.Navigator>
  );
};