import React from 'react';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { Button } from 'react-native-paper';

import constants from '../../utils/constants';

type HeaderProps = {
  back?: boolean,
  title?: string,
  add?: boolean,
  qrcode?: boolean,
  remove?: boolean,
  onAdd?: any,
  onQRCode?: any,
  onBack?: any,
  onModal?: any
}

// Define the Header component
export default function Header(props: HeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.left}>
        {props.back && (
          <TouchableOpacity
            onPress={props.onBack}
            activeOpacity={0.8}
            style={{ marginRight: constants.SPACING.SM }}
          >
            <SvgXml
              xml={constants.SVGS.back}
              width={24}
              height={24}
            />
          </TouchableOpacity>
        )}
        <Text style={styles.title}>
          {props.title}
        </Text>
      </View>
      <View style={styles.right}>
        {props.add && (
          <TouchableOpacity
            onPress={props.onAdd}
            activeOpacity={0.8}
          >
            <SvgXml
              xml={constants.SVGS.plus}
              width={24}
              height={24}
              style={styles.alarm}
            />
          </TouchableOpacity>
        )}
        {props.qrcode && (
          <TouchableOpacity
            onPress={props.onQRCode}
            activeOpacity={0.8}
          >
            <SvgXml
              xml={constants.SVGS.qrcode}
              width={24}
              height={24}
              style={styles.qrcode}
            />
          </TouchableOpacity>
        )}
        {props.remove && (
          <View style={{ display: 'flex', flexDirection: 'row' }}>
            <Button style={styles.deleteBtn} onPress={props.onModal}>
              <Text style={styles.deleteBtnTxt}>
                Remove Contact
              </Text>
            </Button>
          </View>
        )}
      </View>
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
    alignItems: 'center',
  },
  right: {
    marginRight: constants.SPACING.SM,
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontStyle: 'normal',
    fontFamily: constants.FONTS.Syne_Bold,
    fontSize: constants.SIZE.TEXT_XL,
    color: constants.COLORS.TEXT_WHITE,
    letterSpacing: -0.64,
    textAlign: 'center',
  },
  icons: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: constants.SPACING.SM
  },
  qrcode: {
    margin: 8
  },
  alarm: {
    margin: 8
  },
  deleteBtn: {
    ...constants.G_STYLE.BTN_OUTLINE,
    borderColor: constants.COLORS.BORDER_DANGER,
    height: 32,
    zIndex: -1
  },
  deleteBtnTxt: {
    ...constants.G_STYLE.BUTTON_TEXT,
    color: constants.COLORS.TEXT_DANGER,
    lineHeight: 14,
    letterSpacing: -0.28
  },
});
