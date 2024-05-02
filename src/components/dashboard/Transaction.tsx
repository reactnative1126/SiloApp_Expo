import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import moment from 'moment';

import constants from '../../utils/constants';
import { formattedCurrency } from '../../utils/functions';

import { TransactionType } from '../../_recoil/user/user.types';

type TransactionProps = {
  in?: boolean,
  type?: string,
  txType?: TransactionType,
  created?: string,
  address?: string,
  counterpartyName?: string,
  counterpartyImage?: string,
  cryptoAmount?: number,
  cryptoSymbol?: string,
  fiatAmount?: number,
  fiatSymbol?: string,
  convertRate?: number,
  localCurrencyCode?: string,
  primaryCurrencyCode?: string,
}

export default function TransactionItem(props: TransactionProps) {
  return (
    <>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <SvgXml
            xml={props.txType === TransactionType.DEBIT ? constants.SVGS.tx_out : constants.SVGS.tx_in}
            width={32}
            height={32}
          />
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <SvgXml
                xml={props.counterpartyImage ? constants.SVGS.user_tx : constants.SVGS.rebel_tx}
                width={20}
                height={20}
                style={{ marginHorizontal: 8 }}
              />
              <Text style={styles.address}>
                {props.counterpartyName || 'r3cX...Kfow'}
              </Text>
            </View>
            <Text style={styles.date}>
              {moment(props.created).format('MMMM D, h:mmA')}
            </Text>
          </View>
        </View>
        <View style={{ flexDirection: 'column', alignItems: 'center' }}>
          <Text style={styles.usdAmount}>
            {props.txType === TransactionType.DEBIT ? '-' : ''} {formattedCurrency((props.cryptoAmount || 20).toFixed(2), props.primaryCurrencyCode)} {` ${props.primaryCurrencyCode}`}
          </Text >
          {(props.localCurrencyCode !== props.primaryCurrencyCode) &&
            <Text style={styles.localCurrencyAmount}>
              {props.txType === TransactionType.DEBIT ? '-' : ''}{formattedCurrency((props.fiatAmount || 8346284).toFixed(2), props.localCurrencyCode)}{` ${props.fiatSymbol}`}
            </Text>
          }
        </View >
      </View >
      <View style={styles.line} />
    </>
  );
}

const styles = StyleSheet.create({
  address: {
    color: constants.COLORS.TEXT_WHITE,
    fontFamily: constants.FONTS.Space_Grotesk,
    fontSize: constants.SIZE.TEXT_LG,
    fontStyle: 'normal',
    fontWeight: '500',
    lineHeight: constants.LINE_HEIGHT.MD,
    letterSpacing: -0.32
  },
  usdAmount: {
    color: constants.COLORS.TEXT_WHITE,
    fontFamily: constants.FONTS.Space_Grotesk,
    fontSize: constants.SIZE.TEXT_LG2,
    fontStyle: 'normal',
    fontWeight: '500',
    lineHeight: constants.LINE_HEIGHT.MD,
    letterSpacing: -0.36
  },
  localCurrencyAmount: {
    color: constants.COLORS.TEXT_LOCAL_CURRENCY,
    fontFamily: constants.FONTS.Space_Grotesk,
    fontSize: constants.SIZE.TEXT_MD,
    fontStyle: 'normal',
    fontWeight: '500',
    lineHeight: constants.LINE_HEIGHT.MD
  },
  line: {
    borderBottomColor: constants.COLORS.BORDER_BRIGHT_DARK,
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginTop: 8,
    marginBottom: 8
  },
  date: {
    marginLeft: constants.SPACING.SM,
    color: constants.COLORS.TEXT_LOCAL_CURRENCY,
    fontFamily: constants.FONTS.Space_Grotesk,
    fontSize: constants.SIZE.TEXT_MD2,
    fontStyle: 'normal',
    fontWeight: '500',
    lineHeight: constants.LINE_HEIGHT.MD,
    letterSpacing: -0.32
  }
});
