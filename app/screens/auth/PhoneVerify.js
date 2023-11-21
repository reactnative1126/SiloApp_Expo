import React, { useEffect, useState, useRef } from 'react';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import {
    Platform,
    SafeAreaView,
    StyleSheet,
    TouchableOpacity,
    View,
    Text
} from 'react-native';

import { useRecoilValue } from 'recoil';

import { Header, Button, Verify } from '@components';
import { Images, Fonts, Colors, Themes, Urls } from '@constants';
import { isLog, isEmpty, isLength } from '@services/functions';
import { useAuthActions } from '@stores/auth/auth.actions';
import { phoneAtom } from '@stores/auth/auth.state';

export default PhoneVerify = (props) => {
    const authActions = useAuthActions();
    // const { number } = props.route.params;

    const buttonRef = useRef();

    const [digit1, setDigit1] = useState('');
    const [digit2, setDigit2] = useState('');
    const [digit3, setDigit3] = useState('');
    const [digit4, setDigit4] = useState('');
    const [digit5, setDigit5] = useState('');
    const [digit6, setDigit6] = useState('');
    const [disabled, setDisabled] = useState(true);

    useEffect(() => {
        if (isEmpty(digit1) || isEmpty(digit2) || isEmpty(digit3) || isEmpty(digit4) || isEmpty(digit5) || isEmpty(digit6)) {
            setDisabled(true);
        } else {
            setDisabled(false);
        }
    }, [digit1, digit2, digit3, digit4, digit5, digit6]);

    const sendCode = async () => {
        if (typeof Number(digit1) == 'number' && typeof Number(digit2) == 'number' && typeof Number(digit3) == 'number' && typeof Number(digit4) == 'number' && typeof Number(digit5) == 'number' && typeof Number(digit6) == 'number') {
            try {
                await authActions.phoneVerify(props.navigation, `${digit1}${digit2}${digit3}${digit4}${digit5}${digit6}`);
                setDigit1('');
                setDigit2('');
                setDigit3('');
                setDigit4('');
                setDigit5('');
                setDigit6('');
            } catch (error) {
                isLog(1, error);
            }
        }
    }

    return (
        <View style={styles.container}>
            <Header
                title='Enter Code'
                description={`Please enter the code to your phone`}
            />

            <Verify
                buttonRef={buttonRef}
                digit1={digit1}
                digit2={digit2}
                digit3={digit3}
                digit4={digit4}
                digit5={digit5}
                digit6={digit6}
                setDigit1={(value) => setDigit1(value)}
                setDigit2={(value) => setDigit2(value)}
                setDigit3={(value) => setDigit3(value)}
                setDigit4={(value) => setDigit4(value)}
                setDigit5={(value) => setDigit5(value)}
                setDigit6={(value) => setDigit6(value)}
                onVerify={() => { }}
            />

            <Button
                disabled={disabled}
                name='Submit'
                marginTop={30}
                onPress={() => sendCode()}
            />

            <TouchableOpacity onPress={() => {
                setDigit1('');
                setDigit2('');
                setDigit3('');
                setDigit4('');
                setDigit5('');
                setDigit6('');
                props.navigation.navigate('PhoneRequest');
            }}>
                <Text style={styles.textError}>Didn't get code</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        paddingTop: 100,
        paddingHorizontal: 15
    },
    textError: {
        marginTop: 15,
        fontSize: 15,
        fontWeight: '500',
        color: Colors.blue
    }
});