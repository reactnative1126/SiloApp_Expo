import React from 'react';
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
import CountryPicker from 'react-native-country-picker-modal'

import { useRecoilValue } from 'recoil';

import { Images, Fonts, Colors, Themes, Urls } from '@constants';
import { isLog } from '@services/functions';

export default Phone = (props) => {

    return (
        <View style={styles.container}>
            <View style={styles.viewPhone}>
                <CountryPicker
                    withFlag
                    withFlagButton
                    withFilter
                    withAlphaFilter
                    withCallingCode
                    visible={props.show}
                    onSelect={props.onSelect}
                    onClose={props.onClose}
                    renderFlagButton={() => (
                        <TouchableOpacity onPress={props.onShow}>
                            <Text style={styles.textCode}>+{props.code}</Text>
                        </TouchableOpacity>
                    )}
                >
                </CountryPicker>
                <View style={styles.viewLine} />
                <TextInput
                    style={styles.inputNumber}
                    value={props.number}
                    keyboardType='number-pad'
                    onChangeText={props.onChangeText}
                />
            </View>
            <Text style={styles.textError}>{props.error}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%'
    },
    viewPhone: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 30,
        paddingHorizontal: 15,
        height: 50,
        borderWidth: 1,
        borderColor: Colors.green,
        borderRadius: 5
    },
    textCode: {
        fontSize: 15,
        fontWeight: '500',
    },
    viewLine: {
        width: 1,
        height: '100%',
        backgroundColor: Colors.green
    },
    inputNumber: {
        fontSize: 15,
        fontWeight: '500',
        width: wp('100%') - 120,
        height: 50,
    },
    textError: {
        padding: 5,
        width: '100%',
        fontSize: 15,
        color: Colors.red
    }
});