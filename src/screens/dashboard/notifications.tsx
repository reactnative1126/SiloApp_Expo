import React, { useState } from 'react';
import { useRecoilValue } from 'recoil';
import { View, StyleSheet, ScrollView, TextInput, Text } from 'react-native';
import { SvgXml } from 'react-native-svg';
import moment from 'moment';

import Container from '../../components/common/Container';
import Header from '../../components/notifications/Header';
import NotificationItem from '../../components/notifications/NotificationItem';
import FilterModal from '../../components/notifications/FilterModal';
import FilterAlert from '../../components/notifications/FilterAlert';

import constants from '../../utils/constants';

import { useUserActions } from '../../_recoil/user/user.actions';
import { notificationsAtom } from '../../_recoil/user/user.state';
import { Notification } from '../../_recoil/user/user.types';
import useAsyncEffect from 'use-async-effect';

interface NotificationsState {
  [date: string]: Notification[];
}

export default function Notifications(props: any) {
  const userActions = useUserActions();

  const notificationsState = useRecoilValue(notificationsAtom);

  const [search, setSearch] = useState<string>('');
  const [showFilter, setShowFilter] = useState(false);
  const [sort, setSort] = useState('new');
  const [showAlert, setShowAlert] = useState(false);
  const [notify, setNotify] = useState<Notification>();
  const [dialogTitle, setDialogTitle] = useState('');

  useAsyncEffect(async () => {
    await userActions.getNotifications('There was a problem getting user notifications.');
  }, []);

  return (
    <Container>
      <View style={styles.content}>
        <Header
          back
          filter
          title='Notifications'
          onBack={() => props.navigation.pop()}
          onFilter={() => setShowFilter(true)}
        />
        <View style={styles.search}>
          <SvgXml
            xml={constants.SVGS.search}
            width={24}
            height={24}
          />
          <TextInput
            value={search}
            style={styles.input}
            placeholder='Search...'
            autoCapitalize='none'
            placeholderTextColor={constants.COLORS.TEXT_MUTED}
            onChangeText={setSearch}
          />
        </View>
        <ScrollView
          style={[styles.content, { paddingHorizontal: constants.SPACING.MD }]}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        >
          {notificationsState &&
            Object.keys(notificationsState).map((date) => {
              return [
                <Text key={`date-${date}`} style={styles.date}>
                  {moment(date).isSame(moment(), 'day') ? 'Today' : moment(date).format('dddd, MMMM DD')}
                </Text>,
                ...(notificationsState as NotificationsState)[date].map((notification: Notification, index: number) => (
                  <NotificationItem
                    key={`notification-${index}`}
                    image={notification.image}
                    counterparty={notification.counterparty}
                    message={notification.message}
                    actions={notification.actions}
                    actionStatus={notification.actionStatus}
                    isNew={notification.isNew}
                    onAccept={() => { console.log('Accpet') }}
                    onSend={() => { console.log('Send') }}
                    onDecline={() => {
                      setDialogTitle('Are you sure you would like to deny this request')
                      setNotify(notification);
                      setShowAlert(true)
                    }}
                    onDeny={() => {
                      setDialogTitle('Are you sure you would like to deny this request')
                      setNotify(notification);
                      setShowAlert(true)
                    }}
                    onRevoke={() => {
                      setDialogTitle('Are you sure you would like to deny this request')
                      setNotify(notification);
                      setShowAlert(true)
                    }}
                  />
                )),
              ];
            })}
        </ScrollView>
      </View>
      <FilterModal
        show={showFilter}
        sort={sort}
        onFilter={(value: React.SetStateAction<string>) => setSort(value)}
        onClose={() => setShowFilter(false)}
      />
      <FilterAlert
        show={showAlert}
        title={dialogTitle}
        onClose={() => setShowAlert(false)}
        onDeny={() => setShowAlert(false)}
        notification={notify}
      />
    </Container>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1
  },
  search: {
    flexDirection: 'row',
    marginVertical: constants.SPACING.SM,
    marginHorizontal: constants.SPACING.MD,
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
  icon: {
    marginRight: 12,
    width: '10%',
    alignSelf: 'flex-start',
  },
  date: {
    fontFamily: constants.FONTS.Space_Grotesk,
    fontSize: constants.SIZE.TEXT_MD2,
    fontWeight: '500',
    lineHeight: constants.LINE_HEIGHT.MD,
    color: constants.COLORS.BACKGROUND_WHITE
  }
});
