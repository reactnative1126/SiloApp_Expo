import * as React from 'react';
import { Text, View, StyleSheet, StatusBar, ScrollView } from 'react-native';
import constants from '../../constants';
import { Button } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { SvgXml } from 'react-native-svg';
import { Switch } from 'react-native-switch';
import Transaction from '../../components/dashboard/Transaction';
import { authAtom } from '../../_recoil/auth/auth.state';
import { userAtom, transactionsAtom } from '../../_recoil/user/user.state';
import { UserState } from '../../_recoil/user/user.types';
import { useRecoilValue } from 'recoil';
import { useUserActions } from '../../_recoil/user/user.actions';
import { Image } from 'expo-image';
import { defaultLanguageTag } from '../../translations';
import { formatNumber } from '../../_util/misc';

export default function Dashboard() {
    const { getTransactions } = useUserActions();
    const navigation = useRouter();
    const [toggleVal, setToggleVal] = React.useState<boolean>(false);
    const authState = useRecoilValue(authAtom);
    const userState = useRecoilValue(userAtom) as UserState;
    const txState = useRecoilValue(transactionsAtom);
    const [isUSD, setIsUSD] = React.useState<boolean>(userState?.earning.localCurrencyCode === userState?.earning.primaryCurrencyCode);

    const [convertRate, setConvertRate] = React.useState<number>(userState?.earning.toDate[userState?.earning.localCurrencyCode] / userState?.earning.toDate[userState?.earning.primaryCurrencyCode]);

    React.useEffect(() => {
        if (authState.token) {
            getTransactions(authState.token);
        }
    }, [])

    React.useEffect(() => {
        setIsUSD(userState?.earning.localCurrencyCode === userState?.earning.primaryCurrencyCode);
    }, [userState?.earning.localCurrencyCode, userState?.earning.primaryCurrencyCode])

    return (
        <ScrollView style={constants.G_STYLE.ROOT_VIEW}>
            <StatusBar backgroundColor="transparent" barStyle="light-content" />
            <View style={styles.content}>
                {/* Balance */}
                <View style={styles.userRoot}>
                    <View style={{ ...styles.userInfo }}>
                        <Image
                            style={styles.userAvatar}
                            source={userState?.profileImage}
                            contentFit="cover"
                            transition={0}
                        />
                        <View style={styles.userContact}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Text style={styles.userName}>
                                    @{userState?.username}
                                </Text>
                                <Text style={styles.userFlag}>
                                    {userState?.currency.emoji}
                                </Text>
                            </View>
                            <Text style={styles.userEmail}>{userState?.email}</Text>
                        </View>
                    </View>
                    <View style={styles.icons}>
                        <SvgXml
                            xml={constants.SVGS.qrcode}
                            width={24}
                            height={24}
                            style={styles.qrcode}
                            onPress={() => navigation.push('/qr-code')}
                        />
                        <SvgXml
                            xml={constants.SVGS.alarm}
                            width={24}
                            height={24}
                            style={styles.alarm}
                        />
                    </View>
                </View>
                <View style={styles.balanceCard}>
                    <View>
                        <Text style={styles.cardHeader}>
                            CURRENT BALANCE
                        </Text>
                        <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={styles.balanceAmount}>
                                ${formatNumber(txState?.balance)}
                            </Text>
                            <Text style={styles.balanceUnit}>
                                USD
                            </Text>
                        </View>
                        {!isUSD &&
                            <Text style={styles.balanceTransformedAmount}>
                                = ${formatNumber(txState?.balance && txState?.balance * convertRate)}
                                <Text style={styles.balanceTransformedUnit}>
                                    {userState?.earning.localCurrencyCode}
                                </Text>
                            </Text>}
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-evenly', marginTop: 24 }}>
                        <Button style={styles.withdrawBtn}>
                            <Text style={styles.withdrawBtnTxt}>
                                Withdraw
                            </Text>
                        </Button>
                        <Button style={styles.depositBtn}>
                            <Text style={styles.depositBtnTxt}>
                                Deposit
                            </Text>
                        </Button>
                    </View>
                </View>
                {/* Earning */}
                <View style={styles.earningCard}>
                    <View style={styles.earningCardContainer}>
                        <Text style={styles.cardHeader}>
                            EARNING
                        </Text>
                        {!isUSD && <Switch
                            containerStyle={{ borderWidth: constants.SIZE.BORDER_WIDTH_SM, borderColor: constants.COLORS.BORDER_PRIMARY }}
                            value={toggleVal}
                            onValueChange={setToggleVal}
                            disabled={false}
                            activeText={userState?.earning.localCurrencyCode}
                            inActiveText={'USD'}
                            circleSize={18}
                            barHeight={24}
                            circleBorderWidth={0}
                            backgroundActive={constants.COLORS.BACKGROUND_LIGHT_DARK}
                            backgroundInactive={constants.COLORS.BACKGROUND_LIGHT_DARK}
                            circleActiveColor={constants.COLORS.BACKGROUND_PRIMARY}
                            circleInActiveColor={constants.COLORS.BACKGROUND_PRIMARY}
                            changeValueImmediately={true}
                            renderActiveText={toggleVal}
                            renderInActiveText={!toggleVal}
                            switchLeftPx={12}
                            switchRightPx={4}
                            switchWidthMultiplier={3.5}
                        />}
                    </View>
                    <View style={{ marginTop: 16 }}>
                        <View>
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
                                            ${formatNumber(toggleVal ? userState?.earning.perYear[userState?.earning.localCurrencyCode] : userState?.earning.perYear[userState?.earning.primaryCurrencyCode])}
                                        </Text>
                                        <Text style={styles.earningAmountUnit}>
                                            {toggleVal ? userState?.earning.localCurrencyCode : userState?.earning.primaryCurrencyCode}
                                        </Text>
                                    </View>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Text style={styles.earningRateAmount}>
                                            {formatNumber(userState?.savingsRate)}%
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
                                        ${formatNumber(toggleVal ?
                                            userState?.earning.toDate[userState?.earning.localCurrencyCode] :
                                            userState?.earning.toDate[userState?.earning.primaryCurrencyCode])}
                                    </Text>
                                    <Text style={styles.earningAmountUnit}>
                                        {toggleVal ? userState?.earning.localCurrencyCode : userState?.earning.primaryCurrencyCode}
                                    </Text>
                                </View>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Text style={styles.earningRateAmount}>
                                        {new Intl.DateTimeFormat(defaultLanguageTag).format(userState?.startDate)}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>
                {/* Saving */}
                {/* <View style={styles.savingCard}>
                    <View>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={styles.cardHeader}>
                                SAVING
                            </Text>
                            <SvgXml
                                xml={constants.SVGS.info}
                                width={16}
                                height={16}
                                style={{ marginLeft: 8 }}
                            />
                        </View>
                        <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={styles.balanceAmount}>
                                ${userState?.savingsRate}
                            </Text>
                            <Text style={styles.balanceUnit}>
                                USD
                            </Text>
                        </View>
                        <Text style={styles.balanceTransformedAmount}>
                            = ${userState?.savingsRate * 4096} <Text style={styles.balanceTransformedUnit}>COP</Text>
                        </Text>
                    </View>
                </View> */}
                {/* Latest Tx */}
                <View style={styles.txCard}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
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
                        {
                            // todo: this causing app to crash
                            /*txState?.transactions.length && txState?.transactions.map((tx, idx) => (
                                <Transaction
                                    primaryCurrencyCode={userState?.earning.primaryCurrencyCode}
                                    localCurrencyCode={userState?.earning.localCurrencyCode}
                                    convertRate={convertRate}
                                    usdAmount={tx.amount}
                                    counterpartyName={tx.counterpartyName}
                                    txType={tx.txType}
                                    created={tx.createdAt}
                                    key={idx} />
                            ))*/
                        }
                        <View
                            style={{
                                borderBottomColor: constants.COLORS.BORDER_BRIGHT_DARK,
                                borderBottomWidth: StyleSheet.hairlineWidth,
                                marginTop: 8,
                                marginBottom: 8
                            }}
                        />
                        <Transaction
                            primaryCurrencyCode={userState?.earning.primaryCurrencyCode}
                            localCurrencyCode={userState?.earning.localCurrencyCode} />
                        <View
                            style={{
                                borderBottomColor: constants.COLORS.BORDER_BRIGHT_DARK,
                                borderBottomWidth: StyleSheet.hairlineWidth,
                                marginTop: 8,
                                marginBottom: 8
                            }}
                        />
                        <Transaction
                            primaryCurrencyCode={userState?.earning.primaryCurrencyCode}
                            localCurrencyCode={userState?.earning.localCurrencyCode} />
                        <View
                            style={{
                                borderBottomColor: constants.COLORS.BORDER_BRIGHT_DARK,
                                borderBottomWidth: StyleSheet.hairlineWidth,
                                marginTop: 8,
                                marginBottom: 8
                            }}
                        />
                        <Transaction
                            primaryCurrencyCode={userState?.earning.primaryCurrencyCode}
                            localCurrencyCode={userState?.earning.localCurrencyCode} />
                    </View>
                </View>
            </View>
        </ScrollView >
    );
}

