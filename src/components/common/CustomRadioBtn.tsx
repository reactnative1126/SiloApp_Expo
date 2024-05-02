import React from 'react';
import { Text, View, TextInputProps, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { SvgXml } from 'react-native-svg';

import constants from '../../utils/constants';

type CustomRadioBtnProps = {
  type: 'email' | 'wallet',
  value?: string,
  checked: 'checked' | 'unchecked' | undefined,
  label?: string,
  inputProps?: TextInputProps,
  errMsg?: string,
  onCheck: () => void,
  inputValue?: string,
  onInputTextChange?: (val: string) => void
}

const icons = {
  'email': constants.SVGS.user_tx_bright,
  'wallet': constants.SVGS.sol_tx
}

const CustomRadioBtn = (props: CustomRadioBtnProps) => {
  const setChecked = () => {
    props.onCheck();
  }

  return (
    <View style={{ marginBottom: 16 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {props.checked === 'checked' ? (
          <TouchableOpacity onPress={() => setChecked()}>
            <SvgXml
              xml={constants.SVGS.filter_active}
              width={24}
              height={24}
            />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={() => setChecked()}>
            <SvgXml
              xml={constants.SVGS.filter_inactive}
              width={24}
              height={24}
            /></TouchableOpacity>

        )}
        <Text style={styles.label}>{props.label}</Text>
      </View>
      {props.checked === 'checked' &&
        <View style={{ marginLeft: 30 }}>
          <View style={[styles.inputContainer, { borderColor: props.errMsg ? constants.COLORS.TEXT_DANGER : constants.COLORS.BORDER_BRIGHT_DARK }]}>
            <SvgXml xml={icons[props.type]} width={24} height={24} style={{ marginRight: 8 }} />
            <TextInput onChangeText={props.onInputTextChange} style={styles.inputStyle} value={props.inputValue} />
          </View>
          {
            props.checked === 'checked' && props.errMsg &&
            <View style={{ alignSelf: 'flex-end', marginTop: 8 }}>
              <Text style={{ color: constants.COLORS.TEXT_DANGER }}>{props.errMsg}</Text>
            </View>
          }
        </View>
      }
    </View>
  )
}

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: constants.COLORS.BORDER_BRIGHT_DARK,
    borderRadius: 8,
    backgroundColor: constants.COLORS.BACKGROUND_LIGHT_DARK,
    paddingVertical: 8,
    paddingHorizontal: 16
  },
  inputStyle: {
    color: constants.COLORS.TEXT_WHITE,
    fontFamily: constants.FONTS.Space_Grotesk,
    fontSize: constants.SIZE.TEXT_LG,
    fontStyle: 'normal',
    fontWeight: '400',
    lineHeight: constants.LINE_HEIGHT.MD,
    letterSpacing: -0.36,
    width: '90%'
  },
  label: {
    marginLeft: constants.SPACING.SM,
    color: constants.COLORS.TEXT_WHITE,
    fontFamily: constants.FONTS.Space_Grotesk,
    fontSize: 16,
    fontStyle: 'normal',
    fontWeight: '500',
    lineHeight: 24, /* 150% */
    letterSpacing: -0.32
  }
});

export default CustomRadioBtn;

