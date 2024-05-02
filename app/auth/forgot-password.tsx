import * as React from 'react';
import { Text, View, StyleSheet, StatusBar, SafeAreaView, ScrollView } from 'react-native';
import constants from '../../constants';
import { Button } from 'react-native-paper';
import { Link, useRouter } from 'expo-router';
import { SvgXml } from 'react-native-svg';
import CustomInput, { CustomInputRefs } from '../../components/CustomInput';
import { useAuthActions } from '../../_recoil/auth/auth.actions';
import { log } from '../../_util/debug';
import Toast from 'react-native-toast-message';
import i18n from '../../translations';

export default function RegisterForm() {
    const [hasError, setHasError] = React.useState<boolean>(false);
    const [password, setPassword] = React.useState<string>('');
    const [confirmPassword, setConfirmPassword] = React.useState<string>('');
    const [passwordErr, setPasswordErr] = React.useState<string>('');
    const [confirmPasswordErr, setConfirmPasswordErr] = React.useState<string>('');

    const navigation = useRouter();
    const authActions = useAuthActions();

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
        <View style={constants.G_STYLE.ROOT_VIEW}>
            <StatusBar backgroundColor="transparent" barStyle="light-content" />
            <View style={styles.content}>
                <View style={{ top: '15%', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 }}>
                    <Link href={{ pathname: "/auth/phone-verify-code-input" }} style={{ marginLeft: '3%', verticalAlign: 'middle' }}>
                        <SvgXml
                            xml={constants.SVGS.back}
                            width={24}
                            height={24}
                        />
                    </Link>
                    <Text style={{ ...constants.G_STYLE.LOGO_TEXT, paddingRight: 0, paddingLeft: 0 }}>
                        {i18n.t('forgotPwdScreen.headerTxt')}
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
                <ScrollView style={styles.root}>
                    <View style={{ width: '90%', marginLeft: '5%' }}>
                        <CustomInput hasError={true} textValue={password} onChangeText={setPassword} type='password' label={i18n.t('forgotPwdScreen.pwdLabel')} errorMsg={passwordErr} />
                    </View>
                    <View style={{ width: '90%', marginLeft: '5%' }}>
                        <CustomInput hasError={true} textValue={confirmPassword} onChangeText={setConfirmPassword} type='password' label={i18n.t('forgotPwdScreen.pwdCLabel')} errorMsg={confirmPasswordErr} />
                    </View>
                </ScrollView>

                <View style={styles.btnGroup}>
                    <Button disabled={hasError} onPress={handleSubmit} style={[constants.G_STYLE.BTN_PRIMARY, hasError && constants.G_STYLE.BTN_DISABLED]}>
                        <Text style={{ color: (hasError) ? constants.COLORS.TEXT_DISABLED : constants.COLORS.TEXT_BLACK, fontFamily: constants.FONTS.Syne_Regular, fontWeight: '700' }}>{i18n.t('forgotPwdScreen.resetBtn')}</Text>
                    </Button>
                    <Text style={constants.G_STYLE.BTN_DESCRIPTION}>

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
    root: { color: constants.COLORS.TEXT_WHITE, top: '10%' },
    // 
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
        height: 210,
        marginTop: -18
    },
    dropdownRowStyle: { borderWidth: constants.SIZE.BORDER_WIDTH_SM, borderColor: constants.COLORS.BORDER_BRIGHT_DARK, backgroundColor: '#2D2B2B' },
    dropdownRowChildStyle: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingHorizontal: 16,
        backgroundColor: constants.COLORS.BACKGROUND_LIGHT_DARK,
        borderWidth: 0
    },
    dropdownRowTxt: {
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: constants.SIZE.TEXT_XL,
        marginHorizontal: 12,
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
