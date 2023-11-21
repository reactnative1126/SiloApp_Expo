import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import { navOptionHandler } from '@services/functions';

import { AuthScreen, PhoneRequest, PhoneVerify } from '@screens';

const StackAuth = createStackNavigator();
export default AuthStack = () => {
  return (
    <StackAuth.Navigator initialRouteName='PhoneRequest' screenOptions={{ gestureEnabled: false }}>
      <StackAuth.Screen name='AuthScreen' component={AuthScreen} options={navOptionHandler} />
      <StackAuth.Screen name='PhoneRequest' component={PhoneRequest} options={navOptionHandler} />
      <StackAuth.Screen name='PhoneVerify' component={PhoneVerify} options={navOptionHandler} />
    </StackAuth.Navigator>
  );
};