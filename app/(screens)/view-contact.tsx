import * as React from 'react';
import ContactDetail from '../../components/contacts/ContactDetail';
import { Text, View, StyleSheet, StatusBar, ScrollView } from 'react-native';
import constants from '../../constants';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import { SvgXml } from 'react-native-svg';
import { Modal, Portal, Button } from 'react-native-paper';
import { useUserActions } from '../../_recoil/user/user.actions';
import Toast from 'react-native-toast-message';
import { Image } from 'expo-image';
import { formatAddress } from '../../_util/misc';

export default function ViewContact() {
    const params = useLocalSearchParams();
    const { isNew, name, email, walletAddress, rebelfiContact, contactID, profileImage } = params as any;
    
    const [visible, setVisible] = React.useState(false);
    const { delContact } = useUserActions();
    const navigation = useRouter();

    const showModal = () => setVisible(true);
    const hideModal = () => setVisible(false);
    const handleDelete = async () => {
        await delContact(contactID);
        hideModal();
        setTimeout(() => {
            navigation.push('/contacts');
        }, 3000);
    }

    const renderUserImage = () => {
        if (profileImage?.length) {
            return (
                <View>
                    <Image
                        source={profileImage}
                        contentFit="cover"
                        transition={0}
                        style={styles.modalmgStyle}
                    />
                </View>
            )
        } else if (walletAddress?.length) {
            return (
                <View>
                    <SvgXml
                        xml={constants.SVGS.wallet_contact}
                        width={48}
                        height={48}
                        style={styles.modalmgStyle}
                    />
                </View>
            )
        } else if (email?.length) {
            return (
                <View>
                    <SvgXml
                        xml={constants.SVGS.email_contact}
                        width={48}
                        height={48}
                        style={styles.modalmgStyle}
                    />
                </View>
            )
        } else {
            return (
                <View>
                    <SvgXml
                        xml={constants.SVGS.blank_user}
                        width={48}
                        height={48}
                        style={styles.modalmgStyle}
                    />
                </View>
            )
        }
    }

    const rebelfiContactObj = JSON.parse(rebelfiContact);

    return (
        <>
            <ScrollView style={constants.G_STYLE.ROOT_VIEW}>
                <StatusBar backgroundColor="transparent" barStyle="light-content" />
                <Toast />
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
                                Contact
                            </Text>
                        </View>
                        {
                            isNew != '1' &&
                            <View style={{ display: 'flex', flexDirection: 'row' }}>
                                <Button style={styles.deleteBtn} onPress={showModal}>
                                    <Text style={styles.deleteBtnTxt}>
                                        Remove Contact
                                    </Text>
                                </Button>
                            </View>
                        }
                    </View>
                    <ContactDetail
                        imgWidth={64}
                        imgHeight={64}
                        isNew={isNew}
                        userInfo={{ name, email, walletAddress, rebelfiContact, photoURL: profileImage }} />
                    <Portal>
                        <Modal visible={visible} onDismiss={hideModal} contentContainerStyle={styles.modalContainer}>
                            <Text style={{
                                color: constants.COLORS.TEXT_WHITE,
                                fontFamily: constants.FONTS.Space_Grotesk,
                                fontSize: constants.SIZE.TEXT_XL,
                                fontStyle: 'normal',
                                fontWeight: '600',
                                lineHeight: constants.LINE_HEIGHT.MD2,
                                letterSpacing: -0.48,
                                alignSelf: 'stretch',
                                textAlign: 'center'
                            }}>
                                Are you sure you would like to remove this user from your contacts?
                            </Text>

                            <View style={styles.modalUserInfo}>
                                {renderUserImage()}
                                <View style={styles.userContact}>
                                    {/* <View> */}
                                    <Text style={styles.userName}>
                                        {formatAddress(walletAddress) || email || (rebelfiContact && rebelfiContactObj.address) || name}
                                    </Text>
                                    {/* </View> */}

                                    {
                                        rebelfiContactObj?.id &&
                                        <View>
                                            <Text style={styles.userEmail}>
                                                {rebelfiContactObj?.username}
                                            </Text>
                                        </View>
                                    }

                                </View>
                            </View>

                            <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'space-between' }}>
                                <Button
                                    onPress={handleDelete}
                                    style={{
                                        backgroundColor: constants.COLORS.BACKGROUND_BUTTON_DANGER,
                                        borderRadius: constants.SIZE.BORDER_RADIUS_MD,
                                        width: '45%'
                                    }}>
                                    <Text style={[constants.G_STYLE.BUTTON_TEXT, { color: constants.COLORS.TEXT_WHITE }]}>
                                        Yes, remove
                                    </Text>
                                </Button>
                                <Button style={[constants.G_STYLE.BTN_OUTLINE, {
                                    borderColor: constants.COLORS.BORDER_BUTTON_WHITE,
                                    borderRadius: constants.SIZE.BORDER_RADIUS_MD,
                                    width: '45%'
                                }]}
                                    onPress={hideModal}
                                >
                                    <Text style={[constants.G_STYLE.BUTTON_TEXT, { color: constants.COLORS.TEXT_WHITE }]}>
                                        Cancel
                                    </Text>
                                </Button>
                            </View>
                        </Modal>
                    </Portal>
                </View>
            </ScrollView >
        </>
    );
}

const styles = StyleSheet.create({
    deleteBtn: {
        ...constants.G_STYLE.BTN_OUTLINE,
        borderColor: constants.COLORS.BORDER_DANGER,
        height: 32,
        zIndex: -1
    },
    deleteBtnTxt: {
        ...constants.G_STYLE.BUTTON_TEXT,
        color: constants.COLORS.TEXT_DANGER,
        lineHeight: 14,
        letterSpacing: -0.28
    },
    // Modal
    modalContainer: {
        backgroundColor: constants.COLORS.BACKGROUND_BLACK,
        color: constants.COLORS.TEXT_WHITE,
        padding: 24,
        marginHorizontal: 16,
        borderRadius: constants.SIZE.BORDER_RADIUS_MD,
        alignItems: 'center',
        textAlign: 'center',
        alignContent: 'center'
    },
    modalUserInfo: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: constants.COLORS.BORDER_BRIGHT_DARK_OPACITY,
        paddingVertical: 16,
        marginVertical: 24
    },
    userContact: {
        paddingLeft: constants.SPACING.SM,
        justifyContent: 'center'
    },
    userName: {
        color: constants.COLORS.TEXT_WHITE,
        overflow: 'hidden',
        fontFamily: constants.FONTS.Space_Grotesk,
        fontSize: constants.SIZE.TEXT_LG2,
        fontStyle: 'normal',
        fontWeight: '500',
        lineHeight: constants.LINE_HEIGHT.MD,
        letterSpacing: -0.36
    },
    userEmail: {
        overflow: 'hidden',
        color: constants.COLORS.TEXT_MUTED,
        fontFamily: constants.FONTS.Wix_Madefor_Display,
        fontSize: constants.SIZE.TEXT_MD2,
        fontStyle: 'normal',
        fontWeight: '500',
        lineHeight: constants.LINE_HEIGHT.MD
    },
    modalmgStyle: {
        width: 48,
        height: 48,
        borderRadius: 48
    }
});

