import * as React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import constants from '../../constants';
import { SvgXml } from 'react-native-svg';
import { formatNumber } from '../../_util/misc';

type TransactionProps = {
    in?: boolean,
    type?: string,
    address?: string,
    usdAmount?: number,
    txType?: string,
    created?: string,
    counterpartyName?: string,
    counterpartyImage?: string,
    convertRate?: number,
    localCurrencyCode?: string,
    primaryCurrencyCode?: string
}

export default function Transaction(props: TransactionProps) {
    return (
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <SvgXml
                    xml={props.txType === 'FUNDING' ? constants.SVGS.tx_out : constants.SVGS.tx_in}
                    width={32}
                    height={32}
                />
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
            <View style={{ flexDirection: 'column', alignItems: 'center' }}>
                <Text style={styles.usdAmount}>
                    {props.txType === 'FUNDING' ? '-' : ''}${formatNumber(props.usdAmount || 20)} USD
                </Text>
                {(props.localCurrencyCode !== props.primaryCurrencyCode) &&
                    <Text style={styles.localCurrencyAmount}>
                        {props.txType === 'FUNDING' ? '-' : ''}${formatNumber(props.usdAmount && props.usdAmount * 4049 || 8346284)}{' '}{props.localCurrencyCode}                       
                    </Text>}
            </View>
        </View>
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
    }
});
