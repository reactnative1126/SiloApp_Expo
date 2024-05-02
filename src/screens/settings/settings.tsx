import React, { useState, useEffect } from 'react';
import { useRecoilValue } from 'recoil';
import { Text, View, StyleSheet, ScrollView } from 'react-native';
import { SvgXml } from 'react-native-svg';
import * as ImagePicker from 'expo-image-picker';  // Import Expo ImagePicker

import Container from '../../components/common/Container';
import Avatar from '../../components/common/Avatar';
import SettingMenu from '../../components/settings/SettingMenu';

import constants from '../../utils/constants';
import { log } from '../../utils/functions';

import { userAtom } from '../../_recoil/user/user.state';

interface Nav {
    label: string,
    svg?: string,
    color?: string,
    screen?: any
}

export default function Settings(props: any) {
    const userState = useRecoilValue(userAtom);
    const [photo, setPhoto] = useState('');

    const navs = [
        {
            label: 'Personal information',
            svg: constants.SVGS.personal_info,
            screen: 'PersonalInfo'
        },
        {
            label: 'Monthly statement',
            svg: constants.SVGS.monthly_stat
        },
        {
            label: 'Notifications',
            svg: constants.SVGS.notification,
            screen: 'NotificationSettings'
        },
        {
            label: 'Leave feedback',
            svg: constants.SVGS.leave_feedback,
            screen: 'Feedback'
        },
        {
            label: 'ToS & Privacy Policy',
            svg: constants.SVGS.privacy_policy
        },
        {
            label: 'Change PIN Code',
            svg: constants.SVGS.change_pin_code,
            screen: 'PinCode'
        },
        {
            label: 'Log out',
            svg: constants.SVGS.logout,
            color: constants.COLORS.TEXT_DANGER,
            screen: 'Logout'
        }
    ]

    useEffect(() => {
        setPhoto(userState.profileImage);
    }, []);

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
        } catch (error) {
            log(`Error selecting image: ${error}`);
        }
    }

    return (
        <Container>
            <View style={styles.content}>
                <ScrollView
                    style={[styles.content, { paddingVertical: constants.SPACING.XL, paddingHorizontal: constants.SPACING.MD }]}
                    contentContainerStyle={{ paddingBottom: 200 }}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.userInfoContainer}>
                        <View style={{ marginBottom: 16 }}>
                            <Avatar
                                name={userState.name}
                                image={photo}
                                width={160}
                                height={160}
                                radius={80}
                                size={75}
                            />
                            {/* <TouchableOpacity
                                style={styles.editPenBox}
                                activeOpacity={0.8}
                                onPress={changePhoto}
                            >
                                <SvgXml
                                    xml={constants.SVGS.edit_pen}
                                    height={21}
                                />
                            </TouchableOpacity> */}
                        </View>
                        <Text style={styles.orgName}>{userState.name}</Text>
                        <Text style={styles.userName}>@{userState.username}</Text>
                    </View>

                    <View style={styles.navContainer}>
                        {navs.map((nav: Nav, idx: Number) => (
                            <View key={nav.label}>
                                <SettingMenu
                                    label={nav.label}
                                    icon={nav.svg}
                                    color={nav.color}
                                    navigation={props.navigation}
                                    screen={nav.screen}
                                />
                                {
                                    idx !== navs.length - 1 && <View
                                        key={`${nav.label}-underline`}
                                        style={{
                                            borderBottomColor: constants.COLORS.BORDER_BRIGHT_DARK,
                                            borderBottomWidth: StyleSheet.hairlineWidth,
                                            marginTop: 16,
                                            marginBottom: 16
                                        }}
                                    />
                                }
                            </View>
                        ))}
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
    userInfoContainer: {
        alignItems: 'center'
    },
    editPenBox: {
        display: 'flex',
        width: 40,
        height: 40,
        padding: 10,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
        borderRadius: 60,
        borderWidth: 2,
        borderColor: constants.COLORS.BORDER_DARK,
        backgroundColor: constants.COLORS.BACKGROUND_PRIMARY,
        position: 'absolute',
        right: 0
    },
    orgName: {
        color: constants.COLORS.TEXT_WHITE,
        fontFamily: constants.FONTS.Syne_Bold,
        fontSize: constants.SIZE.TEXT_XL,
        fontStyle: 'normal',
        lineHeight: 32,
        letterSpacing: -0.48
    },
    userName: {
        color: constants.COLORS.TEXT_PRIMARY,
        fontFamily: constants.FONTS.Space_Grotesk,
        fontSize: constants.SIZE.TEXT_MD2,
        fontStyle: 'normal',
        fontWeight: '400',
        lineHeight: constants.LINE_HEIGHT.MD
    },
    navContainer: {
        marginTop: 49
    }
});
