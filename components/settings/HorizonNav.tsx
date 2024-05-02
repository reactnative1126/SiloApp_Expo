import * as React from 'react';
import { Text, View, StyleSheet, Pressable } from 'react-native';
import constants from '../../constants';
import { SvgXml } from 'react-native-svg';
import { Link, useRouter } from 'expo-router';
import { useAuthActions } from '../../_recoil/auth/auth.actions';
import { useSession } from '../../context/ctx';
import { log } from '../../_util/debug';

type HorizonNavProps = {
    href?: any,
    label: string,
    icon?: string,
    color?: string
}

export default function HorizonNav(props: HorizonNavProps) {
    const navigation = useRouter();
    const {logout} = useAuthActions();

    const handlePress = () => {
        if (props.href === 'logout') {
            logout();
        } 
        else if(props.href) {
            navigation.push(props.href);
        }
    }

    return (
        <Pressable onPress={handlePress}>
            <View style={styles.container}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <SvgXml
                        xml={props.icon || null}
                        width={24}
                        height={24}
                        style={{ marginRight: 16 }}
                    />
                    <Text style={[styles.label, { color: props.color || constants.COLORS.TEXT_WHITE }]}>{props.label}</Text>
                </View>
                <SvgXml
                    xml={constants.SVGS.navigation}
                    width={16}
                    height={16}
                />
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    label: {
        fontFamily: constants.FONTS.Space_Grotesk,
        fontSize: constants.SIZE.TEXT_LG2,
        fontStyle: 'normal',
        fontWeight: '400',
        lineHeight: constants.LINE_HEIGHT.MD,
        letterSpacing: -0.36
    }
});
