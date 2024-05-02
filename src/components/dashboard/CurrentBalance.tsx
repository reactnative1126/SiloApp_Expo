import React from 'react';
import { useRecoilValue } from 'recoil';
import { StyleSheet, View, Text } from 'react-native';
import { Button } from 'react-native-paper';

import constants from '../../utils/constants';
import { formattedCurrency } from '../../utils/functions';

import { userAtom } from '../../_recoil/user/user.state';

type CurrentBalanceProps = {
  isUSD: boolean | true;
  onWithdraw?: any | null;
  onDeposit?: any | null;
}

// Define the CurrentBalance component
export default function CurrentBalance(props: CurrentBalanceProps) {
  const userState = useRecoilValue(userAtom);
  return (
    <>
      <View>
        <Text style={styles.cardHeader}>
          CURRENT BALANCE
        </Text>
        <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
          <Text style={styles.balanceAmount}>
            {formattedCurrency(userState.balances.USDC.balance.toFixed(2), userState.earning.primaryCurrencyCode)}
          </Text>
          <Text style={styles.balanceUnit}>
            {userState.earning.primaryCurrencyCode}
          </Text>
        </View>
        {!props.isUSD && <Text style={styles.balanceTransformedAmount}>
          = {formattedCurrency(((userState.balances.USDC.balance || 0) * (userState.currency.usdExchangeRate || 1)).toFixed(2), userState.currency.code)}
          <Text style={styles.balanceTransformedUnit}>
            {` ${userState.currency.code}`}
          </Text>
        </Text>}
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 24 }}>
        <Button style={styles.withdrawBtn} onPress={props.onWithdraw}>
          <Text style={styles.withdrawBtnTxt}>
            Withdraw
          </Text>
        </Button>
        <Button style={styles.depositBtn} onPress={props.onDeposit}>
          <Text style={styles.depositBtnTxt}>
            Deposit
          </Text>
        </Button>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  cardHeader: {
    fontFamily: constants.FONTS.Space_Grotesk,
    color: constants.COLORS.TEXT_MUTED,
    fontSize: constants.SIZE.TEXT_MD2,
    fontStyle: 'normal',
    fontWeight: '500',
    lineHeight: constants.LINE_HEIGHT.MD, /* 171.429% */
    textTransform: 'uppercase'
  },
  balanceAmount: {
    color: constants.COLORS.TEXT_WHITE,
    fontFamily: constants.FONTS.Space_Grotesk,
    fontSize: 40,
    fontStyle: 'normal',
    fontWeight: '600',
    lineHeight: 48, /* 120% */
    letterSpacing: -0.8,
    marginTop: 8,
    marginBottom: 8,
  },
  balanceUnit: {
    color: constants.COLORS.TEXT_PRIMARY,
    fontFamily: constants.FONTS.Space_Grotesk,
    fontSize: constants.SIZE.TEXT_LG2,
    fontStyle: 'normal',
    fontWeight: '400',
    lineHeight: constants.LINE_HEIGHT.MD, /* 133.333% */
    letterSpacing: -0.36,
    verticalAlign: 'middle',
    alignItems: 'center',
    marginLeft: 8
  },
  balanceTransformedAmount: {
    color: constants.COLORS.TEXT_TRANSFORMED_BALANCE,
    fontFamily: constants.FONTS.Space_Grotesk,
    fontSize: constants.SIZE.TEXT_MD2,
    fontStyle: 'normal',
    fontWeight: '400',
    lineHeight: constants.LINE_HEIGHT.MD
  },
  balanceTransformedUnit: {
    color: constants.COLORS.TEXT_PRIMARY
  },
  withdrawBtn: {
    borderWidth: constants.SIZE.BORDER_WIDTH_SM,
    borderRadius: constants.SIZE.BORDER_RADIUS_MD,
    borderColor: constants.COLORS.TEXT_WHITE,
    width: '47%'
  },
  withdrawBtnTxt: {
    color: constants.COLORS.TEXT_WHITE,
    fontFamily: constants.FONTS.Syne_Bold,
    fontSize: 16,
    fontStyle: 'normal',
    lineHeight: constants.LINE_HEIGHT.MD,
    letterSpacing: -0.32,
  },
  depositBtn: {
    borderRadius: constants.SIZE.BORDER_RADIUS_MD,
    backgroundColor: constants.COLORS.BACKGROUND_PRIMARY,
    width: '47%'
  },
  depositBtnTxt: {
    color: constants.COLORS.TEXT_BLACK,
    fontFamily: constants.FONTS.Syne_Bold,
    fontSize: 16,
    fontStyle: 'normal',
    lineHeight: constants.LINE_HEIGHT.MD,
    letterSpacing: -0.32,
  },
});
