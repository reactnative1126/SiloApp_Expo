import React, { useState } from 'react';
import { Text, TextInput, View, StyleSheet, StatusBar, SafeAreaView } from 'react-native';
import { SvgXml } from 'react-native-svg';
import SearchDropDown from '../../components/contacts/SearchDropDown';
import constants from '../../constants';
import Contact from '../../components/contacts/Contact';
import { useRouter } from 'expo-router';
import { useUserActions } from '../../_recoil/user/user.actions';
import { useIsFocused } from '@react-navigation/native';
import { contactAtom } from '../../_recoil/user/user.state';
import { useRecoilValue } from 'recoil';

type UserInfoType = {
    id: number,
    name: string,
    username: string,
    email: string | null,
    walletAddress: string | null,
    rebelfiContact: any,
    profileImage: string,
    isContact: boolean
}

interface getContact {
    contacts: UserInfoType[]
}

type Timer = ReturnType<typeof setTimeout>;
type SomeFunction = (...args: any[]) => void;
/**
 *
 * @param func The original, non debounced function (You can pass any number of args to it)
 * @param delay The delay (in ms) for the function to return
 * @returns The debounced function, which will run only if the debounced function has not been called in the last (delay) ms
 */

function useDebounce<Func extends SomeFunction>(
    func: Func,
    delay = 1000
) {
    const [timer, setTimer] = useState<Timer>();

    const debouncedFunction = ((...args) => {
        const newTimer = setTimeout(() => {
            func(...args);
        }, delay);
        clearTimeout(timer);
        setTimer(newTimer);
    }) as Func;

    return debouncedFunction;
}


export default function Contacts() {
    const isFocused = useIsFocused();
    const [searchInputVal, setSearchInputVal] = useState<string>('');
    const [searchVal, setSearchVal] = useState<string>('');
    const [queryType, setQueryType] = useState<'EMAIL' | 'SOLANA_ADDRESS' | 'NAME' | 'REBELTAG'>('EMAIL');
    const [filtered, setFiltered] = useState<UserInfoType[]>([]);
    const [searching, setSearching] = useState<boolean>(false);
    const navigation = useRouter();
    const { getContacts, searchContacts } = useUserActions();

    const contactState = useRecoilValue(contactAtom);

    const onSearch = async (text: string) => {
        if (text) {
            const res = await searchContacts(text);

            setQueryType(res.queryType);
            setFiltered(res.payTargets);
            setSearchVal(text);
        }
        else {
            setSearching(false)
            setFiltered([])
            setSearchVal(text);
        }
    }

    const onChangeDebounced = useDebounce(onSearch);

    const onTextChange = (text: any) => {
        setSearchInputVal(text);

        text && setSearching(true);
        !text && setSearching(false);

        onChangeDebounced(text);
    }

    const setContacts = async () => {
        const contacts = await getContacts() as getContact;
    }

    React.useEffect(() => {
        isFocused && setContacts();
        setSearchInputVal('');
        setSearchVal('');
        setSearching(false);
    }, [isFocused]);

    return (
        <SafeAreaView style={constants.G_STYLE.ROOT_VIEW}>
            <StatusBar backgroundColor="transparent" barStyle="light-content" />
            <View style={constants.G_STYLE.CONTENT_VIEW}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 30 }}>
                    <Text style={[constants.G_STYLE.LOGO_TEXT, { paddingLeft: 0, fontSize: constants.SIZE.TEXT_XL, lineHeight: constants.LINE_HEIGHT.MD2, letterSpacing: -0.48 }]}>
                        Contacts
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <SvgXml
                            xml={constants.SVGS.plus}
                            width={24}
                            height={24}
                            style={{ marginRight: 16 }}
                            onPress={() => navigation.push('/create-contact')}
                        />
                        <SvgXml
                            xml={constants.SVGS.qrcode}
                            width={24}
                            height={24}
                        />
                    </View>
                </View>

                <View>
                    <View style={[styles.container, {
                        borderBottomWidth: searching ? 0 : constants.SIZE.BORDER_WIDTH_SM,
                        borderBottomRightRadius: searching ? 0 : constants.SIZE.BORDER_RADIUS_MD,
                        borderBottomLeftRadius: searching ? 0 : constants.SIZE.BORDER_RADIUS_MD
                    }]}>
                        <SvgXml
                            xml={constants.SVGS.search}
                            width={24}
                            height={24}
                        />
                        <TextInput
                            value={searchInputVal}
                            style={styles.input}
                            placeholder='Search...'
                            placeholderTextColor={constants.COLORS.TEXT_MUTED}
                            onChangeText={onTextChange}
                        />
                    </View>

                    <View style={{ justifyContent: 'center', alignContent: 'center', alignItems: 'center' }}>
                        {
                            searching &&
                            <SearchDropDown
                                queryType={queryType}
                                searchValue={searchVal}
                                onPress={() => setSearching(false)}
                                dataSource={filtered} />
                        }
                    </View>

                    <View style={{ marginTop: 22 }}>
                        <Text style={styles.contactGroupLabel}>Favourites</Text>
                        <View style={{ marginTop: 8 }}>
                            {
                                contactState && contactState.length > 0 && contactState.map((userInfo: any, idx: number) => {
                                    return (
                                        <View key={idx}>
                                            <Contact
                                                isContact={userInfo.isContact}
                                                contactID={userInfo.id}
                                                name={userInfo.name}
                                                profileImage={userInfo.rebelfiContact?.profileImage || userInfo.profileImage}
                                                email={userInfo.email || ''}
                                                walletAddress={userInfo.walletAddress || ''}
                                                rebelfiContact={userInfo.rebelfiContact}
                                            />
                                            <View
                                                style={{
                                                    borderBottomColor: constants.COLORS.BORDER_BRIGHT_DARK,
                                                    borderBottomWidth: StyleSheet.hairlineWidth,
                                                    marginTop: 8,
                                                    marginBottom: 8
                                                }}
                                            />
                                        </View>
                                    )
                                })
                            }

                        </View>
                    </View>
                </View>
            </View>
        </SafeAreaView >
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: constants.COLORS.BACKGROUND_LIGHT_DARK,
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderWidth: constants.SIZE.BORDER_WIDTH_SM,
        borderRadius: constants.SIZE.BORDER_RADIUS_MD,
        borderColor: constants.COLORS.BORDER_BRIGHT_DARK,
        marginTop: 15,
    },
    input: {
        color: constants.COLORS.TEXT_WHITE,
        fontSize: constants.SIZE.TEXT_LG,
        width: '73%',
        alignSelf: 'center',
        fontFamily: constants.FONTS.Space_Grotesk,
        fontStyle: 'normal',
        fontWeight: '400',
        lineHeight: constants.LINE_HEIGHT.MD,
        letterSpacing: -0.32,
        paddingLeft: 16
    },
    icon: {
        marginRight: 12,
        width: '10%',
        alignSelf: 'flex-start',
    },
    // Contacts View
    contactGroupLabel: {
        color: constants.COLORS.TEXT_WHITE,
        fontFamily: constants.FONTS.Space_Grotesk,
        fontSize: constants.SIZE.TEXT_MD2,
        fontStyle: 'normal',
        fontWeight: '500',
        lineHeight: constants.LINE_HEIGHT.MD
    }
});
