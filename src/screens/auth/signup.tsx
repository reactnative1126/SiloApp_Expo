import React, { useState } from 'react';
import { Text, View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import PhoneInput from 'react-native-international-phone-number';
import { Button } from 'react-native-paper';
import Toast from 'react-native-toast-message';

import Container from '../../components/common/Container';
import Header from '../../components/common/Header';

import constants from '../../utils/constants';
import { log } from '../../utils/functions';
import i18n from '../../utils/tanslations';
import useKeyboardHeight from '../../utils/keyboard';

import { useAuthActions } from '../../_recoil/auth/auth.actions';

export default function SignUp(props: any) {
  const authActions = useAuthActions();
  const keyboardHeight = useKeyboardHeight();

  const [inputValue, setInputValue] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [selectedCountry, setSelectedCountry] = useState<any>(null);

  const handleSubmit = async () => {
    try {
      const phoneNum = `${selectedCountry.callingCode}${inputValue}`.replaceAll(' ', '');
      const res = await authActions.requestPhoneVerification(phoneNum, 'There was a problem requesting phone verification.');

      if (res.success) {
        setInputValue('');
        setErrorMsg('');
        props.navigation.push('PhoneVerification');
      } else {
        // const { error } = res.data.errors;
        setErrorMsg(res.message as string);
        // Toast.show({ type: 'error', text1: 'Request Phone Verification Error', text2: res.message });
      }
    } catch (error: any) {
      log(error);
    }
  };

  function handleInputValue(phoneNumber: any) {
    setErrorMsg('');
    setInputValue(phoneNumber);
  }

  function handleSelectedCountry(country: any) {
    setSelectedCountry(country);
  }

  return (
    <Container>
      <View style={styles.content}>
        <Header
          close
          onBack={() => props.navigation.pop()}
          onClose={() => props.navigation.popToTop()}
        />
        <ScrollView
          style={[styles.content, { paddingVertical: constants.SPACING.SM }]}
          showsVerticalScrollIndicator={false}
        >
          <Text style={constants.G_STYLE.LOGO_TEXT}>
            {i18n.t('signupScreen.headerTxt')}
          </Text>
          <Text style={[constants.G_STYLE.TEXT_SM_DESCRIPTION, { marginTop: constants.SPACING.MD }]}>
            {i18n.t('signupScreen.headerDesc')}
          </Text>

          <View style={{ marginTop: constants.SPACING.LG, paddingHorizontal: constants.SPACING.MD, width: wp('100%') }}>
            <PhoneInput
              focusable={true}
              selectionColor={constants.COLORS.TEXT_WHITE}
              phoneInputStyles={{
                container: {
                  backgroundColor: constants.COLORS.BACKGROUND_INPUT,
                  borderWidth: constants.SIZE.BORDER_WIDTH_SM,
                  borderStyle: 'solid',
                  borderRadius: constants.SIZE.BORDER_RADIUS_MD,
                  borderColor: !errorMsg ? constants.COLORS.BACKGROUND_INPUT : constants.COLORS.BORDER_DANGER,
                  margin: 0
                },
                flagContainer: {
                  borderTopLeftRadius: 7,
                  borderBottomLeftRadius: 7,
                  backgroundColor: constants.COLORS.BACKGROUND_FLAG_BOX,
                  justifyContent: 'center',
                  borderRightWidth: constants.SIZE.BORDER_WIDTH_SM,
                  borderColor: constants.COLORS.BORDER_LIGHTDARK,
                },
                flag: {},
                callingCode: {
                  fontFamily: constants.FONTS.Space_Grotesk,
                  fontSize: constants.SIZE.TEXT_LG2,
                  fontStyle: 'normal',
                  fontWeight: '400',
                  lineHeight: constants.LINE_HEIGHT.MD,
                  letterSpacing: -0.36,
                  color: constants.COLORS.TEXT_WHITE
                },
                input: {
                  color: constants.COLORS.TEXT_WHITE
                },
              }}
              keyboardType='phone-pad'
              autoFocus={true}
              value={inputValue}
              placeholder=' '
              onChangePhoneNumber={handleInputValue}
              selectedCountry={selectedCountry}
              onChangeSelectedCountry={handleSelectedCountry}
            />
            {errorMsg && <Text style={styles.dangerText}>{errorMsg}</Text>}
          </View>
        </ScrollView>

        <View style={[styles.btnGroup, { bottom: keyboardHeight === 0 ? 0 : keyboardHeight - 35 }]}>
          <Button
            disabled={errorMsg.length > 0 || inputValue.length === 0}
            onPress={handleSubmit}
            style={[constants.G_STYLE.BTN_PRIMARY, (errorMsg.length > 0 || inputValue.length === 0) && constants.G_STYLE.BTN_DISABLED]}>
            <Text style={{
              color: errorMsg.length > 0 ? constants.COLORS.TEXT_DISABLED : constants.COLORS.TEXT_BLACK,
              fontFamily: constants.FONTS.Syne_Regular,
              fontWeight: '700'
            }}>
              {i18n.t('signupScreen.sendCode')}
            </Text>
          </Button>
          <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
            <Text style={constants.G_STYLE.BTN_DESCRIPTION}>
              {i18n.t('global.alreadyHaveAccountBtn')}
            </Text>
            <TouchableOpacity
              onPress={() => props.navigation.replace('SignIn')}
              activeOpacity={0.8}>
              <Text style={{ ...constants.G_STYLE.BTN_DESCRIPTION, color: constants.COLORS.TEXT_PRIMARY, marginLeft: constants.SPACING.SM }}>{i18n.t('global.loginBtn')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  btnGroup: {
    position: 'absolute',
    bottom: 0,
    width: wp('100%'),
    backgroundColor: constants.COLORS.BACKGROUND_BLACK,
    paddingTop: constants.SPACING.SM
  },
  dangerText: {
    color: constants.COLORS.TEXT_DANGER,
    fontFamily: constants.FONTS.Space_Grotesk,
    fontSize: constants.SIZE.TEXT_MD2,
    fontStyle: 'normal',
    fontWeight: '400',
    lineHeight: constants.LINE_HEIGHT.MD,
    alignSelf: 'flex-end',
    marginTop: constants.SPACING.SM
  }
});
