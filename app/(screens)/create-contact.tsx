import * as React from 'react';
import { Text, View, StyleSheet, StatusBar, ScrollView } from 'react-native';
import constants from '../../constants';
import { Link, useRouter, useLocalSearchParams } from 'expo-router';
import { SvgXml } from 'react-native-svg';
import { Button } from 'react-native-paper';
import CustomInput from '../../components/CustomInput';
import CustomRadioBtn from '../../components/CustomRadioBtn';
import UserImage from '../../components/UserImage';
import { userAtom } from '../../_recoil/user/user.state';
import { useUserActions } from '../../_recoil/user/user.actions';
import { UserState } from '../../_recoil/user/user.types';
import { useRecoilValue } from 'recoil';
import Toast, { SuccessToast } from 'react-native-toast-message';

export default function CreateContact() {
    const [hasPhoto, setHasPhoto] = React.useState<boolean>(false);
    const [hasError, setHasError] = React.useState<boolean>(false);
    const [check, setCheck] = React.useState<string>('wallet');
    const [nameVal, setNameVal] = React.useState<string>('');
    const [emailVal, setEmailVal] = React.useState<string>('');
    const [nameErr, setNameErr] = React.useState<string>('');
    const [emailErr, setEmailErr] = React.useState<string>('');
    const [walletErr, setwalletErr] = React.useState<string>('');
    const [walletAddressVal, setWalletAddressVal] = React.useState<string>('');
    const navigation = useRouter();

    const params = useLocalSearchParams();
    const { name, email, walletAddress } = params as any;

    const userState = useRecoilValue(userAtom) as UserState;
    const { addContact } = useUserActions();

    const handleSudmit = async () => {
        if ((nameVal && emailVal) || (nameVal && walletAddressVal)) {
            const resp = await addContact(nameVal, emailVal, walletAddressVal);

            setNameVal('');
            setEmailVal('');
            setWalletAddressVal('');

            if (!resp.success) {
                check === 'email' && setEmailErr(resp.message);
                check === 'wallet' && setwalletErr(resp.message);
            }

            setTimeout(() => {
                navigation.push('/contacts');
            }, 3000);
        } else {
            !nameVal ? setNameErr('Name is required') : setNameErr('');
            !emailVal ? setEmailErr('Email is required') : setEmailErr('');
            !walletAddressVal ? setwalletErr('Wallet address is required') : setwalletErr('');
        }
    }

    React.useEffect(() => {
        setNameVal(name || '');
        setEmailVal(email || '');
        setWalletAddressVal(walletAddress || '');

        if (walletAddress) {
            setCheck('wallet');
        } else {
            setCheck('email');
        }
    }, [name, email, walletAddress]);

    return (
        <View style={[constants.G_STYLE.ROOT_VIEW, { height: '100%' }]}>
            <StatusBar backgroundColor="transparent" barStyle="light-content" />
            <ScrollView>
                <View style={constants.G_STYLE.CONTENT_VIEW}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 30 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Link href={{ pathname: "/contacts" }} style={{ marginRight: 8 }}>
                                <SvgXml
                                    xml={constants.SVGS.back}
                                    width={24}
                                    height={24}
                                />
                            </Link>
                            <Text style={[constants.G_STYLE.LOGO_TEXT, { paddingLeft: 0, fontSize: constants.SIZE.TEXT_XL, lineHeight: 32, letterSpacing: -0.48 }]}>
                                Create new contact
                            </Text>
                        </View>
                    </View>
                    <View style={{ alignItems: 'center' }}>
                        <View style={{ marginBottom: 16 }}>
                            <UserImage width={136} height={136} userInfo={{ photoURL: userState?.profileImage, rebelfiContact: JSON.stringify({}) }} style={styles.userAvatar} />
                        </View>
                        {hasPhoto && <View>
                            <Button style={styles.smBtn}>
                                <Text style={styles.smBtnTxt}>
                                    Add photo
                                </Text>
                            </Button>
                        </View>}
                        {!hasPhoto && <View style={{ flexDirection: 'row' }}>
                            <Button style={styles.smBtn}>
                                <Text style={styles.smBtnTxt}>
                                    Change
                                </Text>
                            </Button>
                            <Button style={styles.smBtn}>
                                <Text style={styles.smBtnTxt}>
                                    Delete
                                </Text>
                            </Button>
                        </View>}
                    </View>

                    <View style={{ marginTop: 24, marginBottom: 60 }}>
                        <CustomInput label='Name' textValue={nameVal} onChangeText={setNameVal} errorMsg={nameErr} />

                        <View>
                            <Text style={styles.label}>Add By</Text>
                        </View>
                        <CustomRadioBtn
                            onInputTextChange={setEmailVal}
                            onCheck={() => setCheck('email')}
                            checked={check === 'email' ? 'checked' : 'unchecked'}
                            label='Email address'
                            type='email'
                            inputValue={emailVal}
                            errMsg={emailErr}
                        />
                        <CustomRadioBtn
                            onInputTextChange={setWalletAddressVal}
                            onCheck={() => setCheck('wallet')}
                            checked={check === 'wallet' ? 'checked' : 'unchecked'}
                            label='Solana wallet address'
                            type='wallet'
                            inputValue={walletAddressVal}
                            errMsg={walletErr}
                        />
                    </View>
                </View>

            </ScrollView>
            <View style={styles.createBtnView}>
                <Button style={hasError ? styles.createBtnInactive : styles.createBtnActive} onPress={handleSudmit}>
                    <Text style={hasError ? styles.createBtnTextInactive : styles.createBtnTextActive}>
                        Create
                    </Text>
                </Button>
            </View>
            <Toast config={{
                success: (props) => (
                    <SuccessToast
                        {...props}
                        contentContainerStyle={{ paddingHorizontal: 15 }}
                        text1Style={{
                            fontSize: 15,
                            fontWeight: '400'
                        }}
                    />
                ),
            }} />
        </View >
    );
}

const styles = StyleSheet.create({
    userAvatar: {
        width: 136,
        height: 136,
        borderRadius: 136,
        zIndex: -1
    },
    smBtn: {
        borderWidth: constants.SIZE.BORDER_WIDTH_SM,
        borderRadius: constants.SIZE.BORDER_RADIUS_MD,
        borderColor: constants.COLORS.BORDER_BUTTON_WHITE,
        height: 32,
        minWidth: 80,
        width: 'auto',
        marginHorizontal: 4
    },
    smBtnTxt: {
        color: constants.COLORS.TEXT_WHITE,
        fontFamily: constants.FONTS.Syne_Bold,
        fontStyle: 'normal',
        lineHeight: 14,
        letterSpacing: -0.28
    },
    label: {
        color: constants.COLORS.TEXT_WHITE,
        fontFamily: constants.FONTS.Space_Grotesk,
        fontSize: constants.SIZE.TEXT_LG,
        fontStyle: 'normal',
        fontWeight: '400',
        lineHeight: constants.LINE_HEIGHT.MD,
        letterSpacing: -0.32
    },
    createBtnView: {
        position: "absolute",
        bottom: 0,
        width: '100%'
    },
    createBtnActive: {
        ...constants.G_STYLE.BTN_PRIMARY,
        marginHorizontal: 16
    },
    createBtnInactive: {
        ...constants.G_STYLE.BTN_DISABLED,
        marginHorizontal: 16
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
    }
});
