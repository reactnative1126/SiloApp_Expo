import React, { useState, useEffect } from 'react';
import { useRecoilValue } from 'recoil';
import { Text, View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { CodeField, Cursor, useBlurOnFulfill, useClearByFocusCell } from 'react-native-confirmation-code-field';
import { Button } from 'react-native-paper';
import Toast from 'react-native-toast-message';

import Container from '../../components/common/Container';
import Header from '../../components/common/Header';

import constants from '../../utils/constants';
import { log } from '../../utils/functions';
import i18n from '../../utils/tanslations';
import useKeyboardHeight from '../../utils/keyboard';

import { useAuthActions } from '../../_recoil/auth/auth.actions';
import { authAtom } from '../../_recoil/auth/auth.state';

const CELL_COUNT = 6;

export default function PhoneVerification(props: any) {
  const authActions = useAuthActions();
  const authState = useRecoilValue(authAtom);
  const keyboardHeight = useKeyboardHeight();

  const [value, setValue] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const ref = useBlurOnFulfill({ value, cellCount: CELL_COUNT });
  const [prop, getCellOnLayoutHandler] = useClearByFocusCell({ value, setValue });

  const requestId = authState.phoneVerfication?.requestId;

  useEffect(() => {
    if (value.length === CELL_COUNT) {
      // Code is fully entered, call your submit function here
      handleSubmit();
    }
  }, [value])

  const handleSubmit = async () => {
    try {
      const res = await authActions.verifyPhone(requestId, value, 'There was a problem verifying your phone number.');

      if (res.success) {
        setValue('');
        setErrorMsg('');
        props.navigation.push('Register');
      } else {
        Toast.show({ type: 'error', text1: 'Phone Verification Problem', text2: res.message });
      }
    } catch (error: any) {
      log(error);
    }
  };

  return (
    <Container>
      <View style={styles.content}>
        <Header
          back
          close
          onBack={() => props.navigation.pop()}
          onClose={() => props.navigation.popToTop()}
        />
        <ScrollView
          style={[styles.content, { paddingVertical: constants.SPACING.SM }]}
          showsVerticalScrollIndicator={false}
        >
          <Text style={constants.G_STYLE.LOGO_TEXT}>
            {i18n.t('phoneCodeInputScreen.headerTxt')}
          </Text>
          <Text style={constants.G_STYLE.LOGO_TEXT}>
            (+38)095 432 65 12
          </Text>

          <View style={{ marginTop: constants.SPACING.LG, paddingHorizontal: constants.SPACING.MD, width: wp('100%') }}>
            <CodeField
              ref={ref}
              {...prop}
              autoFocus
              // Use `caretHidden={false}` when users can't paste a text value, because context menu doesn't appear
              value={value}
              onChangeText={(code) => {
                setValue(code);
                setErrorMsg('');
              }}
              cellCount={CELL_COUNT}
              rootStyle={styles.codeFieldRoot}
              keyboardType='number-pad'
              textContentType='oneTimeCode'
              renderCell={({ index, symbol, isFocused = true }) => (
                <Text
                  key={index}
                  style={[styles.cell, isFocused && styles.focusCell, value.length === CELL_COUNT && (errorMsg ? styles.errorCell : styles.successCell)]}
                  onLayout={getCellOnLayoutHandler(index)}>
                  {symbol || (isFocused ? <Cursor /> : null)}
                </Text>
              )}
            />
            {errorMsg && <Text style={styles.dangerText}>{errorMsg}</Text>}
            {!errorMsg && value.length !== CELL_COUNT && <Text style={{ ...constants.G_STYLE.TEXT_SM_DESCRIPTION, opacity: 1, alignSelf: 'flex-end', fontSize: constants.SIZE.TEXT_MD2 }}>{i18n.t('phoneCodeInputScreen.inputDesc')}</Text>}
          </View>
        </ScrollView>

        <View style={[styles.btnGroup, { bottom: keyboardHeight === 0 ? 0 : keyboardHeight - 35 }]}>
          <Button disabled={errorMsg.length !== 0 || value.length !== CELL_COUNT} onPress={handleSubmit} style={[constants.G_STYLE.BTN_PRIMARY, (errorMsg.length !== 0 || value.length !== CELL_COUNT) && constants.G_STYLE.BTN_DISABLED]}>
            <Text style={{ color: (errorMsg.length !== 0 && value.length !== CELL_COUNT) ? constants.COLORS.TEXT_DISABLED : constants.COLORS.TEXT_BLACK, fontFamily: constants.FONTS.Syne_Regular, fontWeight: '700' }}>{i18n.t('global.signupBtn')}</Text>
          </Button>
          <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
            <Text style={constants.G_STYLE.BTN_DESCRIPTION}>
              {i18n.t('global.alreadyHaveAccountBtn')}
            </Text><TouchableOpacity
              onPress={() => props.navigation.replace('SignIn')}
              activeOpacity={0.8}
            >
              <Text style={{ ...constants.G_STYLE.BTN_DESCRIPTION, color: constants.COLORS.TEXT_PRIMARY, marginLeft: constants.SPACING.SM }} >{i18n.t('global.loginBtn')}</Text>
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
  dangerText: {
    color: constants.COLORS.TEXT_DANGER,
    fontFamily: constants.FONTS.Space_Grotesk,
    fontSize: constants.SIZE.TEXT_MD2,
    fontStyle: 'normal',
    fontWeight: '400',
    lineHeight: constants.LINE_HEIGHT.MD,
    alignSelf: 'flex-end'
  },
  codeFieldRoot: {
    marginTop: 20,
    marginBottom: 10
  },
  cell: {
    paddingTop: ((wp('100%') / 8) - 24) / 2,
    width: wp('100%') / 8,
    height: wp('100%') / 8,
    borderWidth: constants.SIZE.BORDER_WIDTH_SM,
    borderColor: constants.COLORS.BORDER_BRIGHT_DARK,
    borderRadius: constants.SIZE.BORDER_RADIUS_MD,
    backgroundColor: constants.COLORS.BACKGROUND_LIGHT_DARK,
    textAlign: 'center',
    color: constants.COLORS.TEXT_WHITE,
    fontFamily: constants.FONTS.Space_Grotesk,
    fontSize: constants.SIZE.TEXT_LG2,
    fontStyle: 'normal',
    fontWeight: '400',
  },
  focusCell: {
    borderColor: constants.COLORS.BORDER_BUTTON_WHITE,
  },
  errorCell: {
    borderColor: constants.COLORS.BORDER_DANGER
  },
  successCell: {
    borderColor: constants.COLORS.BACKGROUND_PRIMARY
  }
});
