import React from 'react';
import { useRecoilValue } from 'recoil';
import { StyleSheet, View, Text } from 'react-native';
import { Button } from 'react-native-paper';

import TransactionItem from './Transaction';

import constants from '../../utils/constants';

import { userAtom, transactionsAtom } from '../../_recoil/user/user.state';

type LatestTransactionsProps = {
  onSeeAll?: any
}

// Define the LatestTransactions component
export default function LatestTransactions(props: LatestTransactionsProps) {
  const userState = useRecoilValue(userAtom);
  const txState = useRecoilValue(transactionsAtom);

  return (
    <>
      <View style={styles.container}>
        <Text style={styles.cardHeader}>
          LATEST TRANSACTIONS
        </Text>
        <Button style={styles.seeAllBtn}>
          <Text style={styles.seeAllBtnTxt}>
            See All
          </Text>
        </Button>
      </View>
      <View style={{ marginTop: 24 }}>
        {(txState?.transactions && txState.transactions.length) ? txState.transactions.map((tx, idx) => (
          <TransactionItem
            key={idx}
            txType={tx.txType}
            created={tx.createdAt}
            counterpartyName={tx.counterpartyName}
            counterpartyImage={tx.counterpartyImage}
            cryptoAmount={tx.cryptoAmount}
            cryptoSymbol={tx.cryptoSymbol}
            fiatAmount={tx.fiatAmount}
            fiatSymbol={tx.fiatSymbol}

            convertRate={userState.currency.usdExchangeRate}
            primaryCurrencyCode={userState.earning.primaryCurrencyCode}
            localCurrencyCode={userState.currency.code} />
        )) : (<View />)
        }
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  cardHeader: {
    fontFamily: constants.FONTS.Space_Grotesk,
    color: constants.COLORS.TEXT_MUTED,
    fontSize: constants.SIZE.TEXT_MD2,
    fontStyle: 'normal',
    fontWeight: '500',
    lineHeight: constants.LINE_HEIGHT.MD, /* 171.429% */
    textTransform: 'uppercase'
  },
  seeAllBtn: {
    borderWidth: constants.SIZE.BORDER_WIDTH_SM,
    borderRadius: constants.SIZE.BORDER_RADIUS_MD,
    borderColor: constants.COLORS.BORDER_BUTTON_WHITE,
    paddingVertical: 0,
    paddingHorizontal: constants.SPACING.SM
  },
  seeAllBtnTxt: {
    color: constants.COLORS.TEXT_WHITE,
    fontFamily: constants.FONTS.Syne_Bold,
    fontSize: constants.SIZE.TEXT_MD2,
    fontStyle: 'normal',
    letterSpacing: -0.28,
  },
});
