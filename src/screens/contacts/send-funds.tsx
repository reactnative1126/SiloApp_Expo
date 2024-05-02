import React, { useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import useAsyncEffect from 'use-async-effect';
import { Text, View, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { CodeField, Cursor, useBlurOnFulfill, useClearByFocusCell } from 'react-native-confirmation-code-field';
import { useLocalSearchParams } from 'expo-router';
import Toast from 'react-native-toast-message';
import { Button } from 'react-native-paper';

import Container from '../../components/common/Container';
import Header from '../../components/contacts/Header';
import Avatar from '../../components/common/Avatar';

import constants from '../../utils/constants';
import { log, formattedCurrency } from '../../utils/functions';
import useKeyboardHeight from '../../utils/keyboard';

import { useAuthActions } from '../../_recoil/auth/auth.actions';
import { userAtom } from '../../_recoil/user/user.state';
import { useTransfersActions } from '../../_recoil/transfers/transfers.actions';
import { PayTargetType } from '../../_recoil/transfers/transfers.types';

const CELL_COUNT = 6;

export default function SendFunds(props: any) {
    const authActions = useAuthActions();
    const transfersActions = useTransfersActions();
    const userState = useRecoilValue(userAtom);
    const keyboardHeight = useKeyboardHeight();

    const params = useLocalSearchParams();
    const { userInfo } = params as any;

    const [page, setPage] = useState<number>(1);
    const [value, setValue] = useState<string>('');
    const [verified, setVerified] = useState<boolean>(false);
    const [errorMsg, setErrorMsg] = useState<string>('');
    const ref = useBlurOnFulfill({ value, cellCount: CELL_COUNT });
    const [prop, getCellOnLayoutHandler] = useClearByFocusCell({ value, setValue });

    const [hasError, setHasError] = useState<boolean>(true);
    const [targetType, setTargetType] = useState<string>(PayTargetType.USER);
    const [targetId, setTargetId] = useState<number>(0);
    const [targetName, setTargetName] = useState<string>('');
    const [targetImage, setTargetImage] = useState<string>('');
    const [targetAddress, setTargetAddress] = useState<string>('');
    const [primaryAmount, setPrimaryAmount] = useState<string>('');
    const [localAmount, setLocalAmount] = useState<string>('');
    const [toggle, setToggle] = useState<boolean>(true);

    useAsyncEffect(async () => {
        try {
            const res = await transfersActions.getPayTarget(userInfo.targetType, userInfo.targetType === PayTargetType.CONTACT ? userInfo.contactID : userInfo.targetId, 'There was a problem getting info.');
            if (res.success) {
                const { payTarget } = res.data;
                setTargetId(payTarget.targetId)
                setTargetType(payTarget.targetType);
                setTargetName(payTarget.name);
                setTargetImage(payTarget.profileImage);
                setTargetAddress(payTarget.addressValue);
            } else {
                Toast.show({ type: 'error', text1: 'Get Pay Target Error', text2: res.message });
            }
        } catch (error: any) {
            log(error);
        }
    }, []);

    useAsyncEffect(async () => {
        if (verified) {
            try {
                const res = await transfersActions.sendPayment(
                    targetType,
                    targetType === PayTargetType.REBELTAG ? targetAddress : targetId,
                    parseFloat(toggle ? primaryAmount.replace(/[^0-9.]/g, '') : localAmount.replace(/[^0-9.]/g, '')),
                    toggle ? userState.earning.primaryCurrencyCode : userState.currency.code,
                    'There was a problem pay.'
                );
                if (res.success) {
                    setTargetId(0)
                    setTargetType('');
                    setTargetName('');
                    setTargetImage('');
                    setTargetAddress('');
                    setPage(1);
                    setVerified(false);
                    Toast.show({ type: 'success', text1: 'Your transfer is being processed' });
                    props.navigation.popToTop();
                } else {
                    Toast.show({ type: 'error', text1: 'Pay Error', text2: res.message });
                }
            } catch (error: any) {
                log(error);
            }
        }
    }, [verified]);

    useEffect(() => {
        let cleaned = toggle ? primaryAmount.replace(/[^0-9.]/g, '') : localAmount.replace(/[^0-9.]/g, '');
        if (toggle && (Number(cleaned) > Number(userState.balances.USDC.balance))) {
            setHasError(true);
        } else if (!toggle && (Number(cleaned) > Number((userState.balances.USDC.balance || 0) * (userState.currency.usdExchangeRate || 1)))) {
            setHasError(true);
        } else if (cleaned === '' || cleaned === '0') {
            setHasError(true);
        }
        else {
            setHasError(false);
        }
    }, [primaryAmount, localAmount]);

    const handleAmount = async (text: string) => {
        // Limiting the decimal places to 2 (if needed)
        let parts = text.split('.');
        if (parts.length < 3) {
            if (parts[1] === '') {
                text = parts[0] + '.';
                toggle ? setPrimaryAmount(text) : setLocalAmount(text);
            } else {
                if (parts[1] && parts[1].length > 2) {
                    text = parts[0] + '.' + parts[1].slice(0, 2);
                }
                // Remove all non-numeric characters except for the dot
                if (toggle) {
                    let cleaned = text.replace(/[^0-9.]/g, '');
                    let amount = (Number(cleaned) * (userState.currency.usdExchangeRate || 1)).toFixed(2)
                    cleaned = formattedCurrency(cleaned, userState.currency.code, 'amount').toString();
                    setPrimaryAmount(cleaned);
                    setLocalAmount(amount);
                } else {
                    let cleaned = text.replace(/[^0-9.]/g, '');
                    let amount = (Number(cleaned) / (userState.currency.usdExchangeRate || 1)).toFixed(2)
                    cleaned = formattedCurrency(cleaned, userState.currency.code, 'amount').toString();
                    setPrimaryAmount(amount);
                    setLocalAmount(cleaned);
                }
            }
        }
    }

    const handleSubmit = async () => {
        if (page === 1) {
            setPage(2);
        } else if (page === 2) {
            try {
                const res = await authActions.verifyPIN(value, 'There was a problem verifying your PIN.');

                if (res.success) {
                    setValue('');
                    setErrorMsg('');
                    setVerified(true);
                } else {
                    setErrorMsg(res.message as string);
                }
            } catch (error: any) {
                log(error);
            }
        }
    }

    if (page === 1) {
        return (
            <Container>
                <Header
                    back
                    title='Send funds'
                    onBack={() => { props.navigation.pop() }}
                />
                <ScrollView
                    style={[styles.content, { padding: constants.SPACING.MD }]}
                    contentContainerStyle={{ alignItems: 'center', paddingVertical: 50 }}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.userInfo}>
                        <Avatar
                            name={targetName}
                            image={targetImage}
                            width={48}
                            height={48}
                            radius={24}
                            size={20}
                        />
                        <View style={{ marginLeft: constants.SPACING.SM }}>
                            <Text style={styles.userName}>{targetName}</Text>
                            <Text style={styles.userWallet}>{targetAddress}</Text>
                        </View>
                    </View>
                    <View style={styles.toggleWrapper}>
                        <TouchableOpacity style={styles.currencyWrapper} onPress={() => setToggle((prevToggle) => !prevToggle)}>
                            {!toggle && <Text style={styles.currencyText}>{`${userState.currency.code} `}</Text>}
                            <View style={styles.currencyDot} />
                            {toggle && <Text style={styles.currencyText}>{` ${userState.earning.primaryCurrencyCode}`}</Text>}
                        </TouchableOpacity>
                    </View>
                    <View style={styles.amount}>
                        <Text style={styles.currency}>$</Text>
                        <TextInput
                            editable={true}
                            value={toggle ? primaryAmount : localAmount}
                            onChangeText={handleAmount}
                            placeholder='0'
                            autoCorrect={false}
                            underlineColorAndroid='transparent'
                            selectionColor='white'
                            style={styles.inputStyle}
                            keyboardType='numeric'
                            autoFocus
                        />
                    </View>
                    <Text style={styles.localAmount}> {formattedCurrency(!toggle ? primaryAmount : localAmount, toggle ? userState.earning.primaryCurrencyCode : userState.currency.code)}{` ${toggle ? userState.currency.code : userState.earning.primaryCurrencyCode}`}</Text>
                    <View style={styles.balance}>
                        <View style={{ flexDirection: 'row' }}>
                            <Text style={styles.balanceTitle}>Balance:</Text>
                            <Text style={styles.primaryValue}>{formattedCurrency(userState.balances.USDC.balance, userState.earning.primaryCurrencyCode)}
                                <Text style={styles.primaryCurrency}>{` ${userState.earning.primaryCurrencyCode}`}</Text>
                            </Text>
                        </View>
                        {userState.currency.code !== userState.earning.primaryCurrencyCode && (
                            <View style={{ flexDirection: 'row' }}>
                                <Text style={styles.balanceTitle}></Text>
                                <Text style={styles.localValue}>{formattedCurrency((userState.balances.USDC.balance || 0) * (userState.currency.usdExchangeRate || 1), userState.currency.code)}
                                    <Text style={styles.localCurrency}>{` ${userState.currency.code}`}</Text>
                                </Text>
                            </View>
                        )}
                    </View>
                </ScrollView>

                <View style={[styles.createBtnView, { bottom: keyboardHeight === 0 ? 20 : keyboardHeight }]}>
                    <Button style={hasError ? styles.createBtnInactive : styles.createBtnActive} disabled={hasError} onPress={handleSubmit}>
                        <Text style={hasError ? styles.createBtnTextInactive : styles.createBtnTextActive}>
                            Send
                        </Text>
                    </Button>
                </View>
            </Container>
        );
    } else {
        return (
            <Container>
                <View style={styles.content}>
                    <Header
                        back
                        title=' '
                        onBack={() => setPage(1)}
                    />
                    <ScrollView
                        style={[styles.content, { paddingVertical: constants.SPACING.SM }]}
                        showsVerticalScrollIndicator={false}
                    >
                        <Text style={constants.G_STYLE.LOGO_TEXT}>
                            {'Verify your PIN'}
                        </Text>

                        <View style={{ marginTop: constants.SPACING.LG, paddingHorizontal: constants.SPACING.MD, width: wp('100%') }}>
                            <CodeField
                                ref={ref}
                                {...prop}
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
                        </View>
                    </ScrollView>

                    <View style={[styles.btnGroup, { bottom: keyboardHeight === 0 ? 0 : keyboardHeight - 35 }]}>
                        <Button disabled={errorMsg.length !== 0 || value.length !== CELL_COUNT} onPress={handleSubmit} style={[constants.G_STYLE.BTN_PRIMARY, (errorMsg.length !== 0 || value.length !== CELL_COUNT) && constants.G_STYLE.BTN_DISABLED]}>
                            <Text style={{ color: (errorMsg.length !== 0 && value.length !== CELL_COUNT) ? constants.COLORS.TEXT_DISABLED : constants.COLORS.TEXT_BLACK, fontFamily: constants.FONTS.Syne_Regular, fontWeight: '700' }}>{'Verify PIN'}</Text>
                        </Button>
                    </View>
                </View>
            </Container>
        )
    }
}

const styles = StyleSheet.create({
    content: {
        flex: 1,
    },
    createBtnView: {
        position: 'absolute',
        bottom: 20,
        width: '100%',
        padding: constants.SPACING.MD,
        backgroundColor: constants.COLORS.BACKGROUND_BLACK,
    },
    createBtnActive: {
        ...constants.G_STYLE.BTN_PRIMARY,
        marginHorizontal: 0
    },
    createBtnInactive: {
        ...constants.G_STYLE.BTN_DISABLED,
        marginHorizontal: 0
    },
    createBtnTextActive: {
        color: constants.COLORS.TEXT_BLACK,
        fontFamily: constants.FONTS.Syne_Regular,
        fontWeight: '700'
    },
    createBtnTextInactive: {
        color: constants.COLORS.TEXT_DISABLED,
        fontFamily: constants.FONTS.Syne_Regular,
        fontWeight: '700'
    },
    userInfo: {
        width: '60%',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        padding: constants.SPACING.MD,
        borderBottomWidth: 1,
        borderBottomColor: constants.COLORS.BORDER_BRIGHT_DARK
    },
    userName: {
        fontFamily: constants.FONTS.Space_Grotesk,
        fontSize: constants.SIZE.TEXT_LG2,
        fontWeight: '500',
        color: constants.COLORS.TEXT_WHITE
    },
    userWallet: {
        fontFamily: constants.FONTS.Space_Grotesk,
        fontSize: constants.SIZE.TEXT_MD2,
        fontWeight: '500',
        color: constants.COLORS.TEXT_WHITE
    },
    amount: {
        // width: '60%',
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingHorizontal: constants.SPACING.MD,
    },
    currency: {
        fontFamily: constants.FONTS.Space_Grotesk,
        fontSize: constants.SIZE.TEXT_XXL3,
        fontWeight: '600',
        color: constants.COLORS.TEXT_WHITE
    },
    toggleWrapper: {
        marginTop: constants.SPACING.MD,
        width: '60%',
        alignItems: 'flex-end'
    },
    currencyWrapper: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingLeft: 2,
        paddingRight: 2,
        height: 24,
        borderWidth: 1,
        borderColor: constants.COLORS.BORDER_PRIMARY,
        borderRadius: 11
    },
    currencyDot: {
        width: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: constants.COLORS.BACKGROUND_PRIMARY
    },
    currencyText: {
        fontFamily: constants.FONTS.Space_Grotesk,
        fontSize: constants.SIZE.TEXT_MD,
        fontWeight: '500',
        color: constants.COLORS.TEXT_WHITE
    },
    localAmount: {
        fontFamily: constants.FONTS.Space_Grotesk,
        fontSize: constants.SIZE.TEXT_LG2,
        fontWeight: '500',
        color: constants.COLORS.TEXT_WHITE,
        marginBottom: constants.SPACING.SM
    },
    balance: {
        width: '60%',
        justifyContent: 'center',
        padding: constants.SPACING.MD,
        borderTopWidth: 1,
        borderTopColor: constants.COLORS.BORDER_BRIGHT_DARK
    },
    balanceTitle: {
        width: 80,
        fontFamily: constants.FONTS.Space_Grotesk,
        fontSize: constants.SIZE.TEXT_LG,
        fontWeight: '400',
        color: constants.COLORS.TEXT_LOCAL_CURRENCY
    },
    primaryValue: {
        fontFamily: constants.FONTS.Space_Grotesk,
        fontSize: constants.SIZE.TEXT_LG,
        fontWeight: '500',
        color: constants.COLORS.TEXT_WHITE
    },
    primaryCurrency: {
        fontFamily: constants.FONTS.Space_Grotesk,
        fontSize: constants.SIZE.TEXT_LG,
        fontWeight: '500',
        color: constants.COLORS.TEXT_PRIMARY
    },
    localValue: {
        fontFamily: constants.FONTS.Space_Grotesk,
        fontSize: constants.SIZE.TEXT_MD,
        fontWeight: '500',
        color: constants.COLORS.TEXT_LOCAL_CURRENCY
    },
    localCurrency: {
        fontFamily: constants.FONTS.Space_Grotesk,
        fontSize: constants.SIZE.TEXT_MD,
        fontWeight: '500',
        color: constants.COLORS.TEXT_PRIMARY
    },
    inputStyle: {
        fontFamily: constants.FONTS.Space_Grotesk,
        fontSize: constants.SIZE.TEXT_XXL3,
        color: constants.COLORS.TEXT_WHITE,
        marginHorizontal: constants.SPACING.SM,
        padding: constants.SPACING.MD
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