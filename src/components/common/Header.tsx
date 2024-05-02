import React from 'react';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import { SvgXml } from 'react-native-svg';

import constants from '../../utils/constants';

type HeaderProps = {
  back?: boolean,
  close?: boolean,
  title?: string,
  onBack?: any,
  onClose?: any
}

// Define the Header component
export default function Header(props: HeaderProps) {
  return (
    <View style={styles.container}>
      {props.back ? (
        <TouchableOpacity
          style={{ marginLeft: constants.SPACING.SM }}
          onPress={props.onBack}
          activeOpacity={0.8}
        >
          <SvgXml
            xml={constants.SVGS.back}
            width={24}
            height={24}
          />
        </TouchableOpacity>
      ) : (
        <View style={{ width: 40 }} />
      )}
      {props.title && (
        <Text style={constants.G_STYLE.LOGO_TEXT}>{props.title}</Text>
      )}
      {props.close ? (
        <TouchableOpacity
          style={{ marginRight: constants.SPACING.SM }}
          onPress={props.onClose}
          activeOpacity={0.8}
        >
          <SvgXml
            xml={constants.SVGS.close}
            width={24}
            height={24}
          />
        </TouchableOpacity>
      ) : (
        <View style={{ width: 40 }} />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: constants.SPACING.SM,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  }
});
