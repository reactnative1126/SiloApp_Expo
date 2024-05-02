import * as React from 'react';
import {Text, View, StyleSheet} from 'react-native';

type AlertProps = {
  message: string | null;
}

// Define the alert component
export default function Alert(props: AlertProps) {

  if (!props.message) {
    return <Text></Text>;
  } else {
    return (
        <View>
          <Text style={styles.paragraph}>{props.message}</Text>
        </View>
    );
  }
}

const styles = StyleSheet.create({
  paragraph: {
    marginBottom: 12,
    fontSize: 14,
    color: 'red'
  },
});
