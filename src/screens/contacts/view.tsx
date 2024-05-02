import React, { useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { Text, View, StyleSheet, ScrollView } from 'react-native';
import { Modal, Portal, Button } from 'react-native-paper';
import Toast from 'react-native-toast-message';
import { SvgXml } from 'react-native-svg';

import Container from '../../components/common/Container';
import Header from '../../components/contacts/Header';
import ContactDetail from '../../components/contacts/ContactDetail';
import Avatar from '../../components/common/Avatar';

import constants from '../../utils/constants';
import { log, formatAddress } from '../../utils/functions';

import { useUserActions } from '../../_recoil/user/user.actions';

export default function ContactView(props: any) {
  const userActions = useUserActions();

  const params = useLocalSearchParams();
  const { contactID, isNew, name, email, walletAddress, rebelfiContact, profileImage, targetType, targetId, queryType } = params as any;

  const [visible, setVisible] = useState(false);

  const showModal = () => setVisible(true);
  const hideModal = () => setVisible(false);

  const handleDelete = async () => {
    try {
      const res = await userActions.delContact(contactID, 'There was a problem delete contact.');

      if (res.success) {
        Toast.show({ type: 'success', text1: 'Deleted Contact Successfuly' });
        // props.navigation.push('Contacts');
        props.navigation.popToTop();
      } else {
        Toast.show({ type: 'error', text1: 'Deletion Error', text2: res.message });
      }
      hideModal();
    } catch (error: any) {
      log(error);
    }
  }

  const renderUserImage = () => {
    if (profileImage?.length) {
      return (
        <Avatar
          name={name}
          image={profileImage}
          width={48}
          height={48}
          radius={24}
          size={20}
        />
      )
    } else if (walletAddress?.length) {
      return (
        <View>
          <SvgXml
            xml={constants.SVGS.wallet_contact}
            width={48}
            height={48}
            style={styles.modalmgStyle}
          />
        </View>
      )
    } else if (email?.length) {
      return (
        <View>
          <SvgXml
            xml={constants.SVGS.email_contact}
            width={48}
            height={48}
            style={styles.modalmgStyle}
          />
        </View>
      )
    } else {
      return (
        <View>
          <SvgXml
            xml={constants.SVGS.blank_user}
            width={48}
            height={48}
            style={styles.modalmgStyle}
          />
        </View>
      )
    }
  }

  const rebelfiContactObj = JSON.parse(rebelfiContact);

  return (
    <Container>
      <Header
        back
        title='Contact'
        remove={isNew != '1' ? true : false}
        onBack={() => { props.navigation.pop() }}
        onModal={showModal}
      />
      <ScrollView
        style={[styles.content, { paddingHorizontal: constants.SPACING.MD }]}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <ContactDetail
          imgWidth={64}
          imgHeight={64}
          isNew={isNew}
          userInfo={{ contactID, name, email, walletAddress, rebelfiContact, profileImage, targetType, targetId, queryType }}
          navigation={props.navigation}
        />
      </ScrollView>
      <Portal>
        <Modal visible={visible} onDismiss={hideModal} contentContainerStyle={styles.modalContainer}>
          <Text style={{
            color: constants.COLORS.TEXT_WHITE,
            fontFamily: constants.FONTS.Space_Grotesk,
            fontSize: constants.SIZE.TEXT_XL,
            fontStyle: 'normal',
            fontWeight: '600',
            lineHeight: constants.LINE_HEIGHT.MD2,
            letterSpacing: -0.48,
            alignSelf: 'stretch',
            textAlign: 'center'
          }}>
            Are you sure you would like to remove this user from your contacts?
          </Text>

          <View style={styles.modalUserInfo}>
            {renderUserImage()}
            <View style={styles.userContact}>
              <Text style={styles.userName}>
                {formatAddress(walletAddress) || email || (rebelfiContact && rebelfiContactObj.addressValue) || name}
              </Text>
              {
                rebelfiContactObj?.id &&
                <View>
                  <Text style={styles.userEmail}>
                    {rebelfiContactObj?.username}
                  </Text>
                </View>
              }

            </View>
          </View>

          <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'space-between' }}>
            <Button
              onPress={handleDelete}
              style={{
                backgroundColor: constants.COLORS.BACKGROUND_BUTTON_DANGER,
                borderRadius: constants.SIZE.BORDER_RADIUS_MD,
                width: '45%'
              }}>
              <Text style={[constants.G_STYLE.BUTTON_TEXT, { color: constants.COLORS.TEXT_WHITE }]}>
                Yes, remove
              </Text>
            </Button>
            <Button style={[constants.G_STYLE.BTN_OUTLINE, {
              borderColor: constants.COLORS.BORDER_BUTTON_WHITE,
              borderRadius: constants.SIZE.BORDER_RADIUS_MD,
              width: '45%'
            }]}
              onPress={hideModal}
            >
              <Text style={[constants.G_STYLE.BUTTON_TEXT, { color: constants.COLORS.TEXT_WHITE }]}>
                Cancel
              </Text>
            </Button>
          </View>
        </Modal>
      </Portal>
    </Container>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1
  },
  // Modal
  modalContainer: {
    backgroundColor: constants.COLORS.BACKGROUND_BLACK,
    color: constants.COLORS.TEXT_WHITE,
    padding: 24,
    marginHorizontal: 16,
    borderRadius: constants.SIZE.BORDER_RADIUS_MD,
    alignItems: 'center',
    textAlign: 'center',
    alignContent: 'center'
  },
  modalUserInfo: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: constants.COLORS.BORDER_BRIGHT_DARK_OPACITY,
    paddingVertical: 16,
    marginVertical: 24
  },
  userContact: {
    paddingLeft: constants.SPACING.SM,
    justifyContent: 'center'
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
    fontFamily: constants.FONTS.Wix_Madefor_Display,
    fontSize: constants.SIZE.TEXT_MD2,
    fontStyle: 'normal',
    fontWeight: '500',
    lineHeight: constants.LINE_HEIGHT.MD
  },
  modalmgStyle: {
    width: 48,
    height: 48,
    borderRadius: 48
  }
});