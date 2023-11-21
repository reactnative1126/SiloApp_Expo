import React from 'react';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import {
  Platform,
  SafeAreaView,
  StyleSheet,
  ActivityIndicator,
  View,
} from 'react-native';

import { useRecoilValue } from 'recoil';

import { Images, Fonts, Colors, Themes, Urls } from '@constants';
import { isLog } from '@services/functions';
import { loadingAtom } from '@stores/normal/normal.state';

export default Loading = (props) => {
  const loadingState = useRecoilValue(loadingAtom);

  return (
    loadingState ? (
      <View style={styles.container}>
        <ActivityIndicator size={'large'} color={Colors.blue} />
      </View>
    ) : <View />
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    width: wp('100%'),
    height: hp('100%'),
    backgroundColor: Colors.white,
    opacity: 0.5
  },
  indicator: {
    width: 150,
    height: 150
  },
});