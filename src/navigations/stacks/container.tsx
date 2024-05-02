import React, { useEffect } from 'react';
import { useRecoilState } from 'recoil';
import { createStackNavigator } from '@react-navigation/stack';

import { navOptionHandler } from '../../utils/functions';

import Auth from './auth';
import Main from '../tabs/main';

import { useSession } from '../../utils/context/ctx';
import { authAtom } from '../../_recoil/auth/auth.state';
import { userAtom } from '../../_recoil/user/user.state';

const StackContainer = createStackNavigator();
export default function ContainerStack(props: any) {
  const { session } = useSession();
  const [, setAuth] = useRecoilState(authAtom);
  const [, setUser] = useRecoilState(userAtom);

  useEffect(() => {
    if (session) {
      setAuth(JSON.parse(session).auth);
      setUser(JSON.parse(session).user);
      props.navigation.navigate('Main');
    } else {
      props.navigation.navigate('Auth');
    }
  }, [session]);

  return (
    <StackContainer.Navigator initialRouteName='Auth' screenOptions={{ gestureEnabled: false }}>
      <StackContainer.Screen name='Auth' component={Auth} options={navOptionHandler} />
      <StackContainer.Screen name='Main' component={Main} options={navOptionHandler} />
    </StackContainer.Navigator>
  );
};