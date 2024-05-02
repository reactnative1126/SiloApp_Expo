import { Link, useRouter, Redirect } from "expo-router";
import { Text, View, StyleSheet, Pressable, ImageBackground, Image, StatusBar } from 'react-native';
import { useRecoilValue, useRecoilState, useRecoilCallback } from "recoil";
import { authAtom } from "../_recoil/auth/auth.state";
import { Button, Card } from 'react-native-paper';
import constants from '../constants';
import i18n from "../translations";
import { useSession } from "../context/ctx";
import { userAtom } from "../_recoil/user/user.state";
import React from "react";

export default function LandingPage() {
  const navigation = useRouter();
  const { session, isLoading } = useSession();
  const [auth, setAuth] = useRecoilState(authAtom);
  const [user, setUser] = useRecoilState(userAtom);

  React.useEffect(() => {

    if (session) {
      setAuth(JSON.parse(session).auth);
      setUser(JSON.parse(session).user);

      navigation.replace('/dashboard');
    }
  }, [session]);

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

  if (!session) {
    return (
      <View style={styles.root}>
        <ImageBackground source={constants.IMAGES.LANGING_BG} style={styles.background} />
        <StatusBar backgroundColor="transparent" barStyle="light-content" />
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <Image source={constants.IMAGES.LOGO} style={styles.logoImage} />
            <Text style={constants.G_STYLE.LOGO_TEXT}>
              {i18n.t('landingScreen.logoText')}
              {/* Easy dollar savings for anyone. */}
            </Text>
          </View>

          <View style={styles.btnGroup}>
            <Button onPress={() => {
              navigation.push({ pathname: "/auth/login-signup", params: { status: "signup" } });
            }} style={styles.btnSignup}>
              <Text style={{ color: constants.COLORS.TEXT_BLACK, fontFamily: constants.FONTS.Syne_Regular, fontWeight: '700' }}>
                {i18n.t('global.signupBtn')}
              </Text>
            </Button>
            <Button onPress={() => {
              navigation.push({ pathname: "/auth/login-signup", params: { status: "login" } });
            }} style={styles.btnLogin}>
              <Text style={{ color: constants.COLORS.TEXT_WHITE, fontFamily: constants.FONTS.Syne_Regular, fontWeight: '700' }}>
                {i18n.t('global.loginBtn')}
              </Text>
            </Button>
          </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  root: {
    position: "relative",
    backgroundColor: constants.COLORS.BACKGROUND_APP,
  },
  background: {
    position: "absolute",
    left: 0,
    right: 0,
    width: '100%',
    height: '100%',
    opacity: 0.25,
  },
  content: {
    height: '100%'
  },
  logoContainer: {
    top: '30%'
  },
  logoImage: {
    alignSelf: "center",
    marginBottom: constants.SPACING.LG
  },
  btnGroup: {
    position: "absolute",
    bottom: 0,
    width: '100%'
  },
  btnSignup: {
    backgroundColor: constants.COLORS.BACKGROUND_BUTTON_PRIMARY,
    marginHorizontal: constants.SPACING.MD,
    borderRadius: constants.SIZE.BORDER_RADIUS_MD,
    marginBottom: constants.SPACING.MD,
  },
  btnLogin: {
    marginHorizontal: constants.SPACING.MD,
    borderColor: constants.COLORS.BORDER_BUTTON_WHITE,
    borderWidth: constants.SIZE.BORDER_WIDTH_SM,
    borderRadius: constants.SIZE.BORDER_RADIUS_MD,
    marginBottom: constants.SPACING.XL
  }
});
