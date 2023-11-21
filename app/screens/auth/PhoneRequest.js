import React, { useEffect, useState } from 'react';
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

import { Header, Butto, Phonen } from '@components';
import { Images, Fonts, Colors, Themes, Urls } from '@constants';
import { isLog, isEmpty, isLength } from '@services/functions';
import { useAuthActions } from '@stores/auth/auth.actions';
import { phoneAtom } from '@stores/auth/auth.state';

export default PhoneRequest = (props) => {
    const authActions = useAuthActions();

    const [show, setShow] = useState(false);
    const [code, setCode] = useState('1');
    const [number, setNumber] = useState('');
    const [error, setError] = useState('');

    const sendCode = async () => {
        if (isEmpty(number)) {
            setError('Require field');
        } else if (isLength(number, 15)) {
            setError('Please input less 15 digits');
        // } else if (parseInt(number)) {
        //     setError('Please input only digits');
        } else if(number.length < 9) {
            setError('Please input correct phone number');
        }
        else {
            try {
                await authActions.phoneRequest(props.navigation, `+${code}${number}`);
                setNumber('');
                setError('');
            } catch (error) {
                isLog(1, error);
            }
        }
    }

    return (
        <View style={styles.container}>
            <Header
                title='Verification'
                description='We will send you One Time Code on your phone number.'
            />
            <Phone
                show={show}
                code={code}
                number={number}
                error={error}
                onShow={() => setShow(true)}
                onClose={() => setShow(false)}
                onSelect={(data) => setCode(data.callingCode[0])}
                onChangeText={(value) => setNumber(value)}
            />
            <Button
                name='Send Code'
                marginTop={30}
                onPress={() => sendCode()}
            />
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
});