import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';  // Import Expo ImagePicker
import Toast from 'react-native-toast-message';
import { SvgXml } from 'react-native-svg';
import { Button } from 'react-native-paper';

import Container from '../../components/common/Container';
import Header from '../../components/contacts/Header';
import CustomInput from '../../components/common/CustomInput';
import CustomRadioBtn from '../../components/common/CustomRadioBtn';
import UserImage from '../../components/common/UserImage';

import constants from '../../utils/constants';
import { log } from '../../utils/functions';

import { useUserActions } from '../../_recoil/user/user.actions';

export default function ContactCreate(props: any) {
    const userActions = useUserActions();

    const params = useLocalSearchParams();
    const { name, email, walletAddress } = params as any;

    const [hasPhoto, setHasPhoto] = useState<boolean>(false);
    const [hasError, setHasError] = useState<boolean>(false);
    const [check, setCheck] = useState<string>('wallet');
    const [nameVal, setNameVal] = useState<string>('');
    const [emailVal, setEmailVal] = useState<string>('');
    const [nameErr, setNameErr] = useState<string>('');
    const [emailErr, setEmailErr] = useState<string>('');
    const [walletErr, setwalletErr] = useState<string>('');
    const [walletAddressVal, setWalletAddressVal] = useState<string>('');
    const [photo, setPhoto] = useState<string>('');

    useEffect(() => {
        setPhoto('');
        setNameVal(name || '');
        setEmailVal(email || '');
        setWalletAddressVal(walletAddress || '');

        if (walletAddress) {
            setCheck('wallet');
        } else {
            setCheck('email');
        }
    }, [name, email, walletAddress]);

    const handleSudmit = async () => {
        if ((nameVal && emailVal) || (nameVal && walletAddressVal)) {
            try {
                const res = await userActions.addContact(nameVal, emailVal, walletAddressVal, 'There was a problem adding contact.');

                if (res.success) {
                    setNameVal('');
                    setEmailVal('');
                    setWalletAddressVal('');
                    setPhoto('');
                    Toast.show({ type: 'success', text1: 'Created Contact Successfuly' });
                    props.navigation.pop();
                } else {
                    // const { email, wallet } = res.data.errors;
                    // check === 'email' && setEmailErr(email);
                    // check === 'wallet' && setwalletErr(wallet);
                    Toast.show({ type: 'error', text1: 'Create Contact Error', text2: res.message });
                }
            } catch (error: any) {
                log(error);
            }
        } else {
            !nameVal ? setNameErr('Name is required') : setNameErr('');
            !emailVal ? setEmailErr('Email is required') : setEmailErr('');
            !walletAddressVal ? setwalletErr('Wallet address is required') : setwalletErr('');
        }
    }

    const changePhoto = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 1,
            });

            if (!result.canceled && result.assets) {
                // Check if the user didn't cancel the image picker and assets are available
                const selectedImage = result.assets[0];
                setPhoto(selectedImage.uri || '');  // Use the 'uri' property if available
            }
        } catch (error: any) {
            log(error);
        }
    }

    return (
        <Container>
            <Header
                back
                title='Create new contact'
                onAdd={() => props.navigation.push('ContactCreate')}
                onBack={() => { props.navigation.pop() }}
            />
            <ScrollView
                style={[styles.content, { padding: constants.SPACING.MD }]}
                contentContainerStyle={{ paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
            >
                <View style={{ alignItems: 'center' }}>
                    <View style={{ marginBottom: 16 }}>
                        {photo ? (
                            <UserImage
                                width={136}
                                height={136}
                                userInfo={{ profileImage: photo, rebelfiContact: JSON.stringify({}) }}
                                style={styles.userAvatar}
                            />
                        ) : (
                            <SvgXml
                                xml={constants.SVGS.default_avatar}
                                width={136}
                                height={136}
                                style={styles.userAvatar}
                            />
                        )}
                    </View>
                    {!hasPhoto && <View>
                        <Button style={styles.smBtn} onPress={changePhoto}>
                            <Text style={styles.smBtnTxt}>
                                Add photo
                            </Text>
                        </Button>
                    </View>}
                    {hasPhoto && <View style={{ flexDirection: 'row' }}>
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
                    <Text style={styles.label}>Add By</Text>
                    <CustomRadioBtn
                        onInputTextChange={setEmailVal}
                        onCheck={() => setCheck('email')}
                        checked={check === 'email' ? 'checked' : 'unchecked'}
                        label='Email address'
                        type='email'
                        inputValue={emailVal.toLowerCase()}
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
                <View style={styles.createBtnView}>
                    <Button style={hasError ? styles.createBtnInactive : styles.createBtnActive} onPress={handleSudmit}>
                        <Text style={hasError ? styles.createBtnTextInactive : styles.createBtnTextActive}>
                            Create
                        </Text>
                    </Button>
                </View>
            </ScrollView>
        </Container>
    );
}

const styles = StyleSheet.create({
    content: {
        flex: 1,
        zIndex: 99
    },
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
        marginBottom: constants.SPACING.MD,
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
    }
});