import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { Text, TextInput, StyleProp, ViewStyle, View, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { SvgXml } from 'react-native-svg';
import Toast from 'react-native-toast-message';
import * as Clipboard from 'expo-clipboard';

import constants from '../../utils/constants';

type ClipboardInputProps = {
  type?: string,
  label?: string,
  icon?: string,
  textValue?: string,
  errorMsg?: string,
  descMsg?: string,
  hasError?: boolean,
  onChangeText?: (val: string) => void,
  style?: {
    inputStyle?: StyleProp<ViewStyle>,
    textStyle?: StyleProp<ViewStyle>
  },
  isEditing?: boolean,
}

export type ClipboardInputRefs = {
  type?: string,
  label?: string,
  icon?: string,
  textValue?: string,
  errorMsg?: string,
  descMsg?: string,
  hasError?: boolean,
  onChangeText?: (val: string) => void,
  style?: {
    inputStyle?: StyleProp<ViewStyle>,
    textStyle?: StyleProp<ViewStyle>
  },
  isEditing?: boolean,
  disabled?: boolean,
}

const ClipboardInput: React.ForwardRefRenderFunction<ClipboardInputRefs, ClipboardInputProps> = ({ type = 'default', label, textValue, style = styles, hasError = false, errorMsg = '', icon, descMsg, isEditing = true, ...otherProps }, ref) => {
  const [isFocused, setIsFocused] = useState<boolean>(false);

  useImperativeHandle(ref, () => ({
    textValue
  }));

  const copyToClipboard = async () => {
    await Clipboard.setStringAsync(textValue || '');
    Toast.show({ type: 'success', text1: 'Copied to clipboard' });
    getClipboardContent();
  };

  const getClipboardContent = async () => {
    const text = await Clipboard.getStringAsync();
  };


  return (
    <SafeAreaView style={styles.container}>
      <Text style={[styles.textStyle, style.textStyle]}>
        {label}
      </Text>
      <View style={[isEditing ? styles.content : styles.disabledContainer, isEditing && errorMsg.length > 0 && styles.errorInputStyle]}>
        <TextInput
          editable={isEditing}
          value={(type === 'walletAddress' && !isEditing ? textValue?.slice(0, 30).concat('...') : textValue) || ''}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onChangeText={otherProps.onChangeText}
          placeholder=''
          autoCorrect={false}
          underlineColorAndroid='transparent'
          selectionColor='white'
          style={[styles.inputStyle]}
          autoCapitalize='none'
        />
        <TouchableOpacity activeOpacity={0.8} onPress={copyToClipboard}>
          <SvgXml
            xml={constants.SVGS.copy_to_clipboard}
            width={24}
            height={24}
            style={{ marginLeft: 10 }}
          />
        </TouchableOpacity>
      </View>
      {errorMsg.length > 0 && <Text style={{ ...constants.G_STYLE.INPUT_DANGER_TEXT, marginTop: 8 }}>{errorMsg}</Text>}
      {errorMsg.length === 0 && descMsg && <Text style={{ ...constants.G_STYLE.PRIMARY_SM_TEXT, marginTop: 8 }}>{descMsg}</Text>}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 23
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: constants.COLORS.BACKGROUND_LIGHT_DARK,
    borderRadius: constants.SIZE.BORDER_RADIUS_MD,
    paddingHorizontal: 16,
    borderWidth: constants.SIZE.BORDER_WIDTH_SM,
    borderColor: constants.COLORS.BORDER_BRIGHT_DARK
  },
  inputStyle: {
    fontFamily: constants.FONTS.Space_Grotesk,
    width: '100%',
    fontSize: constants.SIZE.TEXT_LG2,
    color: constants.COLORS.TEXT_WHITE,
    paddingTop: 8,
    paddingBottom: 8,
    fontWeight: '400',
    fontStyle: 'normal',
    lineHeight: constants.LINE_HEIGHT.MD,
    letterSpacing: -0.36,
    flex: 1,
  },
  disabledContainer: {
    backgroundColor: constants.COLORS.BACKGROUND_BLACK,
    borderWidth: 0,
    borderBottomWidth: constants.SIZE.BORDER_WIDTH_SM,
    borderColor: constants.COLORS.BORDER_BRIGHT_DARK,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center'
  },
  errorInputStyle: {
    borderColor: constants.COLORS.BORDER_DANGER
  },
  textStyle: {
    ...constants.G_STYLE.TEXT_SM_DESCRIPTION,
    alignSelf: 'flex-start',
    marginBottom: 8,
    opacity: 1
  },
});

export default forwardRef(ClipboardInput)
