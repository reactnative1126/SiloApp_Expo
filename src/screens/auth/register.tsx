import React, { useState, useEffect, useRef } from 'react';
import { Text, View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Button } from 'react-native-paper';
import Toast from 'react-native-toast-message';
import { SvgXml } from 'react-native-svg';
import SelectDropdown from 'react-native-select-dropdown';

import Container from '../../components/common/Container';
import Header from '../../components/common/Header';
import CustomInput, { CustomInputRefs } from '../../components/common/CustomInput';

import constants from '../../utils/constants';
import { log } from '../../utils/functions';
import i18n from '../../utils/tanslations';
import useKeyboardHeight from '../../utils/keyboard';

import { getCurrencyList } from '../../services/currency';

import { useAuthActions } from '../../_recoil/auth/auth.actions';

export default function Register(props: any) {
  const authActions = useAuthActions();
  const keyboardHeight = useKeyboardHeight();

  const [hasError, setHasError] = useState<boolean>(false);
  // const [name, setName] = useState<string>('');
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  // const [nameErr, setNameErr] = useState<string>('');
  const [firstNameErr, setFirstNameErr] = useState<string>('');
  const [lastNameErr, setLastNameErr] = useState<string>('');
  const [usernameErr, setUsernameErr] = useState<string>('');
  const [emailErr, setEmailErr] = useState<string>('');
  const [passwordErr, setPasswordErr] = useState<string>('');
  const [localCurrencyIdx, setLocalCurrencyIdx] = useState<number>(43);
  const [currencyList, setCurrencyList] = useState<any[]>([]);

  // const nameRef = useRef<CustomInputRefs>(null);
  const firstNameRef = useRef<CustomInputRefs>(null);
  const lastNameRef = useRef<CustomInputRefs>(null);
  const usernameRef = useRef<CustomInputRefs>(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  useEffect(() => {
    getCurrencyList()
      .then(res => {
        setCurrencyList(res.data.data.currencies);
      })
      .catch(error => {
        log(error)
      });
  }, []);

  const handleSubmit = async () => {
    if (firstName === '' || username === '' || email === '' || password === '') {
      setFirstNameErr(firstName === '' ? i18n.t('regiserFormScreen.firstName.requiredError') : '');
      setUsernameErr(username === '' ? i18n.t('regiserFormScreen.uname.requiredError') : '');
      setEmailErr(email === '' ? i18n.t('regiserFormScreen.email.requiredError') : '');
      setPasswordErr(password === '' ? i18n.t('regiserFormScreen.pwd.requiredError') : '');
    } else {
      try {
        const res = await authActions.register(firstName, lastName, username, email, password, currencyList[localCurrencyIdx], 'There was a problem signing up.');

        if (res.success) {
          setFirstName('');
          setLastName('');
          setUsername('');
          setEmail('');
          setPassword('');
          setLocalCurrencyIdx(43);
          setFirstNameErr('');
          setLastNameErr('');
          setUsernameErr('');
          setEmailErr('');
          setPasswordErr('');
          props.navigation.replace('CreatePin');
        } else {
          const { firstName, email, password, username } = res.data.errors;

          setFirstNameErr(firstName);
          setUsernameErr(username);
          setEmailErr(email);
          setPasswordErr(password);
          Toast.show({ type: 'error', text1: 'Register Error', text2: res.message });
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
          back
          close
          title={i18n.t('regiserFormScreen.headerTxt')}
          onBack={() => props.navigation.pop()}
          onClose={() => props.navigation.popToTop()}
        />
        <ScrollView
          style={[styles.content, { paddingVertical: constants.SPACING.SM }]}
          contentContainerStyle={{ paddingBottom: 400 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={{ width: wp('100%'), paddingHorizontal: constants.SPACING.MD }}>
            <CustomInput ref={firstNameRef} textValue={firstName} onChangeText={setFirstName} label={i18n.t('regiserFormScreen.firstName.label')} errorMsg={firstNameErr} autoFocus={true} />
          </View>
          <View style={{ width: wp('100%'), paddingHorizontal: constants.SPACING.MD }}>
            <CustomInput ref={lastNameRef} textValue={lastName} onChangeText={setLastName} label={i18n.t('regiserFormScreen.lastName.label')} errorMsg={lastNameErr} />
          </View>
          <View style={{ width: wp('100%'), paddingHorizontal: constants.SPACING.MD }}>
            <CustomInput ref={usernameRef} textValue={username} onChangeText={setUsername} label={i18n.t('regiserFormScreen.uname.label')} errorMsg={usernameErr} />
          </View>
          <View style={{ width: wp('100%'), paddingHorizontal: constants.SPACING.MD }}>
            <CustomInput ref={emailRef} textValue={email} onChangeText={setEmail} type='email-address' label={i18n.t('regiserFormScreen.email.label')} errorMsg={emailErr} />
          </View>
          <View style={{ width: wp('100%'), paddingHorizontal: constants.SPACING.MD }}>
            <CustomInput ref={passwordRef} textValue={password} onChangeText={setPassword} type='password' label={i18n.t('regiserFormScreen.pwd.label')} errorMsg={passwordErr} />
          </View>
          <View style={{ width: wp('100%'), paddingHorizontal: constants.SPACING.MD }}>
            <Text style={styles.dropDownLabelStyle}>{i18n.t('regiserFormScreen.currency.label')}</Text>
            <SelectDropdown
              dropdownOverlayColor={'false'}
              data={currencyList}
              defaultValue={currencyList[localCurrencyIdx]}
              defaultValueByIndex={localCurrencyIdx}
              onSelect={(selectedItem, index) => {
                setLocalCurrencyIdx(index);
              }}
              defaultButtonText={'Select country'}
              buttonTextAfterSelection={(selectedItem, index) => {
                return selectedItem.name;
              }}
              rowTextForSelection={(item, index) => {
                return item.name;
              }}
              buttonStyle={styles.dropdownBtnStyle}
              renderDropdownIcon={isOpened => {
                return isOpened ?
                  <SvgXml xml={constants.SVGS.upArrow} width={24} height={24} /> :
                  <SvgXml xml={constants.SVGS.downArrow} width={24} height={24} />;
              }}
              dropdownIconPosition={'right'}
              dropdownStyle={styles.dropdownDropdownStyle}
              rowStyle={styles.dropdownRowStyle}
              renderCustomizedButtonChild={(selectedItem, index) => {
                return (
                  <View style={styles.dropdownBtnChildStyle}>
                    <Text style={styles.dropdownBtnEmoji}>{selectedItem ? selectedItem.emoji : ''}</Text>
                    <Text style={styles.dropdownBtnTxt}>{selectedItem ? selectedItem.name : ''}</Text>
                    <Text style={styles.dropdownBtnCode}> {selectedItem ? `(${selectedItem.code})` : ''}</Text>
                  </View>
                );
              }}
              renderCustomizedRowChild={(item, index) => {
                return (
                  <View style={styles.dropdownRowChildStyle}>
                    <Text style={styles.dropdownBtnEmoji}>{item.emoji}</Text>
                    <Text style={styles.dropdownBtnTxt}>{item.name}</Text>
                    <Text style={styles.dropdownBtnCode}> {`(${item.code})`}</Text>
                  </View>
                );
              }}
            />
          </View>
        </ScrollView>

        <View style={[styles.btnGroup, { bottom: keyboardHeight === 0 ? 0 : keyboardHeight - 35 }]}>
          <Button disabled={hasError} onPress={handleSubmit} style={[constants.G_STYLE.BTN_PRIMARY, hasError && constants.G_STYLE.BTN_DISABLED]}>
            <Text style={{ color: (hasError) ? constants.COLORS.TEXT_DISABLED : constants.COLORS.TEXT_BLACK, fontFamily: constants.FONTS.Syne_Regular, fontWeight: '700' }}>{i18n.t('global.signupBtn')}</Text>
          </Button>
          <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
            <Text style={constants.G_STYLE.BTN_DESCRIPTION}>
              {i18n.t('global.alreadyHaveAccountBtn')}
            </Text><TouchableOpacity
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
    flex: 1
  },
  btnGroup: {
    position: 'absolute',
    bottom: 0,
    width: wp('100%'),
    backgroundColor: constants.COLORS.BACKGROUND_BLACK,
    paddingTop: constants.SPACING.SM
  },
  dropdownBtnStyle: {
    width: '100%',
    height: 50,
    backgroundColor: constants.COLORS.BACKGROUND_LIGHT_DARK,
    borderRadius: constants.SIZE.BORDER_RADIUS_MD,
    borderWidth: constants.SIZE.BORDER_WIDTH_SM,
    borderColor: constants.COLORS.BORDER_BRIGHT_DARK
  },
  dropdownDropdownStyle: {
    backgroundColor: constants.COLORS.BACKGROUND_LIGHT_DARK,
    borderRadius: constants.SIZE.BORDER_RADIUS_MD,
    height: 200,
  },
  dropdownRowStyle: {
    borderWidth: constants.SIZE.BORDER_WIDTH_SM,
    borderColor: constants.COLORS.BORDER_BRIGHT_DARK,
    backgroundColor: '#2D2B2B'
  },
  dropdownRowChildStyle: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: constants.COLORS.BACKGROUND_LIGHT_DARK,
    borderWidth: 0
  },
  dropdownBtnChildStyle: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    borderWidth: 0
  },
  dropdownBtnTxt: {
    fontFamily: constants.FONTS.Space_Grotesk,
    fontSize: constants.SIZE.TEXT_LG2,
    fontStyle: 'normal',
    fontWeight: '400',
    lineHeight: constants.LINE_HEIGHT.MD, /* 133.333% */
    letterSpacing: -0.36,
    color: constants.COLORS.TEXT_WHITE
  },
  dropdownBtnEmoji: {
    fontSize: constants.SIZE.TEXT_LG3,
    marginRight: 4
  },
  dropdownBtnCode: {
    fontFamily: constants.FONTS.Space_Grotesk,
    fontSize: constants.SIZE.TEXT_LG2,
    fontStyle: 'normal',
    fontWeight: '400',
    lineHeight: constants.LINE_HEIGHT.MD, /* 133.333% */
    letterSpacing: -0.36,
    color: constants.COLORS.TEXT_WHITE
  },
  dropDownLabelStyle: {
    ...constants.G_STYLE.TEXT_SM_DESCRIPTION,
    alignSelf: 'flex-start',
    marginBottom: 8,
    opacity: 1
  }
});
