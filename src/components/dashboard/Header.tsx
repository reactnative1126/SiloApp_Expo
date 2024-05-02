import React from 'react';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import { SvgXml } from 'react-native-svg';

import Avatar from '../common/Avatar';

import constants from '../../utils/constants';

type HeaderProps = {
  avatar?: any,
  name?: string,
  username?: string,
  userflag?: string,
  useremail?: string,
  onQRCode?: any,
  onNotifications?: any,
}

// Define the Header component
export default function Header(props: HeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <Avatar
          width={40}
          height={40}
          radius={20}
          size={16}
          name={props.name}
          image={props.avatar}
          borderColor={constants.COLORS.BORDER_PRIMARY}
          borderWidth={constants.SIZE.BORDER_WIDTH_SM}
        />
        <View style={styles.userContact}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={styles.userName}>
              @{props.username}
            </Text>
            <Text style={styles.userFlag}>
              {props.userflag}
            </Text>
          </View>
          {/* <Text style={styles.userEmail}>{props.useremail}</Text> */}
        </View>
      </View>
      <View style={styles.right}>
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
        <TouchableOpacity
          onPress={props.onNotifications}
          activeOpacity={0.8}
        >
          <SvgXml
            xml={constants.SVGS.alarm}
            width={24}
            height={24}
            style={styles.alarm}
          />
        </TouchableOpacity>
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
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  right: {
    marginRight: constants.SPACING.SM,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  userContact: {
    paddingLeft: constants.SPACING.SM,
  },
  userName: {
    color: constants.COLORS.TEXT_PRIMARY,
    overflow: 'hidden',
    fontFamily: constants.FONTS.Space_Grotesk,
    fontSize: constants.SIZE.TEXT_LG2,
    fontStyle: 'normal',
    fontWeight: '500',
    lineHeight: constants.LINE_HEIGHT.MD,
    letterSpacing: -0.36
  },
  userEmail: {
    overflow: 'hidden',
    color: constants.COLORS.TEXT_MUTED,
    fontFamily: constants.FONTS.Wix_Madefor_Display,
    fontSize: constants.SIZE.TEXT_MD2,
    fontStyle: 'normal',
    fontWeight: '500',
    lineHeight: constants.LINE_HEIGHT.MD
  },
  userFlag: {
    marginLeft: 8,
  },
  qrcode: {
    margin: 8
  },
  alarm: {
    margin: 8
  },
});
