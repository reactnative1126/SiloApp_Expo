import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import { navOptionHandler } from '../../utils/functions';

import { Start, SignUp, SignIn, PhoneVerification, Register, CreatePin, ForgetPassword } from '../../screens';

const StackAuth = createStackNavigator();
export default function AuthStack() {
  return (
    <StackAuth.Navigator initialRouteName='Start' screenOptions={{ gestureEnabled: false }}>
      <StackAuth.Screen name='Start' component={Start} options={navOptionHandler} />
      <StackAuth.Screen name='SignUp' component={SignUp} options={navOptionHandler} />
      <StackAuth.Screen name='SignIn' component={SignIn} options={navOptionHandler} />
      <StackAuth.Screen name='PhoneVerification' component={PhoneVerification} options={navOptionHandler} />
      <StackAuth.Screen name='Register' component={Register} options={navOptionHandler} />
      <StackAuth.Screen name='CreatePin' component={CreatePin} options={navOptionHandler} />
      <StackAuth.Screen name='ForgetPassword' component={ForgetPassword} options={navOptionHandler} />
    </StackAuth.Navigator>
  );
};