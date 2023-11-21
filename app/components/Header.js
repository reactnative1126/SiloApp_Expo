import React from 'react';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import {
    Platform,
    SafeAreaView,
    StyleSheet,
    View,
    Text
} from 'react-native';

import { useRecoilValue } from 'recoil';

import { Images, Fonts, Colors, Themes, Urls } from '@constants';
import { isLog } from '@services/functions';

export default Header = (props) => {

    return (
        <View style={styles.container}>
            <Text style={styles.textTitle}>{props.title}</Text>
            <Text style={styles.textDescription}>{props.description}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%'
    },
    textTitle: {
        fontSize: 35,
        fontWeight: '700',
        color: Colors.black
    },
    textDescription: {
        marginTop: 5,
        fontSize: 14,
        fontWeight: '500',
        color: Colors.black
    }
});