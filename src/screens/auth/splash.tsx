import React from 'react';
import { View, StyleSheet, ImageBackground, StatusBar } from 'react-native';

import constants from '../../utils/constants';

export default function Splash(props: any) {

  return (
    <View style={styles.root}>
      <ImageBackground source={constants.IMAGES.LANGING_BG} style={styles.background} />
      <StatusBar backgroundColor='transparent' barStyle='light-content' />
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
});
