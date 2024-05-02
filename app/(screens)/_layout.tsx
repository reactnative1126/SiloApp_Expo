import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs, Redirect, useRouter } from 'expo-router';
import { StyleSheet, Text, View, ImageBackground, StatusBar } from 'react-native';
import { SvgXml } from 'react-native-svg';
import constants from '../../constants';
import React from 'react';
import { useSession } from '../../context/ctx';
/**
 * You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
 */
function TabBarLayout(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function ScreensLayout() {
  const { session, isLoading } = useSession();
  const navigator = useRouter();

  // You can keep the splash screen open, or render a loading screen like we do here.
  if (isLoading) {
    return (
      <View style={styles.root}>
        <ImageBackground source={constants.IMAGES.LANGING_BG} style={styles.background} />
        <StatusBar backgroundColor="transparent" barStyle="light-content" />
        <Text style={constants.G_STYLE.LOGO_TEXT}>Loading...</Text>
      </View>
    )
  }

  React.useEffect(() => {
    if (!session) {
      navigator.replace('/');
    }
  }, [session]);

  if (session) {
    return (
      <Tabs
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
            backgroundColor: constants.COLORS.BACKGROUND_TAB_PRIMARY,
            height: 64,
            position: 'absolute'
          },
          tabBarIconStyle: {
            marginBottom: -10
          },
        }}>
        <Tabs.Screen
          name="dashboard"
          options={{
            headerShown: false,
            title: 'Dashboard',
            tabBarIcon: ({ focused }) =>
              <SvgXml
                xml={focused ? constants.SVGS.dashboard_active : constants.SVGS.dashboard_inactive}
                width={20}
                height={20}
              />,
          }}
        />
        <Tabs.Screen
          name="savings"
          options={{
            headerShown: false,
            title: 'Savings',
            tabBarIcon: ({ focused }) => <SvgXml
              xml={focused ? constants.SVGS.savings_active : constants.SVGS.savings_inactive}
              width={20}
              height={20}
            />,
          }}
        />
        <Tabs.Screen
          name="contacts"
          options={{
            headerShown: false,
            title: 'Contacts',
            tabBarIcon: ({ focused }) => <SvgXml
              xml={focused ? constants.SVGS.contacts_active : constants.SVGS.contacts_inactive}
              width={20}
              height={20}
            />,
          }}
        />
        <Tabs.Screen
          name="help"
          options={{
            headerShown: false,
            title: 'Help',
            tabBarIcon: ({ focused }) => <SvgXml
              xml={focused ? constants.SVGS.help_active : constants.SVGS.help_inactive}
              width={20}
              height={20}
            />,
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            headerShown: false,
            title: 'Setting',
            tabBarIcon: ({ focused }) => <SvgXml
              xml={focused ? constants.SVGS.settings_active : constants.SVGS.settings_inactive}
              width={20}
              height={20}
            />,
          }}
        />
        <Tabs.Screen
          name="qr-code"
          options={{
            headerShown: false,
            href: null
          }}
        />
        <Tabs.Screen
          name="personal-information"
          options={{
            headerShown: false,
            href: null
          }}
        />
        <Tabs.Screen
          name="create-contact"
          options={{
            headerShown: false,
            href: null,
            tabBarStyle: { display: "none" }
          }}
        />
        <Tabs.Screen
          name="view-contact"
          options={{
            headerShown: false,
            href: null,
            tabBarStyle: { display: "none" }
        <Tabs.Screen
          name="feedback"
          options={{
            headerShown: false,
            href: null
          }}
        />
      </Tabs>
    );
  }
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
  root: {
    position: "relative",
    backgroundColor: constants.COLORS.BACKGROUND_BLACK,
  },
  background: {
    position: "absolute",
    left: 0,
    right: 0,
    width: '100%',
    height: '100%',
    opacity: 0.25,
  }
});