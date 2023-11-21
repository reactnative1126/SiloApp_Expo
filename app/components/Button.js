import React from 'react';
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

import { Images, Fonts, Colors, Themes, Urls } from '@constants';
import { isLog } from '@services/functions';

export default Button = (props) => {

    return (
        <TouchableOpacity
            style={[styles.container, { marginTop: props.marginTop, opacity: props.disabled ? 0.5 : 1 }]}
            disabled={props.disabled}
            onPress={props.onPress}
        >
            <Text style={styles.textName}>{props.name}</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: 50,
        backgroundColor: Colors.blue,
        borderRadius: 5
    },
    textName: {
        fontSize: 15,
        fontWeight: '500',
        color: Colors.white
    }
});