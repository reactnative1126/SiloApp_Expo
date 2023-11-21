import React, { useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import moment from 'moment';
import { Icon } from 'react-native-elements';

import {
  Platform,
  SafeAreaView,
  StyleSheet,
  Text
} from 'react-native';

import { Images, Fonts, Colors, Themes } from '@constants';
import { isLog, navOptionHandler } from '@services/functions';

import HomeStack from '@navigations/stacks/home';
import TwoStack from '@navigations/stacks/two';

const TabBottom = createBottomTabNavigator();
export default BottomTab = () => {

  return (
    <TabBottom.Navigator
      initialRouteName='HomeStack'
      screenOptions={({ route }) => ({
        tabBarStyle: {
          backgroundColor: Colors.white,
          paddingTop: 8,
          shadowColor: Colors.black,
          shadowOffset: { width: 1, height: 1 },
          shadowOpacity: 0.9,
          shadowRadius: 1,
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName, iconColor;
          if (route.name === 'HomeStack') {
            iconType = 'material-community'
            iconName = focused ? 'home-lightbulb' : 'home-lightbulb-outline';
            iconColor = focused ? Colors.blue : Colors.black;
          } else if (route.name === 'TwoStack') {
            iconType = 'material'
            iconName = focused ? 'dynamic-feed' : 'dynamic-feed';
            iconColor = focused ? Colors.blue : Colors.black;
          }
          return <Icon type={iconType} name={iconName} size={25} color={iconColor} />;
        },
        tabBarLabel: ({ focused, color, size }) => {
          let labelName, labelColor, fontWeight;
          if (route.name === 'HomeStack') {
            labelName = 'Home';
            labelColor = focused ? Colors.blue : Colors.black;
            fontWeight = focused ? '700' : '500';
          } else if (route.name === 'TwoStack') {
            labelName = 'Two';
            labelColor = focused ? Colors.blue : Colors.black;
            fontWeight = focused ? '700' : '500';
          }
          return <Text style={{ fontSize: 12, fontWeight: fontWeight, color: labelColor }}>{labelName}</Text>;
        },
        activeTintColor: Colors.blue,
        inactiveTintColor: Colors.black,
      })}
    >
      <TabBottom.Screen name='HomeStack' component={HomeStack} options={navOptionHandler} tabBarLabel='Home' />
      <TabBottom.Screen name='TwoStack' component={TwoStack} options={navOptionHandler} tabBarLabel='Two' />
    </TabBottom.Navigator>
  );
}