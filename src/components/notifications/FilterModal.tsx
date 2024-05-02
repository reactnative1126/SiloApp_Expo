import React, { useState } from 'react';
import { Text, View, StyleSheet, Modal, ScrollView, TouchableOpacity } from 'react-native';
import { SvgXml } from 'react-native-svg';
// import DateTimePickerModal from 'react-native-modal-datetime-picker';
import moment from 'moment';

import Container from '../common/Container';
import Header from './Header';

import constants from '../../utils/constants';

type FilterProps = {
  show: boolean | false;
  sort: string;
  onClose: any | null;
  onFilter: any | null;
}

// Define the Filter component
export default function FilterModal(props: FilterProps) {
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  const [visibleFrom, setVisibleFrom] = useState(false);
  const [visibleTo, setVisibleTo] = useState(false);

  const handleConfirmFromDate = (date: Date) => {
    setFromDate(date)
    setVisibleFrom(false);
  }

  const handleCancelFromDate = () => {
    setVisibleFrom(false);
  }

  const handleConfirmToDate = (date: Date) => {
    setToDate(date)
    setVisibleTo(false);
  }

  const handleCancelToDate = () => {
    setVisibleTo(false);
  }

  return (
    <Modal
      animationType='slide'
      transparent={true}
      visible={props.show}
      onRequestClose={props.onClose}>
      <Container>
        <View style={styles.content}>
          <Header
            close
            title='Filters'
            onClose={props.onClose}
          />
          <ScrollView
            style={[styles.content, { padding: constants.SPACING.MD }]}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.sortby}>
              Sort by:
            </Text>
            <TouchableOpacity
              style={styles.item}
              onPress={() => props.onFilter('new')}
              activeOpacity={0.8}
            >
              <SvgXml
                xml={props.sort === 'new' ? constants.SVGS.filter_active : constants.SVGS.filter_inactive}
                width={24}
                height={24}
              />
              <Text style={styles.itemText}>New first</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.item}
              onPress={() => props.onFilter('old')}
              activeOpacity={0.8}
            >
              <SvgXml
                xml={props.sort === 'old' ? constants.SVGS.filter_active : constants.SVGS.filter_inactive}
                width={24}
                height={24}
              />
              <Text style={styles.itemText}>Old first</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.item}
              onPress={() => props.onFilter('date')}
              activeOpacity={0.8}
            >
              <SvgXml
                xml={props.sort === 'date' ? constants.SVGS.filter_active : constants.SVGS.filter_inactive}
                width={24}
                height={24}
              />
              <Text style={styles.itemText}>Date range</Text>
            </TouchableOpacity>
            {props.sort === 'date' && (
              <View style={styles.dateRange}>
                <View style={{ width: '48%' }}>
                  <Text style={styles.label}>From:</Text>
                  <TouchableOpacity
                    style={styles.dateView}
                    onPress={() => setVisibleFrom(true)}
                    activeOpacity={0.8}
                  >
                    <SvgXml
                      xml={constants.SVGS.date_calender}
                      width={20}
                      height={22}
                    />
                    <Text style={styles.dateText}>{moment(fromDate).format('DD/MM/YYYY')}</Text>
                  </TouchableOpacity>
                </View>
                <View style={{ width: '48%' }}>
                  <Text style={styles.label}>To:</Text>
                  <TouchableOpacity
                    style={styles.dateView}
                    onPress={() => setVisibleTo(true)}
                    activeOpacity={0.8}
                  >
                    <SvgXml
                      xml={constants.SVGS.date_calender}
                      width={20}
                      height={22}
                    />
                    <Text style={styles.dateText}>{moment(toDate).format('DD/MM/YYYY')}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </ScrollView>
        </View>
        {/* <DateTimePickerModal
          key='from'
          isVisible={visibleFrom}
          mode='date'
          date={fromDate}
          onConfirm={handleConfirmFromDate}
          onCancel={handleCancelFromDate}
          pickerContainerStyleIOS={{ backgroundColor: constants.COLORS.BACKGROUND_BLACK }}
          confirmTextIOS='Select'
          cancelTextIOS='Cancel'
          textColor={constants.COLORS.BACKGROUND_WHITE}
          buttonTextColorIOS={constants.COLORS.BORDER_BUTTON_WHITE}
          // customConfirmButtonIOS={() => (
          //   <TouchableOpacity style={styles.selectBtn} onPress={() => setVisibleFrom(false)}>
          //     <Text style={[constants.G_STYLE.BUTTON_TEXT, { fontSize: constants.SIZE.TEXT_LG }]}>Select</Text>
          //   </TouchableOpacity>
          // )}
          customCancelButtonIOS={() => (
            <TouchableOpacity style={styles.cancelBtn} onPress={handleCancelFromDate}>
              <Text style={[constants.G_STYLE.BUTTON_TEXT, { color: constants.COLORS.BORDER_BUTTON_WHITE, fontSize: constants.SIZE.TEXT_LG }]}>Cancel</Text>
            </TouchableOpacity>
          )}
        /> */}
        {/* <DateTimePickerModal
          key='to'
          isVisible={visibleTo}
          mode='date'
          date={toDate}
          onConfirm={handleConfirmToDate}
          onCancel={handleCancelToDate}
          pickerContainerStyleIOS={{ backgroundColor: constants.COLORS.BACKGROUND_BLACK }}
          confirmTextIOS='Select'
          cancelTextIOS='Cancel'
          textColor={constants.COLORS.BACKGROUND_WHITE}
          buttonTextColorIOS={constants.COLORS.BORDER_BUTTON_WHITE}
          // customConfirmButtonIOS={() => (
          //   <TouchableOpacity style={styles.selectBtn} onPress={() => setVisibleTo(false)}>
          //     <Text style={[constants.G_STYLE.BUTTON_TEXT, { fontSize: constants.SIZE.TEXT_LG }]}>Select</Text>
          //   </TouchableOpacity>
          // )}
          customCancelButtonIOS={() => (
            <TouchableOpacity style={styles.cancelBtn} onPress={handleCancelToDate}>
              <Text style={[constants.G_STYLE.BUTTON_TEXT, { color: constants.COLORS.BORDER_BUTTON_WHITE, fontSize: constants.SIZE.TEXT_LG }]}>Cancel</Text>
            </TouchableOpacity>
          )}
        /> */}
      </Container>
    </Modal>
  )
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  sortby: {
    fontFamily: constants.FONTS.Space_Grotesk,
    fontSize: constants.SIZE.TEXT_MD2,
    fontWeight: '500',
    lineHeight: constants.LINE_HEIGHT.MD,
    color: constants.COLORS.BACKGROUND_WHITE,
    marginBottom: constants.SPACING.SM
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    alignContent: 'center',
    paddingVertical: constants.SPACING.SM
  },
  itemText: {
    fontFamily: constants.FONTS.Space_Grotesk,
    fontSize: constants.SIZE.TEXT_LG,
    fontWeight: '400',
    color: constants.COLORS.BACKGROUND_WHITE,
    marginLeft: constants.SPACING.MD
  },
  selectBtn: {
    width: '100%',
    height: 48,
    backgroundColor: constants.COLORS.BACKGROUND_BUTTON_PRIMARY,
    borderRadius: constants.SIZE.BORDER_RADIUS_LG,
    justifyContent: 'center',
    alignItems: 'center'
  },
  cancelBtn: {
    width: '100%',
    height: 48,
    backgroundColor: constants.COLORS.BACKGROUND_BLACK,
    borderWidth: 1,
    borderColor: constants.COLORS.BORDER_BUTTON_WHITE,
    borderRadius: constants.SIZE.BORDER_RADIUS_LG,
    justifyContent: 'center',
    alignItems: 'center'
  },
  dateRange: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: 40,
    width: '100%'
  },
  dateView: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    padding: constants.SPACING.SM,
    backgroundColor: constants.COLORS.BACKGROUND_BRIGHT_DARK,
    borderRadius: constants.SIZE.BORDER_RADIUS_MD,
    borderWidth: 1,
    borderColor: constants.COLORS.BACKGROUND_BRIGHT_DARK
  },
  label: {
    fontFamily: constants.FONTS.Space_Grotesk,
    fontSize: constants.SIZE.TEXT_MD2,
    color: constants.COLORS.TEXT_MUTED
  },
  dateText: {
    fontFamily: constants.FONTS.Space_Grotesk,
    fontSize: constants.SIZE.TEXT_LG,
    color: constants.COLORS.TEXT_WHITE
  }
});
