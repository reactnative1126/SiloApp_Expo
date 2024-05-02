import React, { useState } from 'react';
import { useRecoilValue } from 'recoil';
import { Animated, View, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { TabView, SceneMap } from 'react-native-tab-view';

import Container from '../../components/common/Container';
import Header from '../../components/common/Header';
import QRcodeGen from '../../components/dashboard/QRCodeGen';
import QRcodeScanner from '../../components/dashboard/QRScanner';

import constants from '../../utils/constants';

import { userAtom } from '../../_recoil/user/user.state';

export default function QRcode(props: any) {
  const [index, setIndex] = useState<number>(0);
  const handleIndexChange = (index: number) => setIndex(index);
  const userState = useRecoilValue(userAtom);
  const [walletAddress, setWalleAddress] = useState<string>(userState.walletAddress);

  // My QR Code
  const MyCodeRoute = () => {
    return (
      <QRcodeGen walletAddress={walletAddress} username={userState.username} size={200} />
    )
  };

  // QR Code Scanner   
  const Scan = () => {
    return (
      <QRcodeScanner openCamera={index === 1} />
    )
  };

  // TabBar
  const renderTabBar = (prop: any) => {
    const inputRange = prop.navigationState.routes.map((x: any, i: number) => i);

    return (
      <View style={styles.tabBar}>
        {prop.navigationState.routes.map((route: any, i: number) => {
          return (
            <TouchableOpacity
              key={i}
              style={styles.tabItem}
              onPress={() => setIndex(i)}
              activeOpacity={0.8}
            >
              <View style={{ borderColor: constants.COLORS.BORDER_PRIMARY, width: '100%', padding: 8, marginBottom: 12, alignItems: 'center', borderBottomWidth: i === index ? 2 : 0, }}>
                <Animated.Text style={{ ...styles.tabBarText, color: i === index ? constants.COLORS.TEXT_PRIMARY : constants.COLORS.TEXT_MUTED }}>{route.title}</Animated.Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  const renderScene = SceneMap({
    MyCodeRoute: MyCodeRoute,
    Scan: Scan,
  });

  return (
    <Container>
      <View style={styles.content}>
        <Header
          back
          onBack={() => props.navigation.pop()}
          onClose={() => props.navigation.popToTop()}
        />
        <ScrollView
          style={[styles.content, { padding: constants.SPACING.MD }]}
          showsVerticalScrollIndicator={false}
        >
          <TabView
            style={[styles.tabViewContainer, { height: index === 0 ? 425 : 600 }]}
            navigationState={{
              index,
              routes: [
                { key: 'MyCodeRoute', title: 'My Code' },
                { key: 'Scan', title: 'Scan' },
              ],
            }}
            animationEnabled={false}
            renderScene={renderScene}
            renderTabBar={renderTabBar}
            onIndexChange={handleIndexChange}
          />
        </ScrollView>
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1
  },
  tabBar: {
    flexDirection: 'row',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 0,
    paddingBottom: 0,
    paddingHorizontal: 24,
  },
  tabViewContainer: {
    borderRadius: constants.SIZE.BORDER_RADIUS_MD,
    borderWidth: constants.SIZE.BORDER_WIDTH_SM,
    borderColor: constants.COLORS.BORDER_BRIGHT_DARK,
    backgroundColor: constants.COLORS.BACKGROUND_LIGHT_DARK
  },
  tabBarText: {
    color: constants.COLORS.TEXT_MUTED,
    fontFamily: constants.FONTS.Space_Grotesk,
    fontSize: constants.SIZE.TEXT_LG3,
    fontStyle: 'normal',
    fontWeight: '600',
    lineHeight: constants.LINE_HEIGHT.MD,
    letterSpacing: -0.4
  }
});
