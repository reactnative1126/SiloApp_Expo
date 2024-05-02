import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import { navOptionHandler } from '../../utils/functions';

import { Settings, PersonalInfo, Feedback, PinCode, NotificationSettings } from '../../screens';

const StackSettings = createStackNavigator();
export default function SettingsStack() {
  return (
    <StackSettings.Navigator initialRouteName='Settings' screenOptions={{ gestureEnabled: false }}>
      <StackSettings.Screen name='Settings' component={Settings} options={navOptionHandler} />
      <StackSettings.Screen name='PersonalInfo' component={PersonalInfo} options={navOptionHandler} />
      <StackSettings.Screen name='NotificationSettings' component={NotificationSettings} options={navOptionHandler} />
      <StackSettings.Screen name='Feedback' component={Feedback} options={navOptionHandler} />
      <StackSettings.Screen name='PinCode' component={PinCode} options={navOptionHandler} />
    </StackSettings.Navigator>
  );
};