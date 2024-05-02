import * as React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { StyleSheet } from 'react-native';
import Constants from 'expo-constants';

// or any pure javascript modules available in npm
import { Button, Card } from 'react-native-paper';
import Login from "../../components/auth/Login";
import Signup from "../../components/auth/Signup";


export default function LoginSignup() {
  const params = useLocalSearchParams();
  const { status } = params;

  const [isLogin, setLogin] = React.useState<boolean>(status === 'login');
  const [isSignup, setSignup] = React.useState<boolean>(status === 'signup');

  React.useEffect(() => {
    setLogin(status === 'isLogin');
  }, [status]);

  React.useEffect(() => {
    setSignup(status === 'signup');
  }, [status]);

  return (
    <>
      {status === 'login' && <Login />}
      {status === 'signup' && <Signup />}
    </>
  );
}