import * as React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import constants from '../../constants';
import { useRouter } from 'expo-router';
import { SvgXml } from 'react-native-svg';
import { Button } from 'react-native-paper';
import UserImage from '../../components/UserImage';
import { formatAddress } from '../../_util/misc';

export default function ContactDetail(props: any) {
    const { imgWidth, imgHeight, isNew }: { imgWidth: number, imgHeight: number, isNew: number } = props;
    const { name, email, walletAddress, rebelfiContact, photoURL }:
        { name: string, email: string, walletAddress: string, rebelfiContact: any, photoURL: string } = props.userInfo;
    const navigator = useRouter();
    
    return (
        <View style={[constants.G_STYLE.CARD_BOX, { marginTop: 30 }]}>
            <UserImage
                userInfo={{
                    name,
                    email,
                    walletAddress: formatAddress(walletAddress),
                    rebelfiContact,
                    photoURL: rebelfiContact.id ? JSON.parse(rebelfiContact)?.profileImage : photoURL
                }}
                style={{ width: isNew == 1 ? imgWidth : 136, height: isNew == 1 ? imgHeight : 136, borderRadius: isNew == 1 ? 0 : imgWidth }}
                width={imgWidth}
                height={imgHeight}
                textStyle={{
                    color: constants.COLORS.TEXT_WHITE,
                    fontFamily: constants.FONTS.Space_Grotesk,
                    fontSize: constants.SIZE.TEXT_LG3,
                    fontStyle: 'normal',
                    fontWeight: '600',
                    lineHeight: constants.LINE_HEIGHT.MD,
                    letterSpacing: -0.48,
                    marginTop: 16
                }}
                subTextStyle={{
                    color: constants.COLORS.TEXT_MUTED,
                    fontFamily: constants.FONTS.Space_Grotesk,
                    fontSize: constants.SIZE.TEXT_LG,
                    fontStyle: 'normal',
                    fontWeight: '400',
                    lineHeight: constants.LINE_HEIGHT.MD,
                    letterSpacing: -0.32
                }}
            />
            <View style={{ marginTop: 24, width: '100%', marginBottom: 24 }}>
                <Button style={[constants.G_STYLE.BTN_PRIMARY, { borderColor: constants.COLORS.BORDER_BUTTON_WHITE }]}>
                    <Text style={[constants.G_STYLE.BUTTON_TEXT, {
                        fontFamily: constants.FONTS.Syne_Bold,
                        fontSize: constants.SIZE.TEXT_LG,
                        lineHeight: constants.LINE_HEIGHT.MD,
                        letterSpacing: -0.32,
                        color: constants.COLORS.TEXT_BLACK
                    }]}>
                        Pay
                    </Text>
                </Button>
            </View>

            {
                isNew == 1 &&
                <View style={styles.addToContact}>
                    <Text style={styles.addToContactText}
                        onPress={() => navigator.push({
                            pathname: '/create-contact',
                            params: {
                                name, email, walletAddress
                            }
                        })}>Add to contacts</Text>
                    <SvgXml
                        xml={constants.SVGS.plus}
                        width={24}
                        height={24}
                        style={{ marginLeft: 8 }}
                        onPress={() => navigator.push('/create-contact')}
                    />
                </View>
            }
        </View>
    );
}

const styles = StyleSheet.create({
    addToContact: {
        marginTop: 16,
        alignSelf: 'center',
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        alignContent: 'center',
        flexDirection: 'row'
    },
    addToContactText: {
        color: constants.COLORS.TEXT_WHITE,
        fontFamily: constants.FONTS.Space_Grotesk,
        fontSize: constants.SIZE.TEXT_LG,
        fontStyle: 'normal',
        fontWeight: '400',
        lineHeight: 24,
        letterSpacing: -0.32
    },
});
