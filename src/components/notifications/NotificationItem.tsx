import React from 'react';
import { Image, View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

import constants from '../../utils/constants';

type NotificationProps = {
  image: any | null;
  counterparty: string;
  message: string;
  isNew: boolean | false;
  actions: Array<string>;
  actionStatus: string;
  onAccept: any;
  onDecline: any;
  onSend: any;
  onDeny: any;
  onRevoke: any;
}

// Define the Notification component
export default function NotificationItem(props: NotificationProps) {
  return (
    <View style={styles.container}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Image source={{ uri: props.image }} style={styles.image} />
        <View style={{ marginLeft: constants.SPACING.SM }}>
          <TouchableOpacity activeOpacity={0.8}>
            <Text style={constants.G_STYLE.NOTIFICATION_COUNTERPARTY}>{props.counterparty}</Text>
          </TouchableOpacity>
          <Text style={{ width: wp('100%') - 100, flexWrap: 'wrap', ...constants.G_STYLE.NOTIFICATION_MESSAGE }}>{props.message}</Text>
        </View>
        {props.isNew && (<View style={styles.inNew} />)}
      </View>
      <View style={{ width: '100%', alignItems: 'flex-end' }}>
        {(props.actions && props.actions[0] === 'Accept') && (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity
              style={styles.acceptBtn}
              onPress={props.onAccept}
              activeOpacity={0.8}
            >
              <Text style={styles.acceptBtnText}>Accept</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={props.onDecline}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelBtnText}>Deny</Text>
            </TouchableOpacity>
          </View>
        )}
        {(props.actions && props.actions[0] === 'Send') && (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity
              style={styles.acceptBtn}
              onPress={props.onSend}
              activeOpacity={0.8}
            >
              <Text style={styles.acceptBtnText}>Send</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={props.onDeny}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelBtnText}>Deny</Text>
            </TouchableOpacity>
          </View>
        )}
        {(props.actions && props.actions[0] === 'Revoke') && (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={props.onRevoke}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelBtnText}>Revoke</Text>
            </TouchableOpacity>
          </View>
        )}
        {(!props.actions && props.actionStatus === 'Accepted') && (
          <Text style={styles.accepted}>Approved</Text>
        )}
        {(!props.actions && props.actionStatus === 'Denied') && (
          <Text style={styles.denied}>Declined</Text>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    padding: constants.SPACING.SM,
    borderBottomWidth: constants.SIZE.BORDER_WIDTH_SM,
    borderBottomColor: constants.COLORS.BORDER_BRIGHT_DARK,
  },
  image: {
    width: 48,
    height: 48,
    borderRadius: 24
  },
  inNew: {
    position: 'absolute',
    top: 5,
    left: 40,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: constants.COLORS.BACKGROUND_BLACK,
    backgroundColor: constants.COLORS.BORDER_DANGER
  },
  accepted: {
    color: constants.COLORS.BACKGROUND_BUTTON_PRIMARY,
    fontFamily: constants.FONTS.Space_Grotesk,
    fontSize: constants.SIZE.TEXT_MD2,
    fontStyle: 'normal',
    fontWeight: '700',
    lineHeight: constants.LINE_HEIGHT.MD,
  },
  denied: {
    color: constants.COLORS.BACKGROUND_BUTTON_DANGER,
    fontFamily: constants.FONTS.Space_Grotesk,
    fontSize: constants.SIZE.TEXT_MD2,
    fontStyle: 'normal',
    fontWeight: '700',
    lineHeight: constants.LINE_HEIGHT.MD,
  },
  acceptBtn: {
    paddingVertical: 6,
    paddingHorizontal: constants.SPACING.SM,
    borderRadius: constants.SIZE.BORDER_RADIUS_MD,
    backgroundColor: constants.COLORS.BACKGROUND_BUTTON_PRIMARY
  },
  acceptBtnText: {
    color: constants.COLORS.BACKGROUND_BLACK,
    fontFamily: constants.FONTS.Space_Grotesk,
    fontSize: constants.SIZE.TEXT_MD2,
    fontStyle: 'normal',
    fontWeight: '700',
  },
  cancelBtn: {
    marginLeft: constants.SPACING.SM,
    paddingVertical: 6,
    paddingHorizontal: constants.SPACING.SM,
    borderRadius: constants.SIZE.BORDER_RADIUS_MD,
    borderWidth: 1,
    borderColor: constants.COLORS.BACKGROUND_WHITE
  },
  cancelBtnText: {
    color: constants.COLORS.BACKGROUND_WHITE,
    fontFamily: constants.FONTS.Space_Grotesk,
    fontSize: constants.SIZE.TEXT_MD2,
    fontStyle: 'normal',
    fontWeight: '700',
  },
});
