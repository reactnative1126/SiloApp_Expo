import React, { useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { Text, View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Toast from 'react-native-toast-message';
import { SvgXml } from 'react-native-svg';

import Container from '../../components/common/Container';
import Header from '../../components/settings/Header';

import constants from '../../utils/constants';
import { log } from '../../utils/functions';

import { useUserActions } from '../../_recoil/user/user.actions';
import { notificationSettingsAtom } from '../../_recoil/user/user.state';
import { NotifySettings } from '../../_recoil/user/user.types';

export default function NotificationSettings(props: any) {
    const userActions = useUserActions();

    const notificationSettingsState = useRecoilValue(notificationSettingsAtom) as NotifySettings;

    const [pushNotification, setPushNotification] = useState<boolean>(false);
    const [emailNotification, setEmailNotification] = useState<boolean>(false);

    useEffect(() => {
        setPushNotification(notificationSettingsState.push);
        setEmailNotification(notificationSettingsState.email);
    }, [])

    const handleSubmit = async () => {
        try {
            const res = await userActions.changeNotificationSettings(emailNotification, pushNotification, 'There was a problem setting your notification setting.');
            if (res.success) {
                props.navigation.pop();
                Toast.show({ type: 'success', text1: 'Set Your Notification Settings Successfully.' });
            } else {
                Toast.show({ type: 'error', text1: 'Settings Failed', text2: res.message });
            }
        } catch (error: any) {
            log(error);
        }
    }

    return (
        <Container>
            <View style={styles.content}>
                <Header
                    back
                    title='Notifications'
                    onBack={handleSubmit}
                />
                <ScrollView
                    style={[styles.content, { paddingVertical: constants.SPACING.XL, paddingHorizontal: constants.SPACING.MD }]}
                    contentContainerStyle={{ height: '100%', paddingBottom: 100 }}
                    showsVerticalScrollIndicator={false}
                >
                    <Text style={styles.description}>
                        Transfers/Deposits
                    </Text>

                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => setPushNotification(!pushNotification)}
                    >
                        <SvgXml
                            xml={pushNotification ? constants.SVGS.check_in : constants.SVGS.check_out}
                            width={24}
                            height={24}
                        />
                        <Text style={styles.button_text}>
                            Push notifications
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => setEmailNotification(!emailNotification)}
                    >
                        <SvgXml
                            xml={emailNotification ? constants.SVGS.check_in : constants.SVGS.check_out}
                            width={24}
                            height={24}
                        />
                        <Text style={styles.button_text}>
                            Via Email
                        </Text>
                    </TouchableOpacity>
                </ScrollView>
            </View>
        </Container>
    );
}

const styles = StyleSheet.create({
    content: {
        flex: 1
    },
    description: {
        width: '100%',
        color: constants.COLORS.TEXT_WHITE,
        fontFamily: 'Space Grotesk',
        fontSize: 20,
        fontWeight: '600',
        lineHeight: 24,
        letterSpacing: -0.4,
    },
    button: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        marginTop: constants.SPACING.MD
    },
    button_text: {
        marginLeft: constants.SPACING.MD,
        fontFamily: constants.FONTS.Space_Grotesk,
        fontSize: constants.SIZE.TEXT_MD2,
        fontWeight: '400',
        color: constants.COLORS.TEXT_WHITE
    }
});
