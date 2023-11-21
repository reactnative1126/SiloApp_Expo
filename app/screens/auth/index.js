import Constants from 'expo-constants';

import React, { useState } from 'react';
import {
    Platform,
    SafeAreaView,
    StyleSheet,
    TouchableOpacity,
    View,
    Text
} from 'react-native';

// or any pure javascript modules available in npm
import { Button, Card } from 'react-native-paper';

import SignUp from './SignUp';
import SignIn from './SignIn';
import { Images, Fonts, Colors, Themes, Urls } from '@constants';
import { isLog, isEmpty, isLength } from '@services/functions';


export default function Auth() {
    const [isLogin, setLogin] = useState(true);

    return (
        <>
            {isLogin &&
                <SignIn />
            }
            {!isLogin &&
                <SignUp />
            }
            <Button onPress={() => setLogin(!isLogin)}>
                {isLogin ? 'Sign up' : 'Login'}
            </Button>
        </>
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