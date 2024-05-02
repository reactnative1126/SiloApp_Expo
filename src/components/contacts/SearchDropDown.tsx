import React from 'react';
import { StyleSheet, ScrollView, View, Text, Pressable, TouchableOpacity } from 'react-native';
import { SvgXml } from 'react-native-svg';

import Avatar from '../common/Avatar';

import constants from '../../utils/constants';

import { SearchQueryType, PayTarget } from '../../_recoil/transfers/transfers.types';

type SearchDropDownProps = {
  queryType: SearchQueryType,
  searchValue: string,
  dataSource: PayTarget[],
  onPress: () => void,
  navigation: any | null,
}

const getUserLogo = (query: SearchDropDownProps['queryType']) => {
  switch (query) {
    case SearchQueryType.EMAIL:
      return constants.SVGS.email_contact;
    case SearchQueryType.SOLANA_ADDRESS:
      return constants.SVGS.wallet_contact;
    case SearchQueryType.NAME:
      return constants.SVGS.blank_user;
    case SearchQueryType.REBELTAG:
      return constants.SVGS.rebel_contact;
    default:
      return constants.SVGS.blank_user;
  }
}

export default function SearchDropDown(props: SearchDropDownProps) {
  const { dataSource, queryType } = props;
  let email = '', walletAddress = '', name = '', rebelfiContactAddress = '';

  const goToAdd = (isContact: boolean, user: any) => {
    if (queryType === SearchQueryType.EMAIL) {
      name = user?.name ? user.name : '';
      email = user?.addressValue ? user.addressValue : props.searchValue;
    } else if (queryType === SearchQueryType.SOLANA_ADDRESS) {
      name = user?.name ? user.name : '';
      walletAddress = user?.addressValue ? user.addressValue : props.searchValue;
    } else if (queryType === SearchQueryType.NAME) {
      name = user?.name ? user.name : props.searchValue;
    } else if (queryType === SearchQueryType.REBELTAG) {
      name = user?.name ? user.name : '';
      rebelfiContactAddress = user?.addressValue ? user.addressValue : props.searchValue;
    }

    props.navigation.push('ContactView', {
      isNew: isContact ? 0 : 1,
      contactID: user?.id,
      name,
      email,
      walletAddress,
      rebelfiContact: JSON.stringify({ username: rebelfiContactAddress }),
      profileImage: user?.profileImage,

      targetType: user?.targetType,
      targetId: user?.targetId,
      queryType
    })
  }

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
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
            const userContactInfo = user.addressValue;

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
                      <Avatar
                        name={user.name}
                        image={user.profileImage}
                        width={32}
                        height={32}
                        radius={16}
                        size={10}
                      /> :
                      <SvgXml
                        xml={getUserLogo(queryType)}
                        width={queryType === SearchQueryType.EMAIL ? 20 : 16}
                        height={queryType === SearchQueryType.EMAIL ? 20 : 16}
                        style={{ margin: queryType === SearchQueryType.EMAIL ? 6 : 8 }}
                      />
                    }
                    {user.isContact && < SvgXml xml={constants.SVGS.badge_star} width={15} height={15} style={{ position: 'absolute', right: -5 }} />}
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    {
                      (queryType !== SearchQueryType.SOLANA_ADDRESS && searchIdx !== -1 && searchIdx !== undefined) ?
                        [<Text key={1} numberOfLines={1} style={[styles.itemDefaultText, { marginLeft: 8 }]}>{userContactInfo?.slice(0, searchIdx)}</Text>,
                        <Text key={2} numberOfLines={1} style={[styles.itemDefaultText, { color: constants.COLORS.TEXT_PRIMARY }]}>
                          {userContactInfo?.slice(searchIdx, (searchIdx + props.searchValue.length))}
                        </Text>,
                        <Text key={3} numberOfLines={1} style={styles.itemDefaultText}>{userContactInfo?.slice(searchIdx + props.searchValue.length)}</Text>
                        ] : queryType === SearchQueryType.SOLANA_ADDRESS ? [
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
          <TouchableOpacity
            style={[styles.noResultView, {
              borderColor: constants.COLORS.BORDER_BRIGHT_DARK,
              borderBottomLeftRadius: constants.SIZE.BORDER_RADIUS_MD,
              borderBottomRightRadius: constants.SIZE.BORDER_RADIUS_MD,
              borderBottomWidth: constants.SIZE.BORDER_WIDTH_SM,
              borderLeftWidth: constants.SIZE.BORDER_WIDTH_SM,
              borderRightWidth: constants.SIZE.BORDER_WIDTH_SM,
            }]}
            onPress={() => goToAdd(false, null)}
            activeOpacity={1}
          >
            <Text style={styles.noResultText}>
              Add to contacts
            </Text>
            <SvgXml
              xml={constants.SVGS.plus}
              width={24}
              height={24}
              style={{ marginLeft: 8 }}
            />
          </TouchableOpacity>
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
    borderWidth: 0,
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