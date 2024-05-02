import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

import constants from '../../utils/constants';

export default function QRcodeGen({ walletAddress, username, size }: { walletAddress: string, username: string, size: number }) {
  return (
    <View style={styles.myCodeContainer} >
      <View style={styles.qr_svg}>
        {
          (walletAddress && walletAddress.length) ?
            <QRCode
              size={size}
              value={walletAddress}
            /> : username &&
            <QRCode
              size={size}
              value={username}
            />
        }
      </View>
      <Text style={styles.myCode_name}>
        @{username}
      </Text>
      <Text style={styles.myCode_username}>
        Scan to pay @{username}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  myCodeContainer: {
    flex: 1,
    alignItems: 'center'
  },
  qr_svg: {
    marginTop: 20,
    marginBottom: 24,
    padding: 12.64,
    backgroundcolor: constants.COLORS.TEXT_WHITE,
    borderRadius: constants.SIZE.BORDER_RADIUS_MD
  },
  myCode_name: {
    color: constants.COLORS.TEXT_WHITE,
    fontFamily: constants.FONTS.Space_Grotesk,
    fontSize: constants.SIZE.TEXT_XL,
    fontStyle: 'normal',
    fontWeight: '600',
    lineHeight: 32,
    letterSpacing: -0.48
  },
  myCode_username: {
    color: constants.COLORS.TEXT_MUTED,
    fontFamily: constants.FONTS.Space_Grotesk,
    fontSize: 16,
    fontStyle: 'normal',
    fontWeight: '400',
    lineHeight: 32,
    letterSpacing: -0.32
  },
});
