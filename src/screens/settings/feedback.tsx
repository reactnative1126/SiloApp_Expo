import React, { useState } from 'react';
import { Text, View, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { Button } from 'react-native-paper';
import Toast from 'react-native-toast-message';

import Container from '../../components/common/Container';
import Header from '../../components/settings/Header';

import constants from '../../utils/constants';
import { log } from '../../utils/functions';

import { useSystemActions } from '../../_recoil/system/system.actions';

export default function Feedback(props: any) {
  const systemActions = useSystemActions();

  const [comment, setComment] = useState<string>('');
  const [rating, setRating] = useState<number>(0);

  const handleSubmit = async () => {
    try {
      const res = await systemActions.submitFeedback(rating, comment, 'There was a problem submit feedback.');

      if (res.success) {
        setComment('');
        setRating(0);
        props.navigation.replace('Settings');
        Toast.show({ type: 'success', text1: 'Submitted Feedback Successfully', visibilityTime: 3000 });
      } else {
        Toast.show({ type: 'error', text1: 'Submission Failed', text2: res.message });
      }
    } catch (error: any) {
      log(error);
    }
  }

  return (
    <Container>
      <View style={styles.content}>
        <Header
          back
          title='Feedback'
          onBack={() => props.navigation.pop()}
        />
        <ScrollView
          style={[styles.content, { paddingVertical: constants.SPACING.XL, paddingHorizontal: constants.SPACING.MD }]}
          contentContainerStyle={{ height: '100%', paddingBottom: 100, justifyContent: 'center' }}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.description}>
            How do you like our app?
          </Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginVertical: 30 }}>
            <TouchableOpacity onPress={() => setRating(1)} activeOpacity={0.8}>
              <Text style={[styles.emoticon, { opacity: rating === 1 ? 1 : 0.3 }]}>😡</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setRating(2)} activeOpacity={0.8}>
              <Text style={[styles.emoticon, { opacity: rating === 2 ? 1 : 0.3 }]}>🙁</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setRating(3)} activeOpacity={0.8}>
              <Text style={[styles.emoticon, { opacity: rating === 3 ? 1 : 0.3 }]}>😐</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setRating(4)} activeOpacity={0.8}>
              <Text style={[styles.emoticon, { opacity: rating === 4 ? 1 : 0.3 }]}>😀</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setRating(5)} activeOpacity={0.8}>
              <Text style={[styles.emoticon, { opacity: rating === 5 ? 1 : 0.3 }]}>😍</Text>
            </TouchableOpacity>
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

        </ScrollView>
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1
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
