import React from 'react';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import { Button } from 'react-native-paper';
import { SvgXml } from 'react-native-svg';

import constants from '../../utils/constants';

type HeaderProps = {
  back?: boolean,
  saving?: boolean,
  title?: string,
  isEditing?: boolean,
  onEdit?: any,
  onBack?: any
}

// Define the Header component
export default function Header(props: HeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.left}>
        {props.back && (
          <TouchableOpacity
            onPress={props.onBack}
            activeOpacity={0.8}
          >
            <SvgXml
              xml={constants.SVGS.back}
              width={24}
              height={24}
            />
          </TouchableOpacity>
        )}
        <Text style={styles.title}>
          {props.title}
        </Text>
      </View>
      {props.saving && (
        <View style={styles.right}>
          {!props.isEditing &&
            <View>
              <Button style={styles.editBtn} onPress={props.onEdit}>
                <Text style={styles.editBtnTxt}>
                  Edit
                </Text>
              </Button>
            </View>}

          {props.isEditing &&
            <Button style={styles.cancelBtn} onPress={props.onEdit}>
              <Text style={styles.cancelBtnTxt}>
                Cancel
              </Text>
            </Button>}
          {props.isEditing &&
            <Button style={styles.saveBtn} onPress={props.onEdit}>
              <Text style={styles.saveBtnTxt}>
                Save
              </Text>
            </Button>}
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: constants.SPACING.SM,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  left: {
    marginLeft: constants.SPACING.SM,
    flexDirection: 'row',
    alignItems: 'center'
  },
  right: {
    marginRight: constants.SPACING.SM,
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontFamily: constants.FONTS.Syne_Bold,
    fontSize: constants.SIZE.TEXT_XL,
    letterSpacing: -0.64,
    textAlign: 'center',
    color: constants.COLORS.TEXT_WHITE,
    fontStyle: 'normal',
    paddingLeft: constants.SPACING.SM,
  },
  editBtn: {
    borderWidth: constants.SIZE.BORDER_WIDTH_SM,
    borderRadius: constants.SIZE.BORDER_RADIUS_MD,
    borderColor: constants.COLORS.BORDER_BUTTON_WHITE,
    height: 32
  },
  editBtnTxt: {
    color: constants.COLORS.BORDER_BUTTON_WHITE,
    fontFamily: constants.FONTS.Syne_Bold,
    fontStyle: 'normal',
    lineHeight: 14,
    letterSpacing: -0.28
  },
  cancelBtn: {
    height: 32
  },
  cancelBtnTxt: {
    color: constants.COLORS.BORDER_BUTTON_WHITE,
    fontFamily: constants.FONTS.Syne_Bold,
    fontStyle: 'normal',
    lineHeight: 14,
    letterSpacing: -0.28
  },
  saveBtn: {
    marginLeft: constants.SPACING.SM,
    borderRadius: constants.SIZE.BORDER_RADIUS_MD,
    backgroundColor: constants.COLORS.BACKGROUND_PRIMARY,
    height: 32
  },
  saveBtnTxt: {
    color: constants.COLORS.TEXT_BLACK,
    fontFamily: constants.FONTS.Syne_Bold,
    fontStyle: 'normal',
    lineHeight: 14,
    letterSpacing: -0.28
  },
});
