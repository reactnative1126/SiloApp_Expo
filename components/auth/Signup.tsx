import * as React from 'react';
import { Text, View, StyleSheet, StatusBar, Image } from 'react-native';
import constants from '../../constants';

// or any pure javascript modules available in npm
import { Button, Card } from 'react-native-paper';
import { useAuthActions } from "../../_recoil/auth/auth.actions";
import { log } from "../../_util/debug";
import { Link, useRouter } from 'expo-router';
import { SvgXml } from 'react-native-svg'
import PhoneInput from 'react-native-international-phone-number'
import i18n from '../../translations';


export default function Login() {
  const [inputValue, setInputValue] = React.useState<string>('');
  const [errorMsg, setErrorMsg] = React.useState<string>('');
  const [selectedCountry, setSelectedCountry] = React.useState<any>(null);

  const authActions = useAuthActions();
  const navigation = useRouter();

  const handleSubmit = async () => {
    try {
      const phoneNum = `${selectedCountry.callingCode}${inputValue}`.replaceAll(' ', '');
      const { requestId } = await authActions.requestPhoneVerification(phoneNum);

      if (requestId) {
        navigation.push('/auth/phone-verify-code-input')
        setInputValue('');
      }
    } catch (error: any) {
      log(error);
      setErrorMsg(error.message);
    }
  };

  function handleInputValue(phoneNumber: any) {
    setInputValue(phoneNumber);
  }

  function handleSelectedCountry(country: any) {
    setSelectedCountry(country);
  }


  return (
    <View style={constants.G_STYLE.ROOT_VIEW}>
      <StatusBar backgroundColor="transparent" barStyle="light-content" />
      <View style={styles.content}>
        <View style={{ top: '15%', flexDirection: 'row', justifyContent: 'space-between' }}>
          <Link href={{ pathname: "/", params: { status: 'signup' } }} style={{ marginLeft: '3%' }}>
            <SvgXml
              xml={constants.SVGS.back}
              width={24}
              height={24}
            />
          </Link>
          <Link href='/' style={{ marginRight: '3%' }}>
            <SvgXml
              xml={constants.SVGS.close}
              width={24}
              height={24}
            />
          </Link>
        </View>
        <View style={constants.G_STYLE.LOGO_CONTAINER}>
          <Text style={{ ...constants.G_STYLE.LOGO_TEXT, alignSelf: 'center', marginBottom: 10, paddingLeft: '10%', paddingRight: '10%' }}>
            {i18n.t('signupScreen.headerTxt')}
          </Text>
          <Text style={constants.G_STYLE.TEXT_SM_DESCRIPTION}>
            {i18n.t('signupScreen.headerDesc')}
          </Text>
        </View>

        <View style={{ top: '30%', width: '90%', marginLeft: '4.5%' }}>
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
            placeholder=" "
            onChangePhoneNumber={handleInputValue}
            selectedCountry={selectedCountry}
            onChangeSelectedCountry={handleSelectedCountry}
          />
          {errorMsg && <Text style={styles.dangerText}>{i18n.t('signupScreen.phoneNumErrMsg')}</Text>}
        </View>

        <View style={styles.btnGroup}>
          <Button
            disabled={errorMsg.length > 0 || inputValue.length === 0}
            onPress={handleSubmit}
            style={[constants.G_STYLE.BTN_PRIMARY, (errorMsg.length > 0 || inputValue.length === 0) && constants.G_STYLE.BTN_DISABLED]}>
            <Text style={{
              color: errorMsg.length > 0 ? constants.COLORS.TEXT_DISABLED : constants.COLORS.TEXT_BLACK,
              fontFamily: constants.FONTS.Syne_Regular,
              fontWeight: '700'
            }}>
              {i18n.t('global.signupBtn')}
            </Text>
          </Button>
          <Text style={constants.G_STYLE.BTN_DESCRIPTION}>
            {i18n.t('global.alreadyHaveAccountBtn')} <Link style={{ ...constants.G_STYLE.BTN_DESCRIPTION, color: constants.COLORS.TEXT_PRIMARY }} href={{ pathname: "/auth/login-signup", params: { status: 'login' } }} ><Text>{i18n.t('global.loginBtn')}</Text></Link>
          </Text>
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
    fontSize: constants.SIZE.TEXT_MD2,
    fontStyle: 'normal',
    fontWeight: '400',
    lineHeight: constants.LINE_HEIGHT.MD,
    alignSelf: 'flex-end',
    marginTop: constants.SPACING.SM
  }
});
