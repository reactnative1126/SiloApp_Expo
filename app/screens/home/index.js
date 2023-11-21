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

import { Images, Fonts, Colors, Themes, Urls } from '@constants';
import { isLog } from '@services/functions';


export default function Home() {

    return (
        <View style={styles.container}>
            <Text>Home Screen</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
});