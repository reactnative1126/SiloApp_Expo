import React from 'react';
import { StyleSheet, View } from 'react-native';

import constants from '../../utils/constants';

type CardProps = {
  marginTop: number | 0;
  children: any | null;
}

// Define the Card component
export default function Card(props: CardProps) {
  return (
    <View style={[styles.container, { marginTop: props.marginTop }]}>
      {props.children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: constants.COLORS.BACKGROUND_LIGHT_DARK,
    borderRadius: constants.SIZE.BORDER_RADIUS_MD,
    borderWidth: constants.SIZE.BORDER_WIDTH_SM,
    borderColor: constants.COLORS.BORDER_BRIGHT_DARK
  },
});
