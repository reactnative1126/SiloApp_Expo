import React, { useState } from 'react';
import { useRecoilValue } from 'recoil';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { Button } from 'react-native-paper';
import QRCode from 'react-native-qrcode-svg';

import Container from '../../components/common/Container';
import Header from '../../components/deposit/Header';
import ClipboardInput from '../../components/common/ClipboardInput';

import constants from '../../utils/constants';

import { userAtom } from '../../_recoil/user/user.state';

export default function Deposit(props: any) {
  const userState = useRecoilValue(userAtom);
  const [page, setPage] = useState(1);
  const [index, setIndex] = useState(1);

  const buttons = [
    {
      index: 1,
      name: 'Solana',
      disabled: false,
      hidden: false,
    },
    {
      index: 2,
      name: 'Bank Account',
      disabled: true,
      hidden: false,
    },
    {
      index: 3,
      name: 'Credit Card',
      disabled: true,
      hidden: false,
    },
  ]
  const ItemButton = (props: any) => {
    const { item, onPress } = props;
    if (!item.hidden) {
      return (
        <TouchableOpacity
          style={[styles.buttonWrapper, {
            borderColor: item.disabled ? constants.COLORS.BACKGROUND_DISABLED_BOX : item.index === index ? constants.COLORS.BORDER_PRIMARY : constants.COLORS.BORDER_BRIGHT_DARK,
            backgroundColor: item.disabled ? constants.COLORS.BACKGROUND_DISABLED_BOX : constants.COLORS.BACKGROUND_LIGHT_DARK
          }]}
          onPress={onPress}
          disabled={item.disabled}
          activeOpacity={0.8}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <SvgXml
              xml={item.index === index ? constants.SVGS.filter_active : constants.SVGS.filter_inactive}
              width={24}
              height={24}
              opacity={item.disabled ? 0.3 : 1}
            />
            <Text style={[styles.name, {
              opacity: item.disabled ? 0.3 : 1
            }]}>{item.name}</Text>
          </View>
          {item.disabled && <View style={styles.coming}>
            <Text style={styles.soon}>Coming Soon</Text>
          </View>}
        </TouchableOpacity>
      )
    }
  }

  const FirstPage = () => {
    return (
      <View style={styles.content}>
        <Header
          back
          title='Deposit'
          onBack={() => props.navigation.pop()}
        />
        <ScrollView
          style={[styles.content, { paddingHorizontal: constants.SPACING.MD }]}
          contentContainerStyle={{ alignItems: 'center', paddingTop: 50, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        >
          <SvgXml
            xml={constants.SVGS.deposit}
            width={64}
            height={64}
          />
          <Text style={styles.label}>
            DEPOSIT FROM:
          </Text>
          {buttons.map((item, idx) => (
            <ItemButton
              key={idx}
              item={item}
              onPress={() => setIndex(idx + 1)}
            />
          ))}
        </ScrollView>

        <View style={styles.bottom}>
          <Button style={styles.continue} onPress={() => setPage(2)}>
            <Text style={{ color: constants.COLORS.TEXT_BLACK, fontFamily: constants.FONTS.Syne_Regular, fontWeight: '700' }}>
              Continue
            </Text>
          </Button>
          <Text style={constants.G_STYLE.BTN_DESCRIPTION}>{' '}</Text>
        </View>
      </View>
    )
  }

  const SecondPage = () => {
    return (
      <View style={styles.content}>
        <Header
          back
          close
          title='Deposit'
          onBack={() => setPage(1)}
          onClose={() => props.navigation.pop()}
        />
        <ScrollView
          style={[styles.content, { paddingHorizontal: constants.SPACING.MD }]}
          contentContainerStyle={{ alignItems: 'center', paddingTop: 50, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.from}>
            <SvgXml
              xml={constants.SVGS.deposit}
              width={48}
              height={48}
            />
            <View style={{ marginLeft: constants.SPACING.SM }}>
              <Text style={styles.account}>From Solana Account</Text>
              <Text style={styles.detail}>Send SOL or USDC on the Solana blockchain</Text>
            </View>
          </View>
          <View style={styles.qrcode}>
            <QRCode
              size={135}
              value={userState.username}
            />
          </View>
          <Text style={styles.label2}>Network: <Text style={styles.label3}>Solana</Text></Text>
          <View style={{ width: '100%' }}>
            <ClipboardInput type='walletAddress' label='Deposit Solana address' textValue={userState.walletAddress} />
          </View>
          <Text style={styles.bottomText}>Any funds sent to this address will automatically be deposited into your main savings account. If SOL is sent, it will first be converted to USDC.</Text>
        </ScrollView>
      </View>
    )
  }

  return (
    <Container>
      {page === 1 ? (
        <FirstPage />
      ) : (
        <SecondPage />
      )}
    </Container>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  label: {
    width: '100%',
    marginVertical: constants.SPACING.SM,
    fontFamily: constants.FONTS.Space_Grotesk,
    color: constants.COLORS.TEXT_MUTED,
    fontSize: constants.SIZE.TEXT_MD2,
    fontWeight: '500',
    lineHeight: constants.LINE_HEIGHT.MD, /* 171.429% */
    textTransform: 'uppercase'
  },
  buttonWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: constants.SPACING.SM,
    width: '100%',
    padding: constants.SPACING.MD,
    borderWidth: constants.SIZE.BORDER_WIDTH_SM,
    borderRadius: constants.SIZE.BORDER_RADIUS_MD
  },
  name: {
    marginLeft: constants.SPACING.MD,
    fontFamily: constants.FONTS.Space_Grotesk,
    fontSize: constants.SIZE.TEXT_LG2,
    fontWeight: '500',
    color: constants.COLORS.TEXT_WHITE
  },
  coming: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: constants.COLORS.BACKGROUND_COMING_SOON,
    borderRadius: constants.SIZE.BORDER_RADIUS_MD
  },
  soon: {
    fontFamily: constants.FONTS.Space_Grotesk,
    fontSize: constants.SIZE.TEXT_MD,
    color: constants.COLORS.TEXT_PRIMARY
  },
  bottom: {
    position: 'absolute',
    bottom: 0,
    width: '100%'
  },
  continue: {
    backgroundColor: constants.COLORS.BACKGROUND_WHITE,
    marginHorizontal: '5%',
    borderRadius: constants.SIZE.BORDER_RADIUS_MD,
    marginBottom: 15,
  },
  from: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: '10%'
  },
  account: {
    fontFamily: constants.FONTS.Space_Grotesk,
    fontSize: constants.SIZE.TEXT_LG2,
    fontWeight: '500',
    color: constants.COLORS.TEXT_WHITE
  },
  detail: {
    fontFamily: constants.FONTS.Space_Grotesk,
    fontSize: constants.SIZE.TEXT_MD2,
    fontWeight: '500',
    color: constants.COLORS.TEXT_LOCAL_CURRENCY
  },
  qrcode: {
    marginVertical: constants.SPACING.XL,
    padding: constants.SPACING.XL,
    borderTopWidth: constants.SIZE.BORDER_WIDTH_SM,
    borderBottomWidth: constants.SIZE.BORDER_WIDTH_SM,
    borderColor: constants.COLORS.BORDER_BRIGHT_DARK
  },
  label2: {
    width: '100%',
    marginVertical: constants.SPACING.SM,
    fontFamily: constants.FONTS.Space_Grotesk,
    color: constants.COLORS.TEXT_WHITE,
    fontSize: constants.SIZE.TEXT_LG,
    fontWeight: '400',
    lineHeight: constants.LINE_HEIGHT.MD
  },
  label3: {
    fontFamily: constants.FONTS.Space_Grotesk,
    color: constants.COLORS.TEXT_PRIMARY,
    fontSize: constants.SIZE.TEXT_LG,
    fontWeight: '500',
    lineHeight: constants.LINE_HEIGHT.MD
  },
  bottomText: {
    marginTop: constants.SPACING.XL,
    fontFamily: constants.FONTS.Space_Grotesk,
    fontSize: constants.SIZE.TEXT_LG,
    fontWeight: '500',
    color: constants.COLORS.TEXT_WHITE,
    textAlign: 'center'
  }
});
