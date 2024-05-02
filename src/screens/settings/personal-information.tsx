import React, { useState, useEffect } from 'react';
import { useRecoilValue } from 'recoil';
import useAsyncEffect from "use-async-effect";
import { Text, View, StyleSheet, ScrollView } from 'react-native';
import PhoneInput, { getCountryByPhoneNumber } from 'react-native-international-phone-number';
import SelectDropdown from 'react-native-select-dropdown';
import { SvgXml } from 'react-native-svg';

import Container from '../../components/common/Container';
import Header from '../../components/settings/Header';
import CustomInput from '../../components/common/CustomInput';
import ClipboardInput from '../../components/common/ClipboardInput';

import constants from '../../utils/constants';
import { log } from '../../utils/functions';
import i18n from '../../utils/tanslations';

import { getCurrencyList } from '../../services/currency';

import { userAtom } from '../../_recoil/user/user.state';

type countryType = {
    callingCode: string
}

export default function PersonalInfo(props: any) {
    const userState = useRecoilValue(userAtom);

    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [name, setName] = useState<string>('');
    const [username, setUsername] = useState<string>('');
    const [phoneNumVal, setPhoneNumVal] = useState<string>('');
    const [walletAddress, setWalletAddress] = useState<string>('');
    // const [pinCode, setPinCode] = useState<string>('');

    const [errorMsg, setErrorMsg] = useState<string>('');
    const [selectedCountry, setSelectedCountry] = useState<any>(null);
    const [currencyList, setCurrencyList] = useState<any[]>([userState.currency]);
    const [localCurrencyIdx, setLocalCurrencyIdx] = useState<number>(0);

    function handleInputValue(phoneNumber: any) {
        setPhoneNumVal(phoneNumber);
    }

    function handleSelectedCountry(country: any) {
        setSelectedCountry(country);
    }

    useAsyncEffect(async () => {
        try {
            const res = await getCurrencyList();
            setCurrencyList([userState.currency, ...res.data.data.currencies]);
        } catch (error: any) {
            log(error);
        }
    }, []);

    useEffect(() => {
        setName(userState.name);
        setUsername(userState.username);
        setWalletAddress(userState.walletAddress);
    }, [userState]);

    useEffect(() => {
        let country = getCountryByPhoneNumber(userState.phone) as countryType;
        setSelectedCountry(country);
        setPhoneNumVal(userState.phone.replace(country.callingCode, ''));
    }, [userState.phone])

    return (
        <Container>
            <View style={styles.content}>
                <Header
                    back
                    saving
                    title='Personal Info'
                    isEditing={isEditing}
                    onEdit={() => setIsEditing(!isEditing)}
                    onBack={() => props.navigation.pop()}
                />
                <ScrollView
                    style={[styles.content, { paddingHorizontal: constants.SPACING.MD }]}
                    contentContainerStyle={{ paddingBottom: 100 }}
                    showsVerticalScrollIndicator={false}
                >
                    <CustomInput label='Name' textValue={name} isEditing={isEditing} onChangeText={setName} />
                    <CustomInput label='Username' textValue={username} isEditing={isEditing} onChangeText={setUsername} />
                    <CustomInput label='Email address' textValue={userState.email} isEditing={false} />

                    {/* Phone number */}
                    <View style={{ marginBottom: 22 }}>
                        <Text style={styles.labelStyle}>
                            Phone Number
                        </Text>
                        <PhoneInput
                            editable={isEditing}
                            disabled={!isEditing}
                            focusable={true}
                            selectionColor='white'
                            phoneInputStyles={{
                                container: {
                                    backgroundColor: isEditing ? constants.COLORS.BACKGROUND_INPUT : constants.COLORS.BACKGROUND_BLACK,
                                    borderWidth: isEditing ? 1 : 0,
                                    borderBottomWidth: constants.SIZE.BORDER_WIDTH_SM,
                                    borderStyle: 'solid',
                                    borderRadius: constants.SIZE.BORDER_RADIUS_MD,
                                    borderColor: !errorMsg ? constants.COLORS.BORDER_BRIGHT_DARK : constants.COLORS.BORDER_DANGER,
                                    margin: 0
                                },
                                flagContainer: isEditing ? {
                                    borderTopLeftRadius: constants.SIZE.BORDER_RADIUS_MD,
                                    borderBottomLeftRadius: constants.SIZE.BORDER_RADIUS_MD,
                                    backgroundColor: constants.COLORS.BACKGROUND_FLAG_BOX,
                                    justifyContent: 'center',
                                    borderColor: constants.COLORS.BORDER_BRIGHT_DARK,
                                    borderRightWidth: constants.SIZE.BORDER_WIDTH_SM
                                } : styles.flagContainerStatic,
                                flag: {},
                                callingCode: {
                                    fontFamily: constants.FONTS.Space_Grotesk,
                                    fontSize: constants.SIZE.TEXT_LG,
                                    fontStyle: 'normal',
                                    fontWeight: '400',
                                    lineHeight: constants.LINE_HEIGHT.MD,
                                    letterSpacing: -0.36,
                                    color: constants.COLORS.TEXT_WHITE
                                },
                                input: isEditing ? {
                                    color: constants.COLORS.TEXT_WHITE
                                } : styles.flagInputStatic,
                            }}
                            keyboardType='phone-pad'
                            autoFocus={true}
                            value={phoneNumVal}
                            placeholder=' '
                            onChangePhoneNumber={handleInputValue}
                            selectedCountry={selectedCountry}
                            onChangeSelectedCountry={handleSelectedCountry}
                        />
                        {errorMsg && <Text style={styles.dangerText}>{i18n.t('signupScreen.phoneNumErrMsg')}</Text>}
                    </View>

                    <ClipboardInput type='walletAddress' label='Deposit Solana address' textValue={walletAddress} isEditing={isEditing} onChangeText={setWalletAddress} />

                    {/* Currency */}
                    <View style={{ marginBottom: 22 }}>
                        <Text style={styles.dropDownLabelStyle}>My local currency</Text>
                        <SelectDropdown
                            disabled={!isEditing}
                            dropdownOverlayColor={'false'}
                            data={currencyList}
                            defaultValue={userState.currency}
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
                            buttonStyle={isEditing ? styles.dropdownBtnStyle : styles.dropdownBtnStaticStyle}
                            renderDropdownIcon={isOpened => {
                                if (isEditing) {
                                    return isOpened ?
                                        <SvgXml xml={constants.SVGS.upArrow} width={24} height={24} /> :
                                        <SvgXml xml={constants.SVGS.downArrow} width={24} height={24} />;
                                }
                            }}
                            dropdownIconPosition={'right'}
                            dropdownStyle={styles.dropdownDropdownStyle}
                            rowStyle={styles.dropdownRowStyle}
                            renderCustomizedButtonChild={(selectedItem, index) => {
                                return (
                                    <View key={`select_${index}`} style={isEditing ? styles.dropdownBtnChildStyle : styles.dropdownBtnChildStaticStyle}>
                                        <Text style={styles.dropdownBtnEmoji}>{selectedItem ? selectedItem.emoji : ''}</Text>
                                        <Text style={styles.dropdownBtnTxt}>{selectedItem ? selectedItem.name : ''}</Text>
                                        <Text style={styles.dropdownBtnCode}> {selectedItem ? `(${selectedItem.code})` : ''}</Text>
                                    </View>
                                );
                            }}
                            renderCustomizedRowChild={(item, index) => {
                                return (
                                    <View key={`drop_${index}`} style={styles.dropdownRowChildStyle}>
                                        <Text style={styles.dropdownBtnEmoji}>{item.emoji}</Text>
                                        <Text style={styles.dropdownBtnTxt}>{item.name}</Text>
                                        <Text style={styles.dropdownBtnCode}> {`(${item.code})`}</Text>
                                    </View>
                                );
                            }}
                        />
                    </View>
                </ScrollView>
            </View>
        </Container>
    );
}

