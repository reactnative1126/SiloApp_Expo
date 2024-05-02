import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { Image } from 'expo-image';

import constants from '../../utils/constants';

type AvatarProps = {
  name?: string,
  image?: string,
  width?: number,
  height?: number,
  radius?: number,
  size?: number,
  borderColor?: string,
  borderWidth?: number,
}

const getInitials = (name: string) => {
  const words = name.split(' ');
  return words
    .slice(0, 2) // Take the first two words
    .map((word) => word.charAt(0).toUpperCase()) // Get the first letter of each word
    .join(''); // Combine the initials
};

const getUsernameColor = (name: string) => {
  // Use a simple hash function to determine the color
  const hashCode = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return hash;
  };

  // Convert the hash code to a color in hexadecimal format
  const intToRGB = (i: number) => {
    const c = (i & 0x00FFFFFF).toString(16).toUpperCase();
    return '00000'.substring(0, 6 - c.length) + c;
  };

  const color = intToRGB(hashCode(name));
  return `#${color}`;
};

// Define the Avatar component
export default function Avatar(props: AvatarProps) {

  const initials = props.name && getInitials(props.name);
  const color = props.name && getUsernameColor(props.name);

  return (
    // (props.imageUrl && props.imageUrl.length) ? (
    //   <Image
    //     style={[styles.container, {
    //       width: props.width,
    //       height: props.height,
    //       borderRadius: props.radius,
    //     }]}
    //     source={{ uri: props.imageUrl }}
    //     contentFit='cover'
    //     transition={0}
    //   />
    // ) : (
    <View style={[styles.container, {
      width: props.width,
      height: props.height,
      borderRadius: props.radius,
      backgroundColor: color,
      borderWidth: props.borderWidth ? props.borderWidth : 0,
      borderColor: props.borderColor
    }]}>
      <Text style={[styles.initials, {
        fontSize: props.size
      }]}>{initials?.toUpperCase()}</Text>
    </View>
    // )
  )
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    fontFamily: constants.FONTS.Syne_Bold,
    fontWeight: 'bold',
    color: 'white'
  },
});
