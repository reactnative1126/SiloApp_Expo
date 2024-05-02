import React, { useState, useEffect } from 'react';
import { useRecoilValue } from 'recoil';
import { View, StyleSheet, ScrollView } from 'react-native';
import useAsyncEffect from 'use-async-effect';

import Container from '../../components/common/Container';
import Header from '../../components/dashboard/Header';
import Card from '../../components/dashboard/Card';
import CurrentBalance from '../../components/dashboard/CurrentBalance';
import InterestRate from '../../components/dashboard/InterestRate';
import LatestTransactions from '../../components/dashboard/LatestTransactions';

import constants from '../../utils/constants';
import { log } from '../../utils/functions';
import { defaultLanguageTag } from '../../utils/tanslations';

import { authAtom } from '../../_recoil/auth/auth.state';
import { useSystemActions } from '../../_recoil/system/system.actions';
import { useUserActions } from '../../_recoil/user/user.actions';
import { userAtom } from '../../_recoil/user/user.state';

export default function Dashboard(props: any) {
  const systemActions = useSystemActions();
  const userActions = useUserActions();

  const authState = useRecoilValue(authAtom);
  const userState = useRecoilValue(userAtom);

  const [toggleVal, setToggleVal] = useState<boolean>(false);
  const [isUSD, setIsUSD] = useState<boolean>(userState.earning.localCurrencyCode === userState.earning.primaryCurrencyCode);

  useAsyncEffect(async () => {
    log(`auth token: ${authState.token}`, 'info');
    if (authState.token) {
      await userActions.getTransactions(authState.token);
      await systemActions.getSystemInfo('There was a problem getting info.');
      await userActions.getNotificationSettings('There was a problem getting your notification setting.');
    }
  }, []);

  useEffect(() => {
    setIsUSD(userState.earning.localCurrencyCode === userState.earning.primaryCurrencyCode);
  }, [userState.earning.localCurrencyCode, userState.earning.primaryCurrencyCode])

  return (
    <Container>
      <View style={styles.content}>
        <Header
          avatar={userState.profileImage}
          name={userState.name}
          username={userState.username}
          userflag={userState.currency.emoji}
          useremail={userState.email}
          onQRCode={() => props.navigation.push('QRCode')}
          onNotifications={() => props.navigation.push('Notifications')}
        />
        <ScrollView
          style={[styles.content, { paddingHorizontal: constants.SPACING.MD }]}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        >
          <Card marginTop={0}>
            <CurrentBalance
              isUSD={isUSD}
              onWithdraw={() => { }}
              onDeposit={() => props.navigation.push('Deposit')}
            />
          </Card>
          <Card marginTop={constants.SPACING.MD}>
            <InterestRate
              isUSD={isUSD}
              toggleVal={toggleVal}
              setToggleVal={setToggleVal}
              localCurrencyCode={userState.earning.localCurrencyCode}
              perYear={toggleVal ?
                userState.earning.perYear[userState.earning.localCurrencyCode] :
                userState.earning.perYear[userState.earning.primaryCurrencyCode]}
              perYearUnit={toggleVal ?
                userState.earning.localCurrencyCode :
                userState.earning.primaryCurrencyCode}
              savingsRate={userState.savingsRate}
              current={toggleVal ?
                userState.earning.toDate[userState.earning.localCurrencyCode] :
                userState.earning.toDate[userState.earning.primaryCurrencyCode]}
              currentUnit={toggleVal ?
                userState.earning.localCurrencyCode :
                userState.earning.primaryCurrencyCode}
              earningRate={new Intl.DateTimeFormat(defaultLanguageTag).format(userState.startDate)}
            />
          </Card>
          <Card marginTop={constants.SPACING.MD}>
            <LatestTransactions />
          </Card>
        </ScrollView>
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1
  },
});
