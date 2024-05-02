import React from 'react';
import { Text, View, StyleSheet, ImageBackground, Image, StatusBar } from 'react-native';
import { Button } from 'react-native-paper';

import constants from '../../utils/constants';
import i18n from '../../utils/tanslations';

export default function Start(props: any) {

  return (
    <View style={styles.root}>
      <ImageBackground source={constants.IMAGES.LANGING_BG} style={styles.background} />
      <StatusBar backgroundColor='transparent' barStyle='light-content' />
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Image source={constants.IMAGES.LOGO} style={styles.logoImage} />
          <Text style={constants.G_STYLE.LOGO_TEXT}>
            {i18n.t('landingScreen.logoText')}
          </Text>
        </View>

        <View style={styles.btnGroup}>
          <Button onPress={() => {
            props.navigation.push('SignUp');
          }} style={styles.btnSignup}>
            <Text style={{ color: constants.COLORS.TEXT_BLACK, fontFamily: constants.FONTS.Syne_Regular, fontWeight: '700' }}>
              {i18n.t('global.signupBtn')}
            </Text>
          </Button>
          <Button onPress={() => {
            props.navigation.push('SignIn');
          }} style={styles.btnLogin}>
            <Text style={{ color: constants.COLORS.TEXT_WHITE, fontFamily: constants.FONTS.Syne_Regular, fontWeight: '700' }}>
              {i18n.t('global.signinBtn')}
            </Text>
          </Button>
          <Text style={constants.G_STYLE.BTN_DESCRIPTION}>{' '}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'relative',
    backgroundColor: constants.COLORS.BACKGROUND_APP,
  },
  background: {
    position: 'absolute',
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
    alignSelf: 'center',
    marginBottom: constants.SPACING.LG
  },
  btnGroup: {
    position: 'absolute',
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
