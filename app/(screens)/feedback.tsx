import * as React from 'react';
import { Text, View, StyleSheet, StatusBar, ScrollView, TextInput } from 'react-native';
import { Button } from 'react-native-paper';
import constants from '../../constants';
import { Link, useRouter } from 'expo-router';
import { SvgXml } from 'react-native-svg';
import { useSystemActions } from '../../_recoil/system/system.actions';
import Toast from 'react-native-toast-message';
interface resType {
    statusCode: number,
    success: boolean
}

export default function Feedback() {
    const [comment, setComment] = React.useState<string>('');
    const [rating, setRating] = React.useState<number>(0);
    const { submitFeedback } = useSystemActions();
    const navigation = useRouter();

    const handleSubmit = async () => {
        const res = await submitFeedback(rating, comment) as resType;
        if (res.success) {
            setTimeout(() => {
                setComment('');
                setRating(0);
                navigation.replace('/settings');
            }, 2000);
        }
    }

    return (
        <ScrollView style={constants.G_STYLE.ROOT_VIEW}>
            <StatusBar backgroundColor="transparent" barStyle="light-content" />
            <View style={styles.content}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Link href={{ pathname: "/settings" }} style={{ marginRight: 8 }}>
                            <SvgXml
                                xml={constants.SVGS.back}
                                width={24}
                                height={24}
                            />
                        </Link>
                        <Text style={[constants.G_STYLE.LOGO_TEXT, { paddingLeft: 0, fontSize: 24, lineHeight: 32, letterSpacing: -0.48 }]}>
                            Feedback
                        </Text>
                    </View>
                </View>
                <View style={styles.mainContent}>
                    <Text style={styles.description}>
                        How do you like our app?
                    </Text>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginVertical: 30 }}>
                        <Text style={[styles.emoticon, { opacity: rating === 1 ? 1 : 0.3 }]} onPress={() => setRating(1)}>😡</Text>
                        <Text style={[styles.emoticon, { opacity: rating === 2 ? 1 : 0.3 }]} onPress={() => setRating(2)}>🙁</Text>
                        <Text style={[styles.emoticon, { opacity: rating === 3 ? 1 : 0.3 }]} onPress={() => setRating(3)}>😐</Text>
                        <Text style={[styles.emoticon, { opacity: rating === 4 ? 1 : 0.3 }]} onPress={() => setRating(4)}>😀</Text>
                        <Text style={[styles.emoticon, { opacity: rating === 5 ? 1 : 0.3 }]} onPress={() => setRating(5)}>😍</Text>
                    </View>
                    <View>
                        <Text style={styles.commentLabel}>
                            What do you think about it?
                        </Text>
                        <TextInput multiline={true}
                            onChangeText={setComment}
                            value={comment}
                            style={styles.commentBox} />
                    </View>
                    <Button disabled={rating === 0} style={[constants.G_STYLE.BTN_PRIMARY, rating === 0 && constants.G_STYLE.BTN_DISABLED, { marginHorizontal: 0, marginTop: 20 }]} onPress={handleSubmit}>
                        <Text style={styles.btnTxt}>
                            Leave feedback
                        </Text>
                    </Button>
                </View>
            </View>
            <Toast />
        </ScrollView >
    );
}

const styles = StyleSheet.create({
    content: {
        height: '100%',
        paddingTop: 72,
        paddingLeft: 16,
        paddingRight: 16
    },
    mainContent: {
        marginTop: 86
    },
    description: {
        color: constants.COLORS.TEXT_WHITE,
        fontFamily: 'Space Grotesk',
        fontSize: 20,
        fontStyle: 'normal',
        fontWeight: '600',
        lineHeight: 24,
        letterSpacing: -0.4,
        alignSelf: 'center'
    },
    emoticon: {
        fontFamily: 'Syne',
        fontSize: 52,
        fontStyle: 'normal',
        fontWeight: '700',
        letterSpacing: -1.04
    },
    commentLabel: {
        color: constants.COLORS.TEXT_WHITE,
        fontFamily: 'Space Grotesk',
        fontSize: 16,
        fontStyle: 'normal',
        fontWeight: '400',
        lineHeight: 24,
        letterSpacing: -0.32
    },
    commentBox: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        width: '100%',
        minHeight: 140,
        backgroundColor: constants.COLORS.BACKGROUND_LIGHT_DARK,
        borderWidth: 1,
        borderColor: constants.COLORS.BORDER_BRIGHT_DARK,
        borderRadius: 8,
        marginTop: 8,
        display: 'flex',
        alignItems: 'flex-start',
        color: constants.COLORS.TEXT_WHITE,
        fontFamily: 'Space Grotesk',
        fontSize: 18,
        fontStyle: 'normal',
        fontWeight: '400',
        lineHeight: 24,
        letterSpacing: -0.36,
        textAlignVertical: 'top'
    },
    btn: {
        backgroundColor: constants.COLORS.BACKGROUND_PRIMARY,
        borderRadius: 8,
        paddingVertical: 4
    },
    btnTxt: {
        color: constants.COLORS.TEXT_BLACK,
        fontFamily: 'Syne-Bold',
        fontSize: 16,
        fontStyle: 'normal',
        lineHeight: 24,
        letterSpacing: -0.32
    }
});
