import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';

import constants from '../../utils/constants';

type ContainerProps = {
  children: any | null;
}

// Define the Container component
export default function Container(props: ContainerProps) {
  return (
    <SafeAreaView style={[styles.container, constants.G_STYLE.ROOT_VIEW]}>
      {props.children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: constants.COLORS.BACKGROUND_BLACK
  },
});
