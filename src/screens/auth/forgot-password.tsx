import React, { useState } from 'react';
import { Text, View, StyleSheet, ScrollView } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Button } from 'react-native-paper';

import Container from '../../components/common/Container';
import Header from '../../components/common/Header';
import CustomInput from '../../components/common/CustomInput';

import constants from '../../utils/constants';
import { log } from '../../utils/functions';
import i18n from '../../utils/tanslations';
import useKeyboardHeight from '../../utils/keyboard';

export default function ForgetPassword(props: any) {
  const keyboardHeight = useKeyboardHeight();

  const [hasError, setHasError] = useState<boolean>(false);
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [passwordErr, setPasswordErr] = useState<string>('');
  const [confirmPasswordErr, setConfirmPasswordErr] = useState<string>('');

  const handleSubmit = async () => {
    if (password === '' || confirmPassword === '') {
      setPasswordErr(password === '' ? i18n.t('forgotPwdScreen.pwdRequiredErrorMsg') : '');
      setConfirmPasswordErr(confirmPassword === '' ? i18n.t('forgotPwdScreen.pwdCRequiredErrorMsg') : '');
    } else {
      if (password !== confirmPassword) {
        setPasswordErr('');
        setConfirmPasswordErr(i18n.t('forgotPwdScreen.pwdNotMatchErrorMsg'));
      } else {
        try {

        } catch (error: any) {
          log(error);
        }
      }
    }
  };

  return (
    <Container>
      <View style={styles.content}>
        <Header
          back
          close
          title={i18n.t('forgotPwdScreen.headerTxt')}
          onBack={() => props.navigation.pop()}
          onClose={() => props.navigation.popToTop()}
        />
        <ScrollView
          style={[styles.content, { paddingVertical: constants.SPACING.SM }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={{ width: wp('100%'), paddingHorizontal: constants.SPACING.MD }}>
            <CustomInput hasError={true} textValue={password} onChangeText={setPassword} type='password' label={i18n.t('forgotPwdScreen.pwdLabel')} errorMsg={passwordErr} autoFocus={true} />
          </View>
          <View style={{ width: wp('100%'), paddingHorizontal: constants.SPACING.MD }}>
            <CustomInput hasError={true} textValue={confirmPassword} onChangeText={setConfirmPassword} type='password' label={i18n.t('forgotPwdScreen.pwdCLabel')} errorMsg={confirmPasswordErr} />
          </View>
        </ScrollView>

        <View style={[styles.btnGroup, { bottom: keyboardHeight === 0 ? 0 : keyboardHeight - 35 }]}>
          <Button disabled={hasError} onPress={handleSubmit} style={[constants.G_STYLE.BTN_PRIMARY, hasError && constants.G_STYLE.BTN_DISABLED]}>
            <Text style={{ color: (hasError) ? constants.COLORS.TEXT_DISABLED : constants.COLORS.TEXT_BLACK, fontFamily: constants.FONTS.Syne_Regular, fontWeight: '700' }}>{i18n.t('forgotPwdScreen.resetBtn')}</Text>
          </Button>
          <Text style={constants.G_STYLE.BTN_DESCRIPTION}>{' '}</Text>
        </View>
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1
  },
  btnGroup: {
    position: 'absolute',
    bottom: 0,
    width: wp('100%'),
    backgroundColor: constants.COLORS.BACKGROUND_BLACK,
    paddingTop: constants.SPACING.SM
  }
});
