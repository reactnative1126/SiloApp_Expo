
import React from 'react';
import {
    StyleSheet,
    ScrollView,
    View,
    Text,
    ImageProps,
    Pressable
} from 'react-native';
import { SvgXml } from 'react-native-svg';
import constants from '../../constants';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image'

type UserInfoType = {
    id: number,
    name: string,
    username: string,
    email: string | null,
    walletAddress: string | null,
    address?: string | null,
    rebelfiContact: any,
    profileImage: string | null,
    isContact: boolean
}

type SearchDropDownProps = {
    queryType: 'EMAIL' | 'SOLANA_ADDRESS' | 'NAME' | 'REBELTAG',
    searchValue: string,
    dataSource: UserInfoType[],
    onPress: () => void,
}


const getKeyOfContact = (query: SearchDropDownProps['queryType']) => {
    switch (query) {
        case 'EMAIL':
            return 'address';
        case 'SOLANA_ADDRESS':
            return 'walletAddress';
        case 'NAME':
            return 'name';
        case 'REBELTAG':
            return 'address';
    }
}

const getUserLogo = (query: SearchDropDownProps['queryType']) => {
    switch (query) {
        case 'EMAIL':
            return constants.SVGS.email_contact;
        case 'SOLANA_ADDRESS':
            return constants.SVGS.wallet_contact;
        case 'NAME':
            return constants.SVGS.blank_user;;
        case 'REBELTAG':
            return constants.SVGS.rebel_contact;
    }
}

export default function SearchDropDown(props: SearchDropDownProps) {
    const { dataSource, queryType } = props
    const navigator = useRouter();
    let email = '', walletAddress = '', name = '', rebelfiContactAddress = '';

    const goToAdd = (isContact: boolean, user: any) => {
        if (queryType === 'EMAIL') {
            email = isContact ? user?.address : props.searchValue;
            walletAddress = '';
            name = user?.name;
        } else if (queryType === 'SOLANA_ADDRESS') {
            walletAddress = isContact ? user?.address : props.searchValue;
            email = user?.email;
            name = user?.name;
        } else if (queryType === 'NAME') {
            name = isContact ? user?.name : props.searchValue;
            walletAddress = '';
            email = user?.email;
        } else if (queryType === 'REBELTAG') {
            rebelfiContactAddress = user?.address ? user?.address : props.searchValue;
            name = user?.name;
        }
        
        navigator.push({
            pathname: '/view-contact',
            params: {
                email,
                walletAddress,
                name,
                rebelfiContact: JSON.stringify({ username: rebelfiContactAddress }),
                profileImage: user?.profileImage,
                contactID: user?.id,
                isNew: isContact ? 0 : 1
            }
        })
    }

    return (
        <ScrollView style={styles.container}>
            {dataSource.length > 0 && <View style={{
                paddingHorizontal: 16, borderLeftWidth: constants.SIZE.BORDER_WIDTH_SM,
                borderRightWidth: constants.SIZE.BORDER_WIDTH_SM, borderColor: constants.COLORS.BORDER_BRIGHT_DARK,
                backgroundColor: constants.COLORS.BACKGROUND_DARK
            }}>
                <Text style={{
                    fontFamily: constants.FONTS.Space_Grotesk, color: constants.COLORS.TEXT_MUTED,
                    fontSize: constants.SIZE.TEXT_MD2,
                    fontWeight: '500',
                    lineHeight: constants.LINE_HEIGHT.MD,
                    textTransform: 'uppercase',
                    fontStyle: 'normal'
                }}>Recent</Text>
            </View>}
            {
                dataSource.length > 0 ?
                    dataSource.map((user, index) => {
                        const userContactInfo = user[getKeyOfContact(queryType)];

                        let searchIdx = userContactInfo?.toLowerCase().indexOf(props.searchValue.toLowerCase());

                        return (
                            <Pressable key={index}
                                onPress={() => goToAdd(user.isContact, user)}>
                                <View style={[styles.subContainer, {
                                    borderColor: constants.COLORS.BORDER_BRIGHT_DARK,
                                    borderBottomLeftRadius: index === dataSource.length - 1 ? constants.SIZE.BORDER_RADIUS_MD : 0,
                                    borderBottomRightRadius: index === dataSource.length - 1 ? constants.SIZE.BORDER_RADIUS_MD : 0,
                                    borderBottomWidth: index === dataSource.length - 1 ? constants.SIZE.BORDER_WIDTH_SM : 0,
                                    borderLeftWidth: constants.SIZE.BORDER_WIDTH_SM,
                                    borderRightWidth: constants.SIZE.BORDER_WIDTH_SM,
                                }]}>
                                    <View style={{ position: 'relative', backgroundColor: constants.COLORS.BACKGROUND_BLACK, borderRadius: 32 }}>
                                        {user.profileImage ?
                                            <Image source={user.profileImage} style={queryType === 'NAME' ? styles.emailLogo : styles.userImage} /> :
                                            <SvgXml
                                                xml={getUserLogo(queryType)}
                                                width={queryType === 'EMAIL' ? 20 : 16}
                                                height={queryType === 'EMAIL' ? 20 : 16}
                                                style={{ margin: queryType === 'EMAIL' ? 6 : 8 }}
                                            />
                                        }
                                        {user.isContact && < SvgXml xml={constants.SVGS.badge_star} width={15} height={15} style={{ position: 'absolute', right: -5 }} />}
                                    </View>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        {
                                            (queryType !== 'SOLANA_ADDRESS' && searchIdx !== -1 && searchIdx !== undefined) ?
                                                [<Text key={1} numberOfLines={1} style={[styles.itemDefaultText, { marginLeft: 8 }]}>{userContactInfo?.slice(0, searchIdx)}</Text>,
                                                <Text key={2} numberOfLines={1} style={[styles.itemDefaultText, { color: constants.COLORS.TEXT_PRIMARY }]}>
                                                    {userContactInfo?.slice(searchIdx, (searchIdx + props.searchValue.length))}
                                                </Text>,
                                                <Text key={3} numberOfLines={1} style={styles.itemDefaultText}>{userContactInfo?.slice(searchIdx + props.searchValue.length)}</Text>
                                                ] : queryType === 'SOLANA_ADDRESS' ? [
                                                    <Text key={1} numberOfLines={1} style={[styles.itemDefaultText, { color: constants.COLORS.TEXT_PRIMARY, marginLeft: 8 }]}>{userContactInfo?.slice(0, 4)}</Text>,
                                                    <Text key={2} numberOfLines={1} style={[styles.itemDefaultText, { color: constants.COLORS.TEXT_PRIMARY }]}>...</Text>,
                                                    <Text key={3} numberOfLines={1} style={[styles.itemDefaultText, { color: constants.COLORS.TEXT_PRIMARY }]}>{userContactInfo?.slice(userContactInfo.length - 4)}</Text>
                                                ] :
                                                    <Text style={[styles.itemDefaultText, { marginLeft: 8 }]}>{userContactInfo}</Text>
                                        }
                                    </View>
                                </View>
                            </Pressable>
                        )
                    })

                    :
                    <View
                        style={[styles.noResultView, {
                            borderColor: constants.COLORS.BORDER_BRIGHT_DARK,
                            borderBottomLeftRadius: constants.SIZE.BORDER_RADIUS_MD,
                            borderBottomRightRadius: constants.SIZE.BORDER_RADIUS_MD,
                            borderBottomWidth: constants.SIZE.BORDER_WIDTH_SM,
                            borderLeftWidth: constants.SIZE.BORDER_WIDTH_SM,
                            borderRightWidth: constants.SIZE.BORDER_WIDTH_SM,
                        }]}>
                        <Text style={styles.noResultText}
                            onPress={() => goToAdd(false, null)}
                        >
                            Add to contacts
                        </Text>
                        <SvgXml
                            xml={constants.SVGS.plus}
                            width={24}
                            height={24}
                            style={{ marginLeft: 8 }}
                            onPress={() => goToAdd(false, null)}
                        />
                    </View>
            }

        </ScrollView>
    )
}


