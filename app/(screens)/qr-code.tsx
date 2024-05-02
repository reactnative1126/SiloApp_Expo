import * as React from 'react';
import {
    Animated,
    View,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    ScrollView,
} from 'react-native';
import { TabView, SceneMap } from 'react-native-tab-view';
import constants from '../../constants';
import { SvgXml } from 'react-native-svg';
import { Link } from 'expo-router';
import { userAtom } from '../../_recoil/user/user.state';
import { UserState } from '../../_recoil/user/user.types';
import { useRecoilValue } from 'recoil';
import QRcodeGen from '../../components/dashboard/QRCodeGen';
import QRcodeScanner from '../../components/dashboard/QRScanner';

export default function QRcode() {
    const [index, setIndex] = React.useState<number>(0);
    const handleIndexChange = (index: number) => setIndex(index);
    const userState = useRecoilValue(userAtom) as UserState;
    const [walletAddress, setWalleAddress] = React.useState<string>(userState?.walletAddress);

    // My QR Code
    const MyCodeRoute = () => {
        return (
            <QRcodeGen walletAddress={walletAddress} username={userState?.username} />
        )
    };

    // QR Code Scanner   
    const Scan = () => {
        return (
            <QRcodeScanner openCamera={index === 1} />
        )
    };

    // TabBar
    const renderTabBar = (props: any) => {
        const inputRange = props.navigationState.routes.map((x: any, i: number) => i);

        return (
            <View style={styles.tabBar}>
                {props.navigationState.routes.map((route: any, i: number) => {
                    return (
                        <TouchableOpacity
                            key={i}
                            style={styles.tabItem}
                            onPress={() => setIndex(i)}>
                            <View style={{ borderColor: constants.COLORS.BORDER_PRIMARY, width: '100%', paddingBottom: 8, marginBottom: 12, alignItems: 'center', borderBottomWidth: i === index ? 2 : 0, }}>
                                <Animated.Text style={{ ...styles.tabBarText, color: i === index ? constants.COLORS.TEXT_PRIMARY : constants.COLORS.TEXT_MUTED }}>{route.title}</Animated.Text>
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </View>
        );
    };

    const renderScene = SceneMap({
        MyCodeRoute: MyCodeRoute,
        Scan: Scan,
    });

    return (
        <ScrollView style={constants.G_STYLE.ROOT_VIEW}>
            <StatusBar backgroundColor="transparent" barStyle="light-content" />
            <View style={{ top: '15%', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 }}>
                <Link href={{ pathname: "/dashboard" }} style={{ marginLeft: '3%', verticalAlign: 'middle' }}>
                    <SvgXml
                        xml={constants.SVGS.back}
                        width={24}
                        height={24}
                    />
                </Link>
            </View>
            <View style={styles.content}>
                <TabView
                    style={[styles.tabViewContainer, { height: index === 0 ? 425 : 600 }]}
                    navigationState={{
                        index,
                        routes: [
                            { key: 'MyCodeRoute', title: 'My Code' },
                            { key: 'Scan', title: 'Scan' },
                        ],
                    }}
                    animationEnabled={false}
                    renderScene={renderScene}
                    renderTabBar={renderTabBar}
                    onIndexChange={handleIndexChange}
                />
            </View>
        </ScrollView >
    );
}

const styles = StyleSheet.create({
    tabBar: {
        flexDirection: 'row',
        paddingTop: StatusBar.currentHeight,
    },
    tabItem: {
        flex: 1,
        alignItems: 'center',
        paddingTop: 0,
        paddingBottom: 0,
        paddingHorizontal: 24,
    },
    content: {
        paddingTop: '24%',
        paddingLeft: 16,
        paddingRight: 16
    },
    tabViewContainer: {
        borderRadius: constants.SIZE.BORDER_RADIUS_MD,
        borderWidth: constants.SIZE.BORDER_WIDTH_SM,
        borderColor: constants.COLORS.BORDER_BRIGHT_DARK,
        backgroundColor: constants.COLORS.BACKGROUND_LIGHT_DARK
    },
    tabBarText: {
        color: constants.COLORS.TEXT_MUTED,
        fontFamily: constants.FONTS.Space_Grotesk,
        fontSize: constants.SIZE.TEXT_LG3,
        fontStyle: 'normal',
        fontWeight: '600',
        lineHeight: constants.LINE_HEIGHT.MD,
        letterSpacing: -0.4
    }
});
