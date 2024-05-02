import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import { navOptionHandler } from '../../utils/functions';

import {
  Contacts,
  ContactCreate,
  ContactView,
  QRCode,
  SendFunds
} from '../../screens';

const StackContacts = createStackNavigator();
export default function ContactsStack() {
  return (
    <StackContacts.Navigator initialRouteName='Contacts' screenOptions={{ gestureEnabled: false }}>
      <StackContacts.Screen name='Contacts' component={Contacts} options={navOptionHandler} />
      <StackContacts.Screen name='ContactCreate' component={ContactCreate} options={navOptionHandler} />
      <StackContacts.Screen name='ContactView' component={ContactView} options={navOptionHandler} />
      <StackContacts.Screen name='ContactQRCode' component={QRCode} options={navOptionHandler} />
      <StackContacts.Screen name='SendFunds' component={SendFunds} options={navOptionHandler} />
    </StackContacts.Navigator>
  );
};