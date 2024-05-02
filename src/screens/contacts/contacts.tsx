import React, { useState } from 'react';
import useAsyncEffect from 'use-async-effect';
import { useRecoilValue } from 'recoil';
import { useIsFocused } from '@react-navigation/native';
import { Text, TextInput, View, StyleSheet, ScrollView } from 'react-native';
import Toast from 'react-native-toast-message';
import { SvgXml } from 'react-native-svg';

import Container from '../../components/common/Container';
import Header from '../../components/contacts/Header';
import Contact from '../../components/contacts/Contact';
import SearchDropDown from '../../components/contacts/SearchDropDown';

import constants from '../../utils/constants';
import { log } from '../../utils/functions';

import { useUserActions } from '../../_recoil/user/user.actions';
import { contactAtom } from '../../_recoil/user/user.state';
import { PayTargetType, SearchQueryType, PayTarget } from '../../_recoil/transfers/transfers.types';

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

export default function Contacts(props: any) {
  const userActions = useUserActions();
  const contactState = useRecoilValue(contactAtom);

  const isFocused = useIsFocused();
  const [searchInputVal, setSearchInputVal] = useState<string>('');
  const [searchVal, setSearchVal] = useState<string>('');
  const [queryType, setQueryType] = useState<SearchQueryType>(SearchQueryType.EMAIL);
  const [filtered, setFiltered] = useState<PayTarget[]>([]);
  const [searching, setSearching] = useState<boolean>(false);

  useAsyncEffect(async () => {
    isFocused && await userActions.getContacts('There was a problem getting user contacts.');
    setSearchInputVal('');
    setSearchVal('');
    setSearching(false);
  }, [isFocused]);

  const onSearch = async (text: string) => {
    if (text) {
      try {
        const res = await userActions.searchContacts(text, 'There was a problem searching.');

        if (res.success) {
          const { queryType, payTargets } = res.data;
          setQueryType(queryType);
          setFiltered(payTargets);
          setSearchVal(text);
        } else {
          Toast.show({ type: 'error', text1: 'Search Error', text2: res.message });
        }
        hideModal();
      } catch (error: any) {
        log(error);
      }
    }
    else {
      setSearching(false);
      setFiltered([]);
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

  return (
    <Container>
      <Header
        title='Transfers'
        add
        qrcode
        onQRCode={() => props.navigation.push('ContactQRCode')}
        onAdd={() => props.navigation.push('ContactCreate')}
      />
      <View style={[styles.search, {
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
          value={searchInputVal.toLowerCase()}
          style={styles.input}
          placeholder='Search...'
          autoCapitalize='none'
          placeholderTextColor={constants.COLORS.TEXT_MUTED}
          onChangeText={onTextChange}
        />
      </View>
      <ScrollView
        style={[styles.content, { paddingHorizontal: constants.SPACING.MD }]}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ justifyContent: 'center', alignContent: 'center', alignItems: 'center', zIndex: 100 }}>
          {
            searching &&
            <SearchDropDown
              queryType={queryType}
              searchValue={searchVal}
              onPress={() => setSearching(false)}
              dataSource={filtered}
              navigation={props.navigation}
            />
          }
        </View>

        <View style={{ marginTop: constants.SPACING.SM }}>
          <Text style={styles.contactGroupLabel}>Favourites</Text>
          <View style={{ marginTop: 8 }}>
            {
              contactState && contactState.length > 0 && contactState.map((userInfo: any, idx: number) => {
                const userInformation = {
                  isNew: 0,
                  contactID: userInfo.id,
                  name: (userInfo.rebelfiContact?.name || userInfo.name),
                  email: (userInfo.rebelfiContact?.email || userInfo.email),
                  walletAddress: (userInfo.rebelfiContact?.walletAddress || userInfo.walletAddress),
                  rebelfiContact: userInfo.rebelfiContact !== null ? JSON.stringify(userInfo.rebelfiContact) : JSON.stringify({}),
                  profileImage: (userInfo.rebelfiContact?.profileImage || userInfo.profileImage),

                  targetType: PayTargetType.CONTACT,
                  targetId: userInfo.rebelfiContact?.id,
                  queryType
                };
                return (
                  <View key={idx}>
                    <Contact
                      name={userInfo.rebelfiContact?.name || userInfo.name}
                      email={userInfo.rebelfiContact?.email || userInfo.email}
                      rebelfiContact={userInfo.rebelfiContact}
                      walletAddress={userInfo.rebelfiContact?.walletAddress || userInfo.rebelfiContact}
                      profileImage={userInfo.rebelfiContact?.profileImage || userInfo.profileImage}
                      viewContact={() => props.navigation.push('ContactView', userInformation)}
                      onPay={() => props.navigation.push('SendFunds', { userInfo: userInformation })}
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
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    zIndex: 99
  },
  search: {
    flexDirection: 'row',
    marginHorizontal: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: constants.SIZE.BORDER_WIDTH_SM,
    borderRadius: constants.SIZE.BORDER_RADIUS_MD,
    borderColor: constants.COLORS.BORDER_BRIGHT_DARK,
    backgroundColor: constants.COLORS.BACKGROUND_LIGHT_DARK,
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

function hideModal() {
  throw new Error('Function not implemented.');
}
