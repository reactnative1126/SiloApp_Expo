import * as React from 'react';
import { Text, View, StyleSheet, StatusBar, ScrollView } from 'react-native';
import { Button } from 'react-native-paper';
import { userAtom } from '../../_recoil/user/user.state';
import { UserState } from '../../_recoil/user/user.types';
import { useRecoilValue } from 'recoil';
import constants from '../../constants';
import { SvgXml } from 'react-native-svg';
import { Link } from 'expo-router';
import CustomInput from '../../components/CustomInput';
import PhoneInput, { getCountryByPhoneNumber } from 'react-native-international-phone-number'
import i18n from '../../translations';
import SelectDropdown from 'react-native-select-dropdown';
import { getCurrencyList } from '../../services/currency';
import { log } from '../../_util/debug';

type countryType = {
    callingCode: string
}

export default function PersonalInfo() {
    const userState = useRecoilValue(userAtom) as UserState;
    const [isEditing, setIsEditing] = React.useState<boolean>(false);
    const [phoneNumVal, setPhoneNumVal] = React.useState<string>('');
    const [errorMsg, setErrorMsg] = React.useState<string>('');
    const [selectedCountry, setSelectedCountry] = React.useState<any>(null);
    const [currencyList, setCurrencyList] = React.useState<any[]>([userState?.currency]);
    const [localCurrencyIdx, setLocalCurrencyIdx] = React.useState<number>(0);

    function handleInputValue(phoneNumber: any) {
        setPhoneNumVal(phoneNumber);
    }

    function handleSelectedCountry(country: any) {
        setSelectedCountry(country);
    }

    React.useEffect(() => {
        getCurrencyList()
            .then(res => {
                setCurrencyList([userState?.currency, ...res.data.data.currencies]);
            })
            .catch(err => {
                log(err)
            })
    }, [])

    React.useEffect(() => {
        let country = getCountryByPhoneNumber(userState?.phone) as countryType;
        setSelectedCountry(country);
        setPhoneNumVal(userState?.phone.replace(country.callingCode, ''));
    }, [userState?.phone])


    return (
        <ScrollView style={constants.G_STYLE.ROOT_VIEW}>
            <StatusBar backgroundColor="transparent" barStyle="light-content" />
            <View style={styles.content}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 30 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Link href={{ pathname: "/settings" }} style={{ marginRight: 8 }}>
                            <SvgXml
                                xml={constants.SVGS.back}
                                width={24}
                                height={24}
                            />
                        </Link>
                        <Text style={[constants.G_STYLE.LOGO_TEXT, { paddingLeft: 0, fontSize: constants.SIZE.TEXT_XL, lineHeight: 32, letterSpacing: -0.48 }]}>
                            Personal Info
                        </Text>
                    </View>
                    {!isEditing &&
                        <View>
                            <Button style={styles.editBtn} onPress={() => setIsEditing(!isEditing)}>
                                <Text style={styles.editBtnTxt}>
                                    Edit
                                </Text>
                            </Button>
                        </View>}

                    {isEditing &&
                        <View style={{ display: 'flex', flexDirection: 'row' }}>
                            <Button style={styles.cancelBtn} onPress={() => setIsEditing(!isEditing)}>
                                <Text style={styles.cancelBtnTxt}>
                                    Cancel
                                </Text>
                            </Button>
                            <Button style={styles.saveBtn} onPress={() => setIsEditing(!isEditing)}>
                                <Text style={styles.saveBtnTxt}>
                                    Save
                                </Text>
                            </Button>
                        </View>}
                </View>
                <View>
                    <CustomInput label='Username' textValue={userState?.username} isEditing={isEditing} />
                    <CustomInput label='Email address' textValue={userState?.email} isEditing={isEditing} />

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
                            placeholder=" "
                            onChangePhoneNumber={handleInputValue}
                            selectedCountry={selectedCountry}
                            onChangeSelectedCountry={handleSelectedCountry}
                        />
                        {errorMsg && <Text style={styles.dangerText}>{i18n.t('signupScreen.phoneNumErrMsg')}</Text>}
                    </View>

                    <CustomInput type='walletAddress' label='Deposit Solana address' icon={constants.SVGS.copy_to_clipboard} textValue={userState?.walletAddress} isEditing={isEditing} />

                    {/* Currency */}
                    <View>
                        <Text style={styles.dropDownLabelStyle}>My local currency</Text>
                        <SelectDropdown
                            disabled={!isEditing}
                            dropdownOverlayColor={'false'}
                            data={currencyList}
                            defaultValue={userState?.currency}
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
                                    <View style={isEditing ? styles.dropdownBtnChildStyle : styles.dropdownBtnChildStaticStyle}>
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
                </View>
            </View>

        </ScrollView >
    );
}

const styles = StyleSheet.create({
    content: {
        height: '100%',
        paddingTop: 72,
        paddingLeft: 16,
        paddingRight: 16
    },
    editBtn: {
        borderWidth: constants.SIZE.BORDER_WIDTH_SM,
        borderRadius: constants.SIZE.BORDER_RADIUS_MD,
        borderColor: constants.COLORS.BORDER_BUTTON_WHITE,
        height: 32
    },
    editBtnTxt: {
        color: constants.COLORS.BORDER_BUTTON_WHITE,
        fontFamily: constants.FONTS.Syne_Bold,
        fontStyle: 'normal',
        lineHeight: 14,
        letterSpacing: -0.28
    },
    cancelBtn: {
        height: 32
    },
    cancelBtnTxt: {
        color: constants.COLORS.BORDER_BUTTON_WHITE,
        fontFamily: constants.FONTS.Syne_Bold,
        fontStyle: 'normal',
        lineHeight: 14,
        letterSpacing: -0.28
    },
    saveBtn: {
        borderRadius: constants.SIZE.BORDER_RADIUS_MD,
        backgroundColor: constants.COLORS.BACKGROUND_PRIMARY,
        height: 32
    },
    saveBtnTxt: {
        color: constants.COLORS.TEXT_BLACK,
        fontFamily: constants.FONTS.Syne_Bold,
        fontStyle: 'normal',
        lineHeight: 14,
        letterSpacing: -0.28
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
        borderWidth: constants.SIZE.BORDER_WIDTH_SM,
        borderColor: constants.COLORS.BORDER_BRIGHT_DARK
    },
    dropdownBtnStaticStyle: {
        width: '100%',
        height: 48,
        backgroundColor: constants.COLORS.BACKGROUND_BLACK,
        borderBottomWidth: constants.SIZE.BORDER_WIDTH_SM,
        borderColor: constants.COLORS.BORDER_BRIGHT_DARK,
        paddingHorizontal: 0
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