const styles = StyleSheet.create({
    content: {
        height: '100%',
        paddingTop: 45,
        paddingLeft: 16,
        paddingRight: 16
    },
    // Style for user info
    userRoot: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    userInfo: {
        display: 'flex',
        flexDirection: 'row',
    },
    userAvatar: {
        width: 48,
        height: 48,
        borderRadius: 50,
        borderColor: constants.COLORS.BORDER_PRIMARY,
        borderWidth: constants.SIZE.BORDER_WIDTH_SM
    },
    userContact: {
        paddingLeft: constants.SPACING.SM,
    },
    userName: {
        color: constants.COLORS.TEXT_PRIMARY,
        overflow: 'hidden',
        fontFamily: constants.FONTS.Space_Grotesk,
        fontSize: constants.SIZE.TEXT_LG2,
        fontStyle: 'normal',
        fontWeight: '500',
        lineHeight: constants.LINE_HEIGHT.MD,
        letterSpacing: -0.36
    },
    userEmail: {
        overflow: 'hidden',
        color: constants.COLORS.TEXT_MUTED,
        fontFamily: constants.FONTS.Wix_Madefor_Display,
        fontSize: constants.SIZE.TEXT_MD2,
        fontStyle: 'normal',
        fontWeight: '500',
        lineHeight: constants.LINE_HEIGHT.MD
    },
    userFlag: {
        marginLeft: 8,
    },
    qrcode: {
        margin: 8
    },
    alarm: {
        margin: 8
    },
    icons: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center'
    },
    // balance card
    balanceCard: {
        marginTop: 16,
        padding: 16,
        backgroundColor: constants.COLORS.BACKGROUND_LIGHT_DARK,
        borderRadius: constants.SIZE.BORDER_RADIUS_MD,
        borderWidth: constants.SIZE.BORDER_WIDTH_SM,
        borderColor: constants.COLORS.BORDER_BRIGHT_DARK
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
        width: '44%'
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
        width: '44%'
    },
    depositBtnTxt: {
        color: constants.COLORS.TEXT_BLACK,
        fontFamily: constants.FONTS.Syne_Bold,
        fontSize: 16,
        fontStyle: 'normal',
        lineHeight: constants.LINE_HEIGHT.MD,
        letterSpacing: -0.32,
    },
    // earning
    earningCard: {
        marginTop: 16,
        padding: 16,
        backgroundColor: constants.COLORS.BACKGROUND_LIGHT_DARK,
        borderRadius: constants.SIZE.BORDER_RADIUS_MD,
        borderWidth: constants.SIZE.BORDER_WIDTH_SM,
        borderColor: constants.COLORS.BORDER_BRIGHT_DARK
    },
    earningCardContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
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
    // saving
    savingCard: {
        marginTop: 16,
        padding: 16,
        backgroundColor: constants.COLORS.BACKGROUND_LIGHT_DARK,
        borderRadius: constants.SIZE.BORDER_RADIUS_MD,
        borderWidth: constants.SIZE.BORDER_WIDTH_SM,
        borderColor: constants.COLORS.BORDER_BRIGHT_DARK
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
    // latest transactions
    txCard: {
        marginTop: 16,
        padding: 16,
        backgroundColor: constants.COLORS.BACKGROUND_LIGHT_DARK,
        borderRadius: constants.SIZE.BORDER_RADIUS_MD,
        borderWidth: constants.SIZE.BORDER_WIDTH_SM,
        borderColor: constants.COLORS.BORDER_BRIGHT_DARK
    }
});
