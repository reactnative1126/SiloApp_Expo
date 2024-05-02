import * as React from 'react';
import { Text, View, StyleSheet, StatusBar, SafeAreaView } from 'react-native';
import constants from '../../constants';
import { authAtom } from '../../_recoil/auth/auth.state';
import { useRecoilValue } from "recoil";
import { Button } from 'react-native-paper';
import { useAuthActions } from "../../_recoil/auth/auth.actions";
import { log } from "../../_util/debug";
import { Link, useRouter } from 'expo-router';
import { SvgXml } from 'react-native-svg'
import {
    CodeField,
    Cursor,
    useBlurOnFulfill,
    useClearByFocusCell,
} from 'react-native-confirmation-code-field';
import i18n from '../../translations';

const CELL_COUNT = 6;

export default function Login() {
    const [erorMsg, setErorMsg] = React.useState<string>('');
    const [value, setValue] = React.useState<string>('');
    const ref = useBlurOnFulfill({ value, cellCount: CELL_COUNT });
    const [props, getCellOnLayoutHandler] = useClearByFocusCell({
        value,
        setValue,
    });

    const authState = useRecoilValue(authAtom);
    const authActions = useAuthActions();
    const navigation = useRouter();
    const requestId = authState.phoneVerfication?.requestId;

    const handleSubmit = async () => {
        try {
            const data = await authActions.verifyPhone(requestId, value);
            
            if (data) {
                navigation.push('/auth/register-form');
            }
        } catch (error: any) {
            log(error);
            setErorMsg(error.message);
        }
    };

    return (
        <View style={constants.G_STYLE.ROOT_VIEW}>
            <StatusBar backgroundColor="transparent" barStyle="light-content" />
            <View style={styles.content}>
                <View style={{ top: '15%', flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Link href={{ pathname: "/auth/login-signup", params: { status: 'signup' } }} style={{ marginLeft: '3%' }}>
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

                <SafeAreaView style={styles.root}>
                    <View style={{ alignSelf: 'center', marginBottom: 20 }}>
                        <Text style={{...constants.G_STYLE.LOGO_TEXT, paddingLeft: '10%', paddingRight: '10%'}}>{i18n.t('phoneCodeInputScreen.headerTxt')}</Text>
                        <Text style={constants.G_STYLE.LOGO_TEXT}>(+38)095 432 65 12</Text>
                    </View>
                    <View style={{ width: '90%', marginLeft: '5%' }}>
                        <CodeField
                            ref={ref}
                            {...props}
                            // Use `caretHidden={false}` when users can't paste a text value, because context menu doesn't appear

                            value={value}
                            onChangeText={setValue}
                            cellCount={CELL_COUNT}
                            rootStyle={styles.codeFieldRoot}
                            keyboardType="number-pad"
                            textContentType="oneTimeCode"
                            renderCell={({ index, symbol, isFocused = true }) => (
                                <Text
                                    key={index}
                                    style={[styles.cell, isFocused && styles.focusCell, value.length === CELL_COUNT && (erorMsg ? styles.errorCell : styles.successCell)]}
                                    onLayout={getCellOnLayoutHandler(index)}>
                                    {symbol || (isFocused ? <Cursor /> : null)}
                                </Text>
                            )}
                        />
                        {erorMsg && <Text style={styles.dangerText}>{erorMsg}</Text>}
                        {!erorMsg && value.length !== CELL_COUNT && <Text style={{ ...constants.G_STYLE.TEXT_SM_DESCRIPTION, opacity: 1, alignSelf: 'flex-end', fontSize: constants.SIZE.TEXT_MD2 }}>{i18n.t('phoneCodeInputScreen.inputDesc')}</Text>}
                    </View>
                </SafeAreaView>

                <View style={styles.btnGroup}>
                    <Button disabled={erorMsg.length !== 0 || value.length !== CELL_COUNT} onPress={handleSubmit} style={[constants.G_STYLE.BTN_PRIMARY, (erorMsg.length !== 0 || value.length !== CELL_COUNT) && constants.G_STYLE.BTN_DISABLED]}>
                        <Text style={{ color: (erorMsg.length !== 0 && value.length !== CELL_COUNT) ? constants.COLORS.TEXT_DISABLED : constants.COLORS.TEXT_BLACK, fontFamily: constants.FONTS.Syne_Regular, fontWeight: '700' }}>{i18n.t('global.signupBtn')}</Text>
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
        alignSelf: 'flex-end'
    },
    root: { color: constants.COLORS.TEXT_WHITE, top: '13%' },
    title: { textAlign: 'center', fontSize: constants.SIZE.TEXT_LG },
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
        verticalAlign: 'middle',
        alignContent: 'center',
        alignItems: 'center'
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
