import React from 'react';
import { Text, View, StyleSheet, Pressable } from 'react-native';
import { SvgXml } from 'react-native-svg';

import constants from '../../utils/constants';

import { useAuthActions } from '../../_recoil/auth/auth.actions';

type SettingMenuProps = {
  screen?: string,
  label: string,
  icon?: string,
  color?: string,
  navigation: any,
}

export default function SettingMenu(props: SettingMenuProps) {
  const authActions = useAuthActions();

  const handlePress = async () => {
    if (props.screen === 'Logout') {
      await authActions.logout();
    }
    else if (props.screen) {
      props.navigation.push(props.screen);
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
