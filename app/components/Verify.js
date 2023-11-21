import React, { useRef } from 'react';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import {
    Platform,
    SafeAreaView,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    View,
    Text
} from 'react-native';

import { useRecoilValue } from 'recoil';

import { Images, Fonts, Colors, Themes, Urls } from '@constants';
import { isLog } from '@services/functions';

export default Verify = (props) => {

    const digit1Ref = useRef();
    const digit2Ref = useRef();
    const digit3Ref = useRef();
    const digit4Ref = useRef();
    const digit5Ref = useRef();
    const digit6Ref = useRef();


    return (
        <View style={styles.container}>
            <View style={styles.viewPhone}>
                <TextInput
                    ref={digit1Ref}
                    value={props.digit1}
                    style={styles.inputCode}
                    autoFocus
                    maxLength={1}
                    keyboardType='number-pad'
                    returnKeyType='next'
                    onChangeText={(value) => {
                        props.setDigit1(value);
                        if (value?.length === 1) digit2Ref.current.focus();
                    }}
                />
                <TextInput
                    ref={digit2Ref}
                    value={props.digit2}
                    style={styles.inputCode}
                    maxLength={1}
                    keyboardType='number-pad'
                    returnKeyType='next'
                    onChangeText={(value) => {
                        if (props.digit1?.length === 0) digit1Ref.current.focus();
                        else if (value?.length === 1) digit3Ref.current.focus();
                        props.setDigit2(value);
                    }}
                    onKeyPress={({ nativeEvent }) => {
                        if (nativeEvent.key === 'Backspace' && props.digit2.length === 0) digit1Ref.current.focus();
                    }}
                />
                <TextInput
                    ref={digit3Ref}
                    value={props.digit3}
                    style={styles.inputCode}
                    maxLength={1}
                    keyboardType='number-pad'
                    returnKeyType='next'
                    onChangeText={(value) => {
                        if (props.digit1?.length === 0) digit1Ref.current.focus();
                        else if (props.digit2?.length === 0) digit2Ref.current.focus();
                        else if (value?.length === 1) digit4Ref.current.focus();
                        props.setDigit3(value);
                    }}
                    onKeyPress={({ nativeEvent }) => {
                        if (nativeEvent.key === 'Backspace' && props.digit3.length === 0) digit2Ref.current.focus();
                    }}
                />
                <TextInput
                    ref={digit4Ref}
                    value={props.digit4}
                    style={styles.inputCode}
                    maxLength={1}
                    keyboardType='number-pad'
                    returnKeyType='next'
                    onChangeText={(value) => {
                        if (props.digit1?.length === 0) digit1Ref.current.focus();
                        else if (props.digit2?.length === 0) digit2Ref.current.focus();
                        else if (props.digit3?.length === 0) digit3Ref.current.focus();
                        else if (value?.length === 1) digit5Ref.current.focus();
                        props.setDigit4(value);
                    }}
                    onKeyPress={({ nativeEvent }) => {
                        if (nativeEvent.key === 'Backspace' && props.digit4.length === 0) digit3Ref.current.focus();
                    }}
                />
                <TextInput
                    ref={digit5Ref}
                    value={props.digit5}
                    style={styles.inputCode}
                    maxLength={1}
                    keyboardType='number-pad'
                    returnKeyType='next'
                    onChangeText={(value) => {
                        if (props.digit1?.length === 0) digit1Ref.current.focus();
                        else if (props.digit2?.length === 0) digit2Ref.current.focus();
                        else if (props.digit3?.length === 0) digit3Ref.current.focus();
                        else if (props.digit4?.length === 0) digit4Ref.current.focus();
                        else if (value?.length === 1) digit6Ref.current.focus();
                        props.setDigit5(value);
                    }}
                    onKeyPress={({ nativeEvent }) => {
                        if (nativeEvent.key === 'Backspace' && props.digit5.length === 0) digit4Ref.current.focus();
                    }}
                />
                <TextInput
                    ref={digit6Ref}
                    value={props.digit6}
                    style={styles.inputCode}
                    maxLength={1}
                    keyboardType='number-pad'
                    returnKeyType='next'
                    onChangeText={(value) => {
                        if (props.digit1?.length === 0) digit1Ref.current.focus();
                        else if (props.digit2?.length === 0) digit2Ref.current.focus();
                        else if (props.digit3?.length === 0) digit3Ref.current.focus();
                        else if (props.digit4?.length === 0) digit4Ref.current.focus();
                        else if (props.digit5?.length === 0) digit5Ref.current.focus();
                        props.setDigit6(value);
                    }}
                    onKeyPress={({ nativeEvent }) => {
                        if (nativeEvent.key === 'Backspace' && props.digit6.length === 0) digit5Ref.current.focus();
                    }}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%'
    },
    viewPhone: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        marginTop: 30,
        paddingHorizontal: 15,
        height: 50,
    },
    inputCode: {
        textAlign: 'center',
        textAlignVertical: 'center',
        fontSize: 30,
        fontWeight: 'bold',
        width: 50,
        height: 50,
        borderWidth: 1,
        borderColor: Colors.green,
        borderRadius: 5
    },
    textError: {
        padding: 5,
        width: '100%',
        fontSize: 15,
        color: Colors.red
    }
});