import React from 'react';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import Toast from 'react-native-toast-message';
import { Button } from 'react-native-paper';
import { SvgXml } from 'react-native-svg';

import UserImage from '../common/UserImage';

import constants from '../../utils/constants';
import { log, formatAddress } from '../../utils/functions';

import { useUserActions } from '../../_recoil/user/user.actions';

export default function ContactDetail(props: any) {
  const userActions = useUserActions();

  const { imgWidth, imgHeight, isNew, navigation }: { imgWidth: number, imgHeight: number, isNew: number, navigation: any } = props;
  const { contactID, name, email, walletAddress, rebelfiContact, profileImage, targetType, targetId, queryType }:
    { contactID: string, name: string, email: string, walletAddress: string, rebelfiContact: any, profileImage: string, targetType: string, targetId: string, queryType: string } = props.userInfo;

  const handleSubmit = async () => {
    if (targetType) {
      try {
        const res = await userActions.addContact(name, email, walletAddress, 'There was a problem adding contact.');

        if (res.success) {
          Toast.show({ type: 'success', text1: 'Created Contact Successfuly' });
          props.navigation.pop();
        } else {
          Toast.show({ type: 'error', text1: 'Create Contact Error', text2: res.message });
        }
      } catch (error: any) {
        log(error);
      }
    } else {
      navigation.push('ContactCreate', { name, email, walletAddress });
    }
  };

  return (
    <View style={[constants.G_STYLE.CARD_BOX, { marginTop: 30 }]}>
      <UserImage
        userInfo={{
          name,
          email,
          walletAddress: formatAddress(walletAddress),
          rebelfiContact,
          profileImage: rebelfiContact.id ? JSON.parse(rebelfiContact)?.profileImage : profileImage
        }}
        style={{ width: isNew == 1 ? imgWidth : 136, height: isNew == 1 ? imgHeight : 136, borderRadius: isNew == 1 ? 0 : imgWidth }}
        width={imgWidth}
        height={imgHeight}
        textStyle={{
          color: constants.COLORS.TEXT_WHITE,
          fontFamily: constants.FONTS.Space_Grotesk,
          fontSize: constants.SIZE.TEXT_LG3,
          fontStyle: 'normal',
          fontWeight: '600',
          lineHeight: constants.LINE_HEIGHT.MD,
          letterSpacing: -0.48,
          marginTop: 16
        }}
        subTextStyle={{
          color: constants.COLORS.TEXT_MUTED,
          fontFamily: constants.FONTS.Space_Grotesk,
          fontSize: constants.SIZE.TEXT_LG,
          fontStyle: 'normal',
          fontWeight: '400',
          lineHeight: constants.LINE_HEIGHT.MD,
          letterSpacing: -0.32
        }}
      />
      <View style={{ marginTop: 24, width: '100%' }}>
        <Button
          style={[constants.G_STYLE.BTN_PRIMARY, { borderColor: constants.COLORS.BORDER_BUTTON_WHITE }]}
          onPress={() => navigation.push('SendFunds', { userInfo: props.userInfo })}
        >
          <Text style={[constants.G_STYLE.BUTTON_TEXT, {
            fontFamily: constants.FONTS.Syne_Bold,
            fontSize: constants.SIZE.TEXT_LG,
            lineHeight: constants.LINE_HEIGHT.MD,
            letterSpacing: -0.32,
            color: constants.COLORS.TEXT_BLACK
          }]}>
            Pay
          </Text>
        </Button>
      </View>
      {
        isNew == 1 &&
        <TouchableOpacity
          style={styles.addToContact}
          onPress={handleSubmit}
        >
          <Text style={styles.addToContactText}>Add to contacts</Text>
          <SvgXml
            xml={constants.SVGS.plus}
            width={24}
            height={24}
            style={{ marginLeft: 8 }}
          />
        </TouchableOpacity>
      }
    </View>
  );
}

const styles = StyleSheet.create({
  addToContact: {
    marginTop: 16,
    alignSelf: 'center',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'center',
    flexDirection: 'row'
  },
  addToContactText: {
    color: constants.COLORS.TEXT_WHITE,
    fontFamily: constants.FONTS.Space_Grotesk,
    fontSize: constants.SIZE.TEXT_LG,
    fontStyle: 'normal',
    fontWeight: '400',
    lineHeight: 24,
    letterSpacing: -0.32
  },
});