const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        flexDirection: 'column',
        zIndex: 1,
        height: 1000,
        borderWidth: 0
    },
    subContainer: {
        backgroundColor: constants.COLORS.BACKGROUND_DARK,
        paddingHorizontal: 16,
        paddingVertical: 8,
        flexWrap: 'wrap',
        alignItems: 'center',
        borderWidth: 0,
        flexDirection: 'row',
    },
    itemDefaultText: {
        color: constants.COLORS.TEXT_WHITE,
        fontFamily: constants.FONTS.Space_Grotesk,
        fontSize: constants.SIZE.TEXT_LG,
        fontStyle: 'normal',
        fontWeight: '500',
        lineHeight: constants.LINE_HEIGHT.MD,
        letterSpacing: -0.32
    },
    noResultView: {
        backgroundColor: constants.COLORS.BACKGROUND_DARK,
        alignSelf: 'center',
        height: 60,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        alignContent: 'center',
        flexDirection: 'row'
    },
    noResultText: {
        color: constants.COLORS.TEXT_WHITE,
        fontFamily: constants.FONTS.Space_Grotesk,
        fontSize: constants.SIZE.TEXT_LG,
        fontStyle: 'normal',
        fontWeight: '400',
        lineHeight: constants.LINE_HEIGHT.MD,
        letterSpacing: -0.32
    },
    userImage: {
        width: 32,
        height: 32,
        borderRadius: 48,
        borderWidth: 0
    },
    emailLogo: {
        width: 20,
        height: 20,
        margin: 6
    }
});