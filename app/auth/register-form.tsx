import * as React from 'react';
import { Text, View, StyleSheet, StatusBar, SafeAreaView, ScrollView } from 'react-native';
import constants from '../../constants';
import { Button } from 'react-native-paper';
import { Link, useRouter } from 'expo-router';
import { SvgXml } from 'react-native-svg';
import CustomInput, { CustomInputRefs } from '../../components/CustomInput';
import SelectDropdown from 'react-native-select-dropdown';
import { getCurrencyList } from '../../services/currency';
import { useAuthActions } from '../../_recoil/auth/auth.actions';
import { log } from '../../_util/debug';
import Toast from 'react-native-toast-message';
import i18n from '../../translations';

export default function RegisterForm() {
    const [hasError, setHasError] = React.useState<boolean>(false);
    const [username, setUsername] = React.useState<string>('');
    const [email, setEmail] = React.useState<string>('');
    const [password, setPassword] = React.useState<string>('');
    const [usernameErr, setUsernameErr] = React.useState<string>('');
    const [emailErr, setEmailErr] = React.useState<string>('');
    const [passwordErr, setPasswordErr] = React.useState<string>('');
    const [alert, setAlert] = React.useState(null);
    const [localCurrencyIdx, setLocalCurrencyIdx] = React.useState<number>(0);
    const [currencyList, setCurrencyList] = React.useState<any[]>([]);
    const navigation = useRouter();
    const authActions = useAuthActions();

    const usernameRef = React.useRef<CustomInputRefs>(null);
    const emailRef = React.useRef(null);
    const passwordRef = React.useRef(null);

    React.useEffect(() => {
        getCurrencyList()
            .then(res => {
                setCurrencyList(res.data.data.currencies);
            })
            .catch(err => {
                log(err)
            })
    }, [])

    const handleSubmit = async () => {
        if (username === '' || email === '' || password === '') {
            setUsernameErr(username === '' ? i18n.t('regiserFormScreen.uname.requiredError') : '');
            setEmailErr(email === '' ? i18n.t('regiserFormScreen.email.requiredError') : '');
            setPasswordErr(password === '' ? i18n.t('regiserFormScreen.pwd.requiredError') : '');
        } else {
            try {
                const res = await authActions.register(username, email, password, currencyList[localCurrencyIdx]);

                if (res.authToken) {
                    setUsername('');
                    setUsernameErr('');
                    setEmail('');
                    setEmailErr('');
                    setPassword('');
                    setPasswordErr('');
                    setLocalCurrencyIdx(0);

                    navigation.push({ pathname: "/auth/login-signup", params: { status: "login" } });
                } else {
                    const { email, password, username } = res.errors;
                    setUsernameErr(username);
                    setEmailErr(email);
                    setPasswordErr(password);
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
                    <Link href={{ pathname: "/auth/phone-verify-code-input" }} style={{ marginLeft: '3%', verticalAlign: 'middle' }}>
                        <SvgXml
                            xml={constants.SVGS.back}
                            width={24}
                            height={24}
                        />
                    </Link>
                    <Text style={constants.G_STYLE.LOGO_TEXT}>
                        {i18n.t('regiserFormScreen.headerTxt')}
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
                        <CustomInput ref={usernameRef} textValue={username} onChangeText={setUsername} label={i18n.t('regiserFormScreen.uname.label')} errorMsg={usernameErr} />
                    </View>
                    <View style={{ width: '90%', marginLeft: '5%' }}>
                        <CustomInput ref={emailRef} textValue={email} onChangeText={setEmail} type='email-address' label={i18n.t('regiserFormScreen.email.label')} errorMsg={emailErr} />
                    </View>
                    <View style={{ width: '90%', marginLeft: '5%' }}>
                        <CustomInput ref={passwordRef} textValue={password} onChangeText={setPassword} type='password' label={i18n.t('regiserFormScreen.pwd.label')} errorMsg={passwordErr} />
                    </View>
                    <View style={{ width: '90%', marginLeft: '5%' }}>
                        <Text style={styles.dropDownLabelStyle}>{i18n.t('regiserFormScreen.currency.label')}</Text>
                        <SelectDropdown
                            dropdownOverlayColor={'false'}
                            data={currencyList}
                            defaultValueByIndex={0}
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

                <View style={styles.btnGroup}>
                    <Button disabled={hasError} onPress={handleSubmit} style={[constants.G_STYLE.BTN_PRIMARY, hasError && constants.G_STYLE.BTN_DISABLED]}>
                        <Text style={{ color: (hasError) ? constants.COLORS.TEXT_DISABLED : constants.COLORS.TEXT_BLACK, fontFamily: constants.FONTS.Syne_Regular, fontWeight: '700' }}>{i18n.t('global.signupBtn')}</Text>
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
