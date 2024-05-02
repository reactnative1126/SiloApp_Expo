import React, { useState } from 'react';
import { Text, View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Button } from 'react-native-paper';
import Toast from 'react-native-toast-message';

import Container from '../../components/common/Container';
import Header from '../../components/common/Header';
import CustomInput from '../../components/common/CustomInput';

import constants from '../../utils/constants';
import { log } from '../../utils/functions';
import i18n from '../../utils/tanslations';
import useKeyboardHeight from '../../utils/keyboard';

import { useAuthActions } from '../../_recoil/auth/auth.actions';

export default function SignIn(props: any) {
  const authActions = useAuthActions();
  const keyboardHeight = useKeyboardHeight();

  const [hasError, setHasError] = useState<boolean>(false);
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [usernameErr, setUsernameErr] = useState<string>('');
  const [passwordErr, setPasswordErr] = useState<string>('');

  const handleSubmit = async () => {
    if (username === '' || password === '') {
      setUsernameErr(username === '' ? i18n.t('loginScreen.unameRequiredErrorMsg') : '');
      setPasswordErr(password === '' ? i18n.t('loginScreen.pwdRequiredErrorMsg') : '');
    } else {
      try {
        const res = await authActions.login(username, password, 'There was a problem logging in.');

        if (res.success) {
          setUsername('');
          setPassword('');
          setUsernameErr('');
          setPasswordErr('');
        } else {
          // const { username, password } = res.data.errors;
          // setUsernameErr(username);
          // setPasswordErr(password);
          Toast.show({ type: 'error', text1: 'Login Error', text2: res.message });
        }
      } catch (error: any) {
        log(error);
      }
    }
  };

  return (
    <Container>
      <View style={styles.content}>
        <Header
          close
          title={i18n.t('loginScreen.headerTxt')}
          onBack={() => props.navigation.pop()}
          onClose={() => props.navigation.popToTop()}
        />
        <ScrollView
          style={[styles.content, { paddingVertical: constants.SPACING.SM }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={{ width: wp('100%'), paddingHorizontal: constants.SPACING.MD }}>
            <CustomInput textValue={username} onChangeText={setUsername} label={i18n.t('loginScreen.unameLabel')} errorMsg={usernameErr} autoFocus={true} />
          </View>
          <View style={{ width: wp('100%'), paddingHorizontal: constants.SPACING.MD }}>
            <CustomInput textValue={password} onChangeText={setPassword} type='password' label={i18n.t('loginScreen.pwdLabel')} errorMsg={passwordErr} />
            <TouchableOpacity
              onPress={() => props.navigation.push('ForgetPassword')}
              activeOpacity={0.8}
            >
              <Text style={{ ...constants.G_STYLE.PRIMARY_SM_TEXT, alignSelf: 'flex-end', textAlign: 'right', marginTop: passwordErr.length > 0 ? -18 : 0 }}>{i18n.t('loginScreen.forgotPwdTxt')}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        <View style={[styles.btnGroup, { bottom: keyboardHeight === 0 ? 0 : keyboardHeight - 35 }]}>
          <Button onPress={handleSubmit} disabled={hasError} style={[constants.G_STYLE.BTN_PRIMARY, hasError && constants.G_STYLE.BTN_DISABLED]}>
            <Text style={{ color: (hasError) ? constants.COLORS.TEXT_DISABLED : constants.COLORS.TEXT_BLACK, fontFamily: constants.FONTS.Syne_Regular, fontWeight: '700' }}>{i18n.t('global.signinBtn')}</Text>
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
  },
});