const styles = StyleSheet.create({
    content: {
        flex: 1
    },
    dangerText: {
        color: constants.COLORS.TEXT_DANGER,
        fontFamily: constants.FONTS.Space_Grotesk,
        fontSize: constants.SIZE.TEXT_SM,
        fontStyle: 'normal',
        fontWeight: '400',
        lineHeight: constants.LINE_HEIGHT.MD,
        alignSelf: 'flex-end',
        marginTop: 8
    },
    labelStyle: {
        ...constants.G_STYLE.TEXT_SM_DESCRIPTION,
        alignSelf: 'flex-start',
        marginBottom: 8,
        opacity: 1
    },
    flagContainerStatic: {
        paddingLeft: 4,
        paddingRight: 4,
        borderTopLeftRadius: 7,
        borderBottomLeftRadius: 7,
        backgroundColor: constants.COLORS.BACKGROUND_BLACK,
        justifyContent: 'center',
        borderColor: constants.COLORS.BORDER_BRIGHT_DARK,
    },
    flagInputStatic: {
        color: '#fff',
        paddingLeft: 0
    },
    // Currency
    dropdownBtnStyle: {
        width: '100%',
        height: 48,
        backgroundColor: constants.COLORS.BACKGROUND_LIGHT_DARK,
        borderRadius: constants.SIZE.BORDER_RADIUS_MD,
        borderBottomWidth: constants.SIZE.BORDER_WIDTH_SM,
        borderBottomColor: constants.COLORS.BORDER_BRIGHT_DARK,
        borderTopWidth: 1.1,
        borderTopColor: constants.COLORS.BORDER_BRIGHT_DARK,
        borderLeftWidth: constants.SIZE.BORDER_WIDTH_SM,
        borderLeftColor: constants.COLORS.BORDER_BRIGHT_DARK,
        borderRightWidth: constants.SIZE.BORDER_WIDTH_SM,
        borderRightColor: constants.COLORS.BORDER_BRIGHT_DARK,
    },
    dropdownBtnStaticStyle: {
        width: '100%',
        height: 48,
        backgroundColor: constants.COLORS.BACKGROUND_BLACK,
        borderBottomWidth: constants.SIZE.BORDER_WIDTH_SM,
        borderBottomColor: constants.COLORS.BORDER_BRIGHT_DARK,
        paddingHorizontal: 0
    },
    dropdownDropdownStyle: {
        backgroundColor: constants.COLORS.BACKGROUND_LIGHT_DARK,
        borderRadius: constants.SIZE.BORDER_RADIUS_MD,
        height: 210,
        // marginTop: -18
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
    dropdownBtnChildStaticStyle: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 0,
        marginLeft: 0,
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
