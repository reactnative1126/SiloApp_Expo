import React from 'react';
import { StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';

import { SvgXml } from 'react-native-svg';

import constants from '../../utils/constants';
import { iOSDevice } from '../../utils/functions';

import DashboardStack from '../stacks/dashboard';
// import SavingsStack from '../stacks/savings';
import ContactsStack from '../stacks/contacts';
// import HelpStack from '../stacks/help';
import SettingsStack from '../stacks/settings';

const TabMain = createBottomTabNavigator();

export default function Main() {
  return (
    <TabMain.Navigator
      initialRouteName='DashboardStack'
      screenOptions={{
        tabBarActiveTintColor: constants.COLORS.TEXT_WHITE,
        tabBarInactiveTintColor: constants.COLORS.BACKGROUND_TAB_TINT_INACTIVE,
        tabBarItemStyle: {
          backgroundColor: constants.COLORS.BACKGROUND_TAB_ITEM_ACTIVE
        },
        tabBarLabelStyle: styles.tabLabelStyle,
        tabBarStyle: {
          borderTopColor: constants.COLORS.BORDER_PRIMARY,
          borderTopWidth: constants.SIZE.BORDER_WIDTH_SM,
          borderTopRightRadius: constants.SIZE.BORDER_RADIUS_XL,
          borderTopLeftRadius: constants.SIZE.BORDER_RADIUS_XL,
          overflow: 'hidden',
          backgroundColor: constants.COLORS.BACKGROUND_TAB_ITEM_ACTIVE,
          height: iOSDevice() ? 90 : 55,
          position: 'absolute'
        },
        tabBarIconStyle: {
          marginBottom: -15
        },
      }}>
      <TabMain.Screen
        name='DashboardStack'
        component={DashboardStack}
        options={({ route }) => ({
          headerShown: false,
          title: 'Dashboard',
          tabBarIcon: ({ focused }) =>
            <SvgXml
              xml={focused ? constants.SVGS.dashboard_active : constants.SVGS.dashboard_inactive}
              width={20}
              height={20}
            />,
          tabBarStyle: {
            borderTopColor: constants.COLORS.BORDER_PRIMARY,
            borderTopWidth: constants.SIZE.BORDER_WIDTH_SM,
            borderTopRightRadius: constants.SIZE.BORDER_RADIUS_XL,
            borderTopLeftRadius: constants.SIZE.BORDER_RADIUS_XL,
            overflow: 'hidden',
            backgroundColor: constants.COLORS.BACKGROUND_TAB_ITEM_ACTIVE,
            height: iOSDevice() ? 90 : 55,
            position: 'absolute',
            display: getFocusedRouteNameFromRoute(route) === 'Deposit' ? 'none' : 'flex',
          },
        })}
      />
      {/* <TabMain.Screen
        name='savings'
        component={SavingsStack}
        options={{
          headerShown: false,
          title: 'Savings',
          tabBarIcon: ({ focused }) => <SvgXml
            xml={focused ? constants.SVGS.savings_active : constants.SVGS.savings_inactive}
            width={20}
            height={20}
          />,
        }}
      /> */}
      <TabMain.Screen
        name='transfers'
        component={ContactsStack}
        options={({ route }) => ({
          headerShown: false,
          title: 'Transfers',
          tabBarIcon: ({ focused }) => <SvgXml
            xml={focused ? constants.SVGS.transfers_active : constants.SVGS.transfers_inactive}
            width={20}
            height={20}
          />,
          tabBarStyle: {
            borderTopColor: constants.COLORS.BORDER_PRIMARY,
            borderTopWidth: constants.SIZE.BORDER_WIDTH_SM,
            borderTopRightRadius: constants.SIZE.BORDER_RADIUS_XL,
            borderTopLeftRadius: constants.SIZE.BORDER_RADIUS_XL,
            overflow: 'hidden',
            backgroundColor: constants.COLORS.BACKGROUND_TAB_ITEM_ACTIVE,
            height: iOSDevice() ? 90 : 55,
            position: 'absolute',
            display: (getFocusedRouteNameFromRoute(route) === 'ContactCreate' || getFocusedRouteNameFromRoute(route) === 'SendFunds') ? 'none' : 'flex',
          },
        })}
      />
      {/* <TabMain.Screen
        name='help'
        component={HelpStack}
        options={{
          headerShown: false,
          title: 'Help',
          tabBarIcon: ({ focused }) => <SvgXml
            xml={focused ? constants.SVGS.help_active : constants.SVGS.help_inactive}
            width={20}
            height={20}
          />,
        }}
      /> */}
      <TabMain.Screen
        name='settings'
        component={SettingsStack}
        options={({ route }) => ({
          headerShown: false,
          title: 'Setting',
          tabBarIcon: ({ focused }) => <SvgXml
            xml={focused ? constants.SVGS.settings_active : constants.SVGS.settings_inactive}
            width={20}
            height={20}
          />,
          tabBarStyle: {
            borderTopColor: constants.COLORS.BORDER_PRIMARY,
            borderTopWidth: constants.SIZE.BORDER_WIDTH_SM,
            borderTopRightRadius: constants.SIZE.BORDER_RADIUS_XL,
            borderTopLeftRadius: constants.SIZE.BORDER_RADIUS_XL,
            overflow: 'hidden',
            backgroundColor: constants.COLORS.BACKGROUND_TAB_ITEM_ACTIVE,
            height: iOSDevice() ? 90 : 55,
            position: 'absolute',
            display: (getFocusedRouteNameFromRoute(route) === 'PinCode' || getFocusedRouteNameFromRoute(route) === 'NotificationSettings') ? 'none' : 'flex',
          },
        })}
      />
    </TabMain.Navigator>
  );
}

const styles = StyleSheet.create({
  tabLabelStyle: {
    fontFamily: constants.FONTS.Space_Grotesk,
    fontSize: constants.SIZE.TEXT_MD,
    fontStyle: 'normal',
    fontWeight: '500',
    lineHeight: constants.LINE_HEIGHT.MD,
    paddingBottom: 5
  },
});