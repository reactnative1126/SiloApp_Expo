import * as React from 'react';
import { Text, View, StyleSheet, StatusBar, SafeAreaView } from 'react-native';
import constants from '../../constants';
import { Button } from 'react-native-paper';
import { Link, useRouter } from 'expo-router';
import { SvgXml } from 'react-native-svg';
import CustomInput from '../../components/CustomInput';
import { useAuthActions } from '../../_recoil/auth/auth.actions';
import { log } from '../../_util/debug';
import Toast from 'react-native-toast-message';
import i18n from '../../translations';

export default function RegisterForm() {
  const [hasError, setHasError] = React.useState<boolean>(false);
  const [username, setUsername] = React.useState<string>('');
  const [password, setPassword] = React.useState<string>('');
  const [usernameErr, setUsernameErr] = React.useState<string>('');
  const [passwordErr, setPasswordErr] = React.useState<string>('');

  const authActions = useAuthActions();
  const navigation = useRouter();

  const handleSubmit = async () => {
    if (username === '' || password === '') {
      setUsernameErr(username === '' ? i18n.t('loginScreen.unameRequiredErrorMsg') : '');
      setPasswordErr(password === '' ? i18n.t('loginScreen.pwdRequiredErrorMsg') : '');
    } else {
      try {
        const res = await authActions.login(username, password);
        if (res.authToken) {
          setUsername('');
          setPassword('');
          navigation.push('/dashboard');
        }
      } catch (error: any) {
        log(error);
      }
    }
  };

  return (
    <View style={constants.G_STYLE.ROOT_VIEW}>
      <StatusBar backgroundColor="transparent" barStyle="light-content" />
      <View style={styles.content}>
        <View style={{ top: '15%', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 }}>
          <Link href={{ pathname: "/" }} style={{ marginLeft: '3%', verticalAlign: 'middle' }}>
            <SvgXml
              xml={constants.SVGS.back}
              width={24}
              height={24}
            />
          </Link>
          <Text style={constants.G_STYLE.LOGO_TEXT}>
            {i18n.t('loginScreen.headerTxt')}
          </Text>
          <Link href='/' style={{ marginRight: '3%', verticalAlign: 'middle' }}>
            <SvgXml
              xml={constants.SVGS.close}
              width={24}
              height={24}
            />
          </Link>
        </View>
        <Toast />
        <SafeAreaView style={styles.root}>
          <View style={{ width: '90%', marginLeft: '5%' }}>
            <CustomInput textValue={username} onChangeText={setUsername} label={i18n.t('loginScreen.unameLabel')} errorMsg={usernameErr} />
          </View>
          <View style={{ width: '90%', marginLeft: '5%' }}>
            <CustomInput textValue={password} onChangeText={setPassword} type='password' label={i18n.t('loginScreen.pwdLabel')} errorMsg={passwordErr} />
            <Link href='/auth/forgot-password' style={{ textAlign: 'right', marginTop: passwordErr.length > 0 ? -18 : 0 }}>
              <Text style={{ ...constants.G_STYLE.PRIMARY_SM_TEXT, alignSelf: 'flex-end' }}>{i18n.t('loginScreen.forgotPwdTxt')}</Text>
            </Link>
          </View>
        </SafeAreaView>

        <View style={[styles.btnGroup, { marginBottom: 47 }]}>
          <Button onPress={handleSubmit} disabled={hasError} style={[constants.G_STYLE.BTN_PRIMARY, hasError && constants.G_STYLE.BTN_DISABLED]}>
            <Text style={{ color: (hasError) ? constants.COLORS.TEXT_DISABLED : constants.COLORS.TEXT_BLACK, fontFamily: constants.FONTS.Syne_Regular, fontWeight: '700' }}>{i18n.t('global.signinBtn')}</Text>
          </Button>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    position: "absolute",
    left: 0,
    right: 0,
    width: '100%',
    height: '100%',
    opacity: 0.25,
  },
  content: {
    height: '100%'
  },
  btnGroup: {
    position: "absolute",
    bottom: 0,
    width: '100%'
  },
  dangerText: {
    color: constants.COLORS.TEXT_DANGER,
    fontFamily: constants.FONTS.Space_Grotesk,
    fontSize: constants.SIZE.TEXT_SM,
    fontStyle: 'normal',
    fontWeight: '400',
    lineHeight: constants.LINE_HEIGHT.MD,
    alignSelf: 'flex-end'
  },
  root: { color: constants.COLORS.TEXT_WHITE, top: '13%' },
  title: { textAlign: 'center', fontSize: constants.SIZE.TEXT_XXL },
  codeFieldRoot: { marginTop: 20, marginBottom: 10 },
  cell: {
    backgroundColor: constants.COLORS.BACKGROUND_LIGHT_DARK,
    width: 48,
    height: 48,
    borderWidth: constants.SIZE.BORDER_WIDTH_SM,
    borderColor: constants.COLORS.BORDER_BRIGHT_DARK,
    borderRadius: constants.SIZE.BORDER_RADIUS_MD,
    textAlign: 'center',
    color: constants.COLORS.TEXT_WHITE,
    fontFamily: constants.FONTS.Space_Grotesk,
    fontSize: constants.SIZE.TEXT_LG2,
    fontStyle: 'normal',
    fontWeight: '400',
    lineHeight: constants.LINE_HEIGHT.MD, /* 133.333% */
    letterSpacing: -0.36,
    verticalAlign: 'middle'
  },
  focusCell: {
    borderColor: constants.COLORS.BORDER_BUTTON_WHITE,
  },
  errorCell: {
    borderColor: constants.COLORS.BORDER_DANGER
  },
  successCell: {
    borderColor: constants.COLORS.BORDER_PRIMARY
  }
});
