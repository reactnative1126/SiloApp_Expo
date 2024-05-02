import * as React from 'react';
import { Text, View, StyleSheet, StatusBar, ScrollView } from 'react-native';
import { userAtom } from '../../_recoil/user/user.state';
import { UserState } from '../../_recoil/user/user.types';
import { useRecoilValue } from 'recoil';
import constants from '../../constants';
import { SvgXml } from 'react-native-svg';
import HorizonNav from '../../components/settings/HorizonNav';
import { Image } from 'expo-image';

interface Nav {
    label: string,
    svg?: string,
    color?: string,
    href?: any
}

export default function Settings() {
    const userState = useRecoilValue(userAtom) as UserState;

    const navs = [
        {
            label: 'Personal information',
            svg: constants.SVGS.personal_info,
            href: '/personal-information'
        },
        {
            label: 'Monthly statement',
            svg: constants.SVGS.monthly_stat
        },
        {
            label: 'Notifications',
            svg: constants.SVGS.notification
        },
        {
            label: 'Leave feedback',
            href: '/feedback',
            svg: constants.SVGS.leave_feedback
        },
        {
            label: 'ToS & Privacy Policy',
            svg: constants.SVGS.privacy_policy
        },
        {
            label: 'Change PIN Code',
            svg: constants.SVGS.change_pin_code
        },
        {
            label: 'Log out',
            svg: constants.SVGS.logout,
            color: constants.COLORS.TEXT_DANGER,
            href: 'logout'
        }
    ]

    return (
        <ScrollView style={constants.G_STYLE.ROOT_VIEW}>
            <StatusBar backgroundColor="transparent" barStyle="light-content" />
            <View style={styles.content}>
                <View style={styles.userInfoContainer}>
                    <View style={{ marginBottom: 16 }}>
                        <Image
                            style={styles.useravatar}
                            source={userState?.profileImage}
                            contentFit="cover"
                            transition={0}
                        />
                        <View style={styles.editPenBox}>
                            <SvgXml
                                xml={constants.SVGS.edit_pen}
                                height={21}
                                style={styles.editPen}
                            />
                        </View>
                    </View>
                    <Text style={styles.orgName}>Adam Keen</Text>
                    <Text style={styles.userName}>@{userState?.username}</Text>
                </View>
                <View style={styles.navContainer}>
                    {navs.map((nav: Nav, idx: Number) => (
                        <View key={nav.label}>
                            <HorizonNav
                                label={nav.label}
                                icon={nav.svg}
                                color={nav.color}
                                href={nav.href}
                            />
                            {idx !== navs.length - 1 && <View
                                key={`${nav.label}-underline`}
                                style={{
                                    borderBottomColor: constants.COLORS.BORDER_BRIGHT_DARK,
                                    borderBottomWidth: StyleSheet.hairlineWidth,
                                    marginTop: 16,
                                    marginBottom: 16
                                }}
                            />}
                        </View>
                    ))}
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
    userInfoContainer: {
        alignItems: 'center'
    },
    useravatar: {
        width: 160,
        height: 160,
        borderRadius: 160,
        position: 'relative'
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
    editPen: {

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
