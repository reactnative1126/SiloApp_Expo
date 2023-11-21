import Constants from 'expo-constants';
import React, { Fragment, useEffect, useState, useRef } from 'react';
import {
  Text,
  View,
  StyleSheet,
  SafeAreaView,
  TextInput
} from 'react-native';

// or any pure javascript modules available in npm
import { Button, Card } from 'react-native-paper';

import { Images, Fonts, Colors, Themes, Urls } from '@constants';
import { isLog, isEmpty, isLength } from '@services/functions';
import { useAuthActions } from '@stores/auth/auth.actions';


export default function SignUp() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const authActions = useAuthActions();

  // Handle the form submission by calling Userfront.signup()
  const handleSubmit = async () => {
    try {
      const message = await authActions.register(username, email, password);
      isLog(4, `returned registration messsage: ${message}`);
    } catch (error) {
      isLog(1, error);
      Toast.show({ type: 'error', text1: 'Error', text2: error.message });
    }
  };


  return (
    <View style={styles.container1}>
      <Card style={styles.container1}>
        <View style={styles.container2}>
          <Text style={styles.paragraph}>Sign up</Text>
          <SafeAreaView>
            <TextInput
              style={styles.input}
              onChangeText={setEmail}
              value={email}
              placeholder='Email address'
              keyboardType='email-address'
              textContentType='emailAddress'
            />
            <TextInput
              style={styles.input}
              onChangeText={setUsername}
              value={username}
              placeholder='Username'
            />
            <TextInput
              style={styles.input}
              onChangeText={setPassword}
              value={password}
              placeholder='Password'
              textContentType='password'
            />
            <Button
              style={styles.button}
              onPress={handleSubmit}
              accessibilityLabel='Sign up'>
              Register
            </Button>
          </SafeAreaView>
        </View>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container1: {
    flex: 1,
    paddingTop: Constants.statusBarHeight + 10,
    backgroundColor: '#ecf0f1',
    padding: 8,
  },
  container2: {
    padding: 20,
  },
  paragraph: {
    marginBottom: 24,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  input: {
    height: 40,
    marginBottom: 12,
    padding: 8,
    borderWidth: 1,
  },
  button: {
    marginBottom: 12,
    padding: 8,
  },
});
