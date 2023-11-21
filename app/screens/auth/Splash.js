import React, { Fragment, useEffect, useState, useRef } from 'react';

import {
    Platform,
    SafeAreaView,
    StyleSheet,
    StatusBar,
    Image,
    View,
    Text
} from 'react-native';

import { Images, Fonts, Colors, Themes } from '@constants';

export default Splash = (props) => {

    useEffect(() => {
        setTimeout(() => {
            props.navigation.navigate('Auth');
        }, 3000);
    }, []);

    return (
        <View style={styles.container}>
            {/* <StatusBar hidden /> */}
            <Image source={Images.logo} style={styles.imageLogo} />
            <Text style={styles.textTitle}>Exercise</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.dark
    },
    imageLogo: {
        marginTop: -100,
        width: 200,
        height: 200
    },
    textTitle: {
        marginTop: -40,
        fontSize: 40,
        fontWeight: 'bold',
        color: Colors.black
    }
});