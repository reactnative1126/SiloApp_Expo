import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { Text, TextInput, StyleProp, ViewStyle, View, StyleSheet, SafeAreaView, Pressable } from 'react-native';
import constants from '../constants';
import { SvgXml } from 'react-native-svg';

type CustomInputProps = {
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
    isEditing?: boolean
}

export type CustomInputRefs = {
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
    isEditing?: boolean
}


// export default function CustomInput(props: CustomInputProps) {
const CustomInput: React.ForwardRefRenderFunction<CustomInputRefs, CustomInputProps> = ({ type = "default", label, textValue, style = styles, hasError = false, errorMsg = "", icon, descMsg, isEditing = true, ...otherProps }, ref) => {
    const [isFocused, setIsFocused] = React.useState<boolean>(false);

    // State variable to track password visibility 
    const [showPassword, setShowPassword] = useState(false);
    // Function to toggle the password visibility state 
    const toggleShowPassword = () => {
        setShowPassword(!showPassword);
    };

    useImperativeHandle(ref, () => ({
        textValue
    }));

    return (
        <SafeAreaView style={styles.mainContainer}>
            <Text style={[styles.textStyle, style.textStyle]}>
                {label}
            </Text>
            <View style={[isEditing ? styles.container : styles.disabledContainer, isEditing && errorMsg.length > 0 && styles.errorInputStyle]}>
                <TextInput
                    editable={isEditing}
                    value={(type === 'walletAddress' && !isEditing ? textValue?.slice(0, 30).concat('...') : textValue) || ''}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    secureTextEntry={type === 'password' && !showPassword}
                    onChangeText={otherProps.onChangeText}
                    placeholder=""
                    autoCorrect={false}
                    underlineColorAndroid="transparent"
                    selectionColor='white'
                    style={[styles.inputStyle]}
                />
                {type === 'password' && <Pressable onPress={toggleShowPassword}>
                    <SvgXml
                        xml={constants.SVGS.hideAndShow}
                        width={24}
                        height={24}
                        style={{ marginLeft: 10 }}
                    />
                </Pressable>}
                <SvgXml
                    xml={icon || null}
                    width={24}
                    height={24}
                    style={{ marginLeft: 10 }}
                />
            </View>
            {errorMsg.length > 0 && <Text style={{ ...constants.G_STYLE.INPUT_DANGER_TEXT, marginTop: 8 }}>{errorMsg}</Text>}
            {errorMsg.length === 0 && descMsg && <Text style={{ ...constants.G_STYLE.PRIMARY_SM_TEXT, marginTop: 8 }}>{descMsg}</Text>}
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
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
    focusedInputStyle: {
        borderColor: constants.COLORS.TEXT_MUTED
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
    mainContainer: {
        marginBottom: 23
    },
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: constants.COLORS.BACKGROUND_LIGHT_DARK,
        borderRadius: constants.SIZE.BORDER_RADIUS_MD,
        paddingHorizontal: 16,
        borderWidth: constants.SIZE.BORDER_WIDTH_SM,
        borderColor: constants.COLORS.BORDER_BRIGHT_DARK
    }
});

export default forwardRef(CustomInput)
