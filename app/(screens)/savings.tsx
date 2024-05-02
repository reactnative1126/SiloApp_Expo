import * as React from 'react';
import { Text, View, StyleSheet, StatusBar, ScrollView } from 'react-native';
import constants from '../../constants';


export default function Savings() {
    return (
        <ScrollView style={constants.G_STYLE.ROOT_VIEW}>
            <StatusBar backgroundColor="transparent" barStyle="light-content" />
            <View style={styles.content}>
                <Text style={{ color: constants.COLORS.TEXT_WHITE }}>
                    Savings
                </Text>
            </View>
        </ScrollView >
    );
}

const styles = StyleSheet.create({
    content: {
        height: '100%',
        paddingTop: 45,
        paddingLeft: 16,
        paddingRight: 16
    }
});
