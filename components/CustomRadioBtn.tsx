import * as React from 'react';
import { Text, View, TextInputProps, TextInput, StyleSheet } from 'react-native';
import constants from '../constants';
import { SvgXml } from 'react-native-svg';
import { RadioButton } from 'react-native-paper';

type CustomRadioBtnProps = {
    type: 'email' | 'wallet',
    value?: string,
    checked: "checked" | "unchecked" | undefined,
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
        <View style={{ marginBottom: props.errMsg ? 0 : 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <RadioButton
                    color={constants.COLORS.BACKGROUND_BUTTON_PRIMARY}
                    value="contactInfo"
                    status={props.checked}
                    onPress={() => setChecked()}
                />
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

