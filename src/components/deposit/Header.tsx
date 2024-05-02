import React from 'react';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import { SvgXml } from 'react-native-svg';

import constants from '../../utils/constants';

type HeaderProps = {
  back?: boolean,
  filter?: boolean,
  close?: boolean,
  title?: string,
  onBack?: any,
  onFilter?: any,
  onClose?: any
}

// Define the Header component
export default function Header(props: HeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.left}>
        {props.back && (
          <TouchableOpacity
            style={{ marginRight: constants.SPACING.SM }}
            onPress={props.onBack}
            activeOpacity={0.8}
          >
            <SvgXml
              xml={constants.SVGS.back}
              width={24}
              height={24}
            />
          </TouchableOpacity>
        )}
        {props.title && (
          <Text style={styles.title}>
            {props.title}
          </Text>
        )}
      </View>
      {props.filter && (
        <TouchableOpacity
          style={{ marginRight: constants.SPACING.SM }}
          onPress={props.onFilter}
          activeOpacity={0.8}
        >
          <SvgXml
            xml={constants.SVGS.notification_filter}
            width={24}
            height={24}
          />
        </TouchableOpacity>
      )}
      {props.close && (
        <TouchableOpacity
          style={{ marginRight: constants.SPACING.SM }}
          onPress={props.onClose}
          activeOpacity={0.8}
        >
          <SvgXml
            xml={constants.SVGS.notification_close}
            width={16}
            height={16}
          />
        </TouchableOpacity>
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
  },
  left: {
    marginLeft: constants.SPACING.SM,
    flexDirection: 'row',
    alignItems: 'center'
  },
  right: {
    marginRight: constants.SPACING.SM,
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontFamily: constants.FONTS.Syne_Bold,
    fontSize: constants.SIZE.TEXT_XL,
    letterSpacing: -0.64,
    textAlign: 'center',
    color: constants.COLORS.TEXT_WHITE,
    fontStyle: 'normal',
  },
});
