import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Switch } from 'react-native-switch';
import { SvgXml } from 'react-native-svg';

import constants from '../../utils/constants';
import { formatNumber, formattedCurrency } from '../../utils/functions';

type InterestRateProps = {
  isUSD: boolean | true;
  toggleVal: any | 0;
  setToggleVal: any | null;
  localCurrencyCode: any | null;
  perYear: any | null;
  perYearUnit: any | null;
  savingsRate: any | null
  current: any | null;
  currentUnit: any | null;
  earningRate: any | null;
}

// Define the InterestRate component
export default function InterestRate(props: InterestRateProps) {
  return (
    <>
      <View style={styles.container}>
        <Text style={styles.cardHeader}>
          EARNING
        </Text>
        {!props.isUSD && <Switch
          containerStyle={{ borderWidth: constants.SIZE.BORDER_WIDTH_SM, borderColor: constants.COLORS.BORDER_PRIMARY }}
          value={props.toggleVal}
          onValueChange={props.setToggleVal}
          disabled={false}
          activeText={props.localCurrencyCode}
          inActiveText={'USD'}
          circleSize={18}
          barHeight={24}
          circleBorderWidth={0}
          backgroundActive={constants.COLORS.BACKGROUND_LIGHT_DARK}
          backgroundInactive={constants.COLORS.BACKGROUND_LIGHT_DARK}
          circleActiveColor={constants.COLORS.BACKGROUND_PRIMARY}
          circleInActiveColor={constants.COLORS.BACKGROUND_PRIMARY}
          changeValueImmediately={true}
          renderActiveText={props.toggleVal}
          renderInActiveText={!props.toggleVal}
          switchLeftPx={12}
          switchRightPx={4}
          switchWidthMultiplier={3.5}
        />}
      </View>
      <View style={{ marginTop: constants.SPACING.MD }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={styles.earningSubheader}>
            Earning per year
          </Text>
          <Text style={styles.earningSubheader}>
            The interest rate
          </Text>
        </View>
        <View>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.earningAmount}>
                {formattedCurrency(props.perYear.toFixed(3), props.perYearUnit)}
              </Text>
              <Text style={styles.earningAmountUnit}>
                {props.perYearUnit}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.earningRateAmount}>
                {formatNumber(props.savingsRate)}%
              </Text>
              <SvgXml
                xml={constants.SVGS.info}
                width={16}
                height={16}
                style={{ marginLeft: 8 }}
              />
            </View>
          </View>
        </View>
        <View
          style={{
            borderBottomColor: constants.COLORS.BORDER_BRIGHT_DARK,
            borderBottomWidth: StyleSheet.hairlineWidth,
            marginTop: 16,
            marginBottom: 16
          }}
        />
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={styles.earningSubheader}>
            Current Earnings
          </Text>
          <Text style={styles.earningSubheader}>
            Start date
          </Text>
        </View>
        <View>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.earningAmount}>
                {formattedCurrency(props.current.toFixed(2), props.currentUnit)}
              </Text>
              <Text style={styles.earningAmountUnit}>
                {props.currentUnit}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.earningRateAmount}>
                {props.earningRate}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
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
  earningSubheader: {
    color: constants.COLORS.TEXT_WHITE,
    fontFamily: constants.FONTS.Space_Grotesk,
    fontSize: constants.SIZE.TEXT_MD,
    fontStyle: 'normal',
    fontWeight: '500',
    lineHeight: constants.LINE_HEIGHT.MD
  },
  earningAmount: {
    color: constants.COLORS.TEXT_WHITE,
    fontFamily: constants.FONTS.Space_Grotesk,
    fontSize: constants.SIZE.TEXT_XL,
    fontStyle: 'normal',
    fontWeight: '600',
    lineHeight: 32,
    letterSpacing: -0.48
  },
  earningAmountUnit: {
    color: constants.COLORS.TEXT_PRIMARY,
    fontFamily: constants.FONTS.Space_Grotesk,
    fontSize: constants.SIZE.TEXT_LG2,
    fontStyle: 'normal',
    fontWeight: '400',
    lineHeight: constants.LINE_HEIGHT.MD,
    letterSpacing: -0.36,
    marginLeft: 8
  },
  earningRateAmount: {
    color: constants.COLORS.TEXT_WHITE,
    fontFamily: constants.FONTS.Space_Grotesk,
    fontSize: 16,
    fontStyle: 'normal',
    fontWeight: '500',
    lineHeight: constants.LINE_HEIGHT.MD,
    letterSpacing: -0.32
  },
});
