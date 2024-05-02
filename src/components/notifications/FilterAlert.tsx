import React from 'react';
import { Image, Text, View, StyleSheet, Modal, TouchableOpacity } from 'react-native';

import constants from '../../utils/constants';

type FilterProps = {
  show: boolean | false;
  title: string;
  onClose: any | null;
  onDeny: any | null;
  notification: any;
}

// Define the Filter component
export default function FilterAlert(props: FilterProps) {

  return (
    <Modal
      animationType='fade'
      transparent={true}
      visible={props.show}
      onRequestClose={props.onClose}>
      <View style={styles.content}>
        <View style={styles.dialog}>
          <Text style={styles.title}>{props.title}</Text>
          <View style={[styles.line, {
            marginTop: constants.SPACING.LG,
            marginBottom: constants.SPACING.SM
          }]} />
          <View style={{ width: '70%', flexDirection: 'row', alignItems: 'center' }}>
            <Image source={{ uri: props.notification?.image }} style={styles.image} />
            <View style={{ marginLeft: constants.SPACING.SM }}>
              <TouchableOpacity
                activeOpacity={0.8}
              >
                <Text style={constants.G_STYLE.NOTIFICATION_COUNTERPARTY}>{props.notification?.counterparty}</Text>
              </TouchableOpacity>
              <Text style={{ width: '60%', flexWrap: 'wrap', ...constants.G_STYLE.NOTIFICATION_MESSAGE }}>{props.notification?.message}</Text>
            </View>
          </View>
          <View style={[styles.line, {
            marginTop: constants.SPACING.SM,
            marginBottom: constants.SPACING.LG
          }]} />
          <View style={styles.buttons}>
            <TouchableOpacity
              style={styles.deny}
              onPress={props.onDeny}
              activeOpacity={0.8}
            >
              <Text style={styles.denyText}>Yes, deny</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancel}
              onPress={props.onClose}
              activeOpacity={0.8}
            >
              <Text style={styles.denyText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: constants.SPACING.MD,
    backgroundColor: constants.COLORS.OVERLAY,
  },
  dialog: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    padding: constants.SPACING.MD,
    backgroundColor: constants.COLORS.BACKGROUND_BLACK,
    borderRadius: constants.SIZE.BORDER_RADIUS_MD
  },
  title: {
    fontFamily: constants.FONTS.Space_Grotesk,
    fontSize: constants.SIZE.TEXT_XL,
    fontWeight: '600',
    color: constants.COLORS.TEXT_WHITE,
    textAlign: 'center'
  },
  line: {
    height: 1,
    width: '70%',
    backgroundColor: constants.COLORS.BACKGROUND_TAB_TINT_INACTIVE
  },
  image: {
    width: 48,
    height: 48,
    borderRadius: 24
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%'
  },
  deny: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '45%',
    paddingVertical: constants.SPACING.MD,
    backgroundColor: constants.COLORS.BACKGROUND_BUTTON_DANGER,
    borderRadius: constants.SIZE.BORDER_RADIUS_MD
  },
  denyText: {
    fontFamily: constants.FONTS.Syne_Regular,
    fontSize: constants.SIZE.TEXT_LG,
    fontWeight: '700',
    color: constants.COLORS.TEXT_WHITE
  },
  cancel: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '45%',
    paddingVertical: constants.SPACING.MD,
    // backgroundColor: constants.COLORS.BACKGROUND_BUTTON_DANGER,
    borderWidth: 1,
    borderColor: constants.COLORS.BORDER_BUTTON_WHITE,
    borderRadius: constants.SIZE.BORDER_RADIUS_MD
  }
});
