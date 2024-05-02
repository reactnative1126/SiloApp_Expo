import React from 'react';
import { Text, View, StyleSheet, Pressable } from 'react-native';
import { Button } from 'react-native-paper';
import { SvgXml } from 'react-native-svg';

import Avatar from '../common/Avatar';

import constants from '../../utils/constants';
import { formatAddress } from '../../utils/functions';

type ContactProps = {
  name: string,
  email: string,
  walletAddress: string,
  rebelfiContact: any,
  profileImage: string,
  onPay: any,
  viewContact: any,
}

export default function Contact(props: ContactProps) {

  const renderUserImage = () => {
    if (props.profileImage?.length) {
      return (
        <Avatar
          name={props.name}
          image={props.profileImage}
          width={48}
          height={48}
          radius={24}
          size={20}
        />
      )
    } else if (props.walletAddress?.length) {
      return (
        <SvgXml
          xml={constants.SVGS.wallet_contact}
          width={26}
          height={26}
          style={{ margin: 11 }}
        />
      )
    } else if (props.email?.length) {
      return (
        <SvgXml
          xml={constants.SVGS.email_contact}
          width={26}
          height={26}
          style={{ margin: 11 }}
        />
      )
    } else if (props.rebelfiContact !== null) {
      return (
        <SvgXml
          xml={constants.SVGS.rebel_contact}
          width={20}
          height={20}
          style={{ margin: 14 }}
        />
      )
    } else {
      return (
        <SvgXml
          xml={constants.SVGS.blank_user}
          width={48}
          height={48}
          style={styles.userAvatar}
        />
      )
    }
  }

  return (
    <View style={styles.contactContent}>
      <Pressable onPress={props.viewContact}>
        <View style={styles.userRoot}>
          <View style={{ ...styles.userInfo }}>
            <View style={{ position: 'relative', backgroundColor: constants.COLORS.BACKGROUND_BRIGHT_DARK, borderRadius: 48 }}>
              {renderUserImage()}
              < SvgXml xml={constants.SVGS.badge_star} width={20} height={20} style={{ position: 'absolute', right: -5 }} />
            </View>
            <View style={styles.userContact}>
              <Text style={styles.userName}>
                {props.rebelfiContact ? props.rebelfiContact.name : props.name}
              </Text>
              <Text numberOfLines={1} style={styles.userEmail}>
                {
                  (props.rebelfiContact && props.rebelfiContact.username) ||
                  props.email ||
                  formatAddress(props.walletAddress)
                }
              </Text>
            </View>
          </View>
        </View>
      </Pressable>
      <View style={{ display: 'flex', flexDirection: 'row' }}>
        <Button style={styles.payBtn} onPress={props.onPay}>
          <Text style={styles.payBtnTxt}>
            Pay
          </Text>
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  contactContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  // User Info
  userRoot: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'row',
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 48,
    borderWidth: constants.SIZE.BORDER_WIDTH_SM,
    borderColor: constants.COLORS.BORDER_BRIGHT_DARK
  },
  userContact: {
    paddingLeft: constants.SPACING.SM,
  },
  userName: {
    color: constants.COLORS.TEXT_WHITE,
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
    fontFamily: constants.FONTS.Space_Grotesk,
    fontSize: constants.SIZE.TEXT_MD2,
    fontStyle: 'normal',
    fontWeight: '400',
    lineHeight: constants.LINE_HEIGHT.MD
  },
  payBtn: {
    borderRadius: constants.SIZE.BORDER_RADIUS_MD,
    backgroundColor: constants.COLORS.BACKGROUND_PRIMARY,
    height: 32,
    minWidth: 71
  },
  payBtnTxt: {
    color: constants.COLORS.TEXT_BLACK,
    fontFamily: constants.FONTS.Syne_Bold,
    fontStyle: 'normal',
    lineHeight: 14,
    letterSpacing: -0.28,
  },
});
